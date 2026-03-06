"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
export default function BaseModal({
  open,
  onClose,
  title = "",
  children,
  maxWidth = "max-w-4xl",
}) {
  // ESC CLOSE
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose?.();
    }

    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // click outside
        >
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 200 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 120) onClose();
            }}
            initial={{ y: 80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            onClick={(e) => e.stopPropagation()} // prevent close inside
            className={`w-full ${maxWidth} h-[90vh] md:max-h-[90vh] bg-white md:rounded-2xl shadow-2xl flex flex-col`}
          >
            {/* HEADER BUILT-IN */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{title}</h2>

              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* BODY */}
            <div
              className="flex-1 overflow-y-auto px-4 md:px-6 py-6 scroll-smooth scrolly"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
