import { motion, AnimatePresence } from "framer-motion";
import { useEscapeClose } from "@/hooks/useEscapeClose";

export default function ModalWrapper({ children, onClose }) {
  useEscapeClose(true, onClose);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // klik backdrop = close
      >
        <motion.div
          className="
            bg-white rounded-xl
            w-full max-w-5xl
            max-h-[90vh]
            flex flex-col
            shadow-xl
            relative
          "
          initial={{ scale: 0.96, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()} // ❗ stop bubble
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="
              absolute top-3 right-3 z-10
              text-slate-400 hover:text-slate-700
            "
            aria-label="Close"
          >
            ✕
          </button>

          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
