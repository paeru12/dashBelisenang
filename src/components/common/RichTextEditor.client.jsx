"use client";

import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Dropcursor from "@tiptap/extension-dropcursor";
import Placeholder from "@tiptap/extension-placeholder";

import { imageUpload } from "@/lib/imageUploadsApi";

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Type,
} from "lucide-react";

// -------------------------------
// SLASH COMMAND
// -------------------------------
import { Extension } from "@tiptap/core";

const SlashCommand = Extension.create({
  name: "slash-command",

  addKeyboardShortcuts() {
    return {
      "/": () => {
        this.options?.onOpen?.();
        return false;
      },
    };
  },
});

// -------------------------------
// SLASH MENU UI
// -------------------------------
function SlashMenu({ open, editor, onClose }) {
  if (!open) return null;

  const insertImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files[0];
      const url = await imageUpload(file);

      editor.chain().focus().setImage({ src: url }).run();
    };

    input.click();
  };

  const items = [
    { label: "Heading", action: () => editor.chain().focus().setHeading({ level: 2 }).run() },
    { label: "Paragraph", action: () => editor.chain().focus().setParagraph().run() },
    { label: "Image", action: insertImage },
    { label: "Bullet List", action: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Quote", action: () => editor.chain().focus().toggleBlockquote().run() },
  ];

  return (
    <div className="absolute bg-white shadow-xl rounded-lg p-2 w-48 z-[999] mt-10 ml-2">
      {items.map((item) => (
        <div
          key={item.label}
          onClick={() => {
            item.action();
            onClose();
          }}
          className="px-3 py-2 cursor-pointer hover:bg-slate-100 rounded text-sm"
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}

// -------------------------------
// MAIN EDITOR
// -------------------------------
export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Tulis deskripsi event di sini...",
}) {
  const [slashOpen, setSlashOpen] = useState(false);

  const editor = useEditor({
    content: value,
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Dropcursor,
      Heading.configure({ levels: [1, 2, 3, 4, 5] }),
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
      SlashCommand.configure({
        onOpen: () => setSlashOpen(true),
      }),
    ],

    editorProps: {
      handleDrop(view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (!file) return;

        event.preventDefault();

        imageUpload(file).then((url) => {
          view.dispatch(
            view.state.tr.replaceSelectionWith(
              view.state.schema.nodes.image.create({ src: url })
            )
          );
        });
      },

      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[180px] border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white",
      },
    },

    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  const Btn = ({ icon: Icon, onClick, active }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-md hover:bg-blue-100 ${
        active ? "bg-blue-100 text-blue-600" : "text-gray-700"
      }`}
    >
      <Icon size={17} />
    </button>
  );

  const insertLink = async () => {
    const url = prompt("Masukkan URL:");
    if (!url) return;

    editor.chain().focus().setLink({ href: url }).run();
  };

  const insertImageUrl = () => {
    const url = prompt("Masukkan URL gambar:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="w-full relative">
      {/* Toolbar */}
      <div className="flex items-center gap-1 bg-white border rounded-lg p-2 mb-2 shadow-sm">
        <Btn icon={Type} onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()} active={editor.isActive("heading")} />
        <Btn icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
        <Btn icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} />
        <Btn icon={List} onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} />
        <Btn icon={ListOrdered} onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} />
        <Btn icon={LinkIcon} onClick={insertLink} />
        <Btn icon={ImageIcon} onClick={insertImageUrl} />
        <Btn icon={Undo} onClick={() => editor.chain().focus().undo().run()} />
        <Btn icon={Redo} onClick={() => editor.chain().focus().redo().run()} />
      </div>

      <SlashMenu open={slashOpen} editor={editor} onClose={() => setSlashOpen(false)} />

      <EditorContent editor={editor} />
    </div>
  );
}