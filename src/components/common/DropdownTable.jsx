"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

/* ===================================================
   GLOBAL ACTIVE DROPDOWN → memastikan hanya satu
   =================================================== */
let activeDropdown = null;

const DropdownContext = createContext(null);

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Tutup dropdown lain ketika ini dibuka
  useEffect(() => {
    if (open) {
      if (activeDropdown && activeDropdown !== setOpen) {
        activeDropdown(false);
      }
      activeDropdown = setOpen;
    }
  }, [open]);

  // Tutup on scroll / resize / click outside
  useEffect(() => {
    if (!open) return;

    function closeAll() {
      setOpen(false);
    }

    function clickOutside(e) {
      if (
        !menuRef.current ||
        !triggerRef.current ||
        menuRef.current.contains(e.target) ||
        triggerRef.current.contains(e.target)
      )
        return;
      setOpen(false);
    }

    window.addEventListener("scroll", closeAll, true);
    window.addEventListener("resize", closeAll);
    document.addEventListener("mousedown", clickOutside);

    return () => {
      window.removeEventListener("scroll", closeAll, true);
      window.removeEventListener("resize", closeAll);
      document.removeEventListener("mousedown", clickOutside);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef, menuRef, menuPos, setMenuPos }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children }) {
  const { open, setOpen, triggerRef, setMenuPos } = useContext(DropdownContext);

  const handleOpen = (e) => {
    e.stopPropagation();
    const rect = triggerRef.current.getBoundingClientRect();

    setMenuPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.right - 180 + window.scrollX, // width dropdown 180px
    });

    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onClick: handleOpen,
    });
  }

  return (
    <button ref={triggerRef} onClick={handleOpen}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children }) {
  const { open, menuRef, menuPos } = useContext(DropdownContext);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="absolute z-[9999] bg-white border shadow-xl rounded-xl min-w-[180px] overflow-hidden"
          style={{
            position: "absolute",
            top: menuPos.top,
            left: menuPos.left,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function DropdownMenuItem({ children, onClick, className }) {
  const { setOpen } = useContext(DropdownContext);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
        setOpen(false);
      }}
      className={`w-50 md:w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 ${className}`}
    >
      {children}
    </button>
  );
}
