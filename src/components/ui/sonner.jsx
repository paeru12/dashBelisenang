import { Toaster } from "sonner";

export function Sonner() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      expand
      duration={3000}
    />
  );
}
