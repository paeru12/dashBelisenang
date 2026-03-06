"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

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

export default function RichTextEditorCore({
  value = "",
  onChange,
  placeholder = "Tulis deskripsi event di sini...",
}) {
  const editor = useEditor({
    content: value,
    immediatelyRender: false, // ⭐ NEXT.JS 16 FIX
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: "list-disc ml-6" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ml-6" } },
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({ autolink: true }),
      Image,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[100px]  p-4 focus:outline-none focus:ring-2 focus:ring-blue-400",
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

  const handleImageInsert = () => {
    const url = prompt("Masukkan URL gambar:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const handleLink = () => {
    const url = prompt("Masukkan URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="w-full border">
      {/* Toolbar */}
      <div className="flex items-center gap-1 bg-white border-b p-2">
        {/* <Btn icon={Type} onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()} active={editor.isActive("heading")} /> */}
        <Btn icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
        <Btn icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} />
        <Btn icon={List} onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} />
        <Btn icon={ListOrdered} onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} />
        {/* <Btn icon={LinkIcon} onClick={handleLink} />
        <Btn icon={ImageIcon} onClick={handleImageInsert} /> */}
        <Btn icon={Undo} onClick={() => editor.chain().focus().undo().run()} />
        <Btn icon={Redo} onClick={() => editor.chain().focus().redo().run()} />
      </div>

      <EditorContent editor={editor} />

      {!value && (
        <p className="text-sm text-gray-400 -translate-y-7 pointer-events-none pl-4">
          {placeholder}
        </p>
      )}
    </div>
  );
}