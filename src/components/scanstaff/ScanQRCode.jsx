"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { scanTicket } from "@/lib/scannerApi";
import { toast } from "sonner";

function getToastPosition() {
  if (typeof window === "undefined") return "top-right";
  return window.innerWidth < 768 ? "top-center" : "top-right";
}

export default function ScanQRCode({ assignmentId, eventId, gate }) {

  const router = useRouter();

  const scannerRef = useRef(null);
  const scanningRef = useRef(false);
  const startedRef = useRef(false);

  const successAudio = useRef(null);
  const errorAudio = useRef(null);

  const [counter, setCounter] = useState(0);

  useEffect(() => {

    successAudio.current = new Audio("/sounds/success.mp3");
    errorAudio.current = new Audio("/sounds/error.mp3");

  }, []);

  useEffect(() => {

    if (startedRef.current) return;
    startedRef.current = true;

    const startScanner = async () => {

      const { Html5Qrcode } = await import("html5-qrcode");

      const scanner = new Html5Qrcode("reader");

      scannerRef.current = scanner;

      try {

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1
          },
          onScanSuccess
        );

      } catch (err) {

        console.error("Camera start error:", err);

        toast.error("Gagal mengakses kamera", {
          position: getToastPosition()
        });

      }

    };

    startScanner();

    return stopScanner;

  }, []);

  const stopScanner = async () => {

    if (!scannerRef.current) return;

    try {

      await scannerRef.current.stop();
      await scannerRef.current.clear();

    } catch {}

    scannerRef.current = null;

  };

  const onScanSuccess = async (decodedText) => {

    if (scanningRef.current) return;

    scanningRef.current = true;

    let payload;

    try {

      payload = JSON.parse(decodedText);

    } catch {

      errorAudio.current.play();

      toast.error("QR tidak valid", {
        position: getToastPosition()
      });

      scanningRef.current = false;
      return;

    }

    try {

      const res = await scanTicket({

        ticket_code: payload.t,
        event_id: payload.e,
        signature: payload.s,
        gate,
        device_id: "scanner-browser",
        scan_source: "web"
      });

      successAudio.current.play();

      setCounter(v => v + 1);

      toast.success(`Tiket valid - ${res.data.data.owner_name}`, {
        position: getToastPosition()
      });

    } catch (err) {

      errorAudio.current.play();

      const message =
        err.response?.data?.message || "Tiket tidak valid";

      toast.error(message, {
        position: getToastPosition()
      });

    }

    setTimeout(() => {
      scanningRef.current = false;
    }, 800);

  };

  const handleBack = async () => {

    await stopScanner();

    router.push("/select-event");

  };

  return (

    <div className="max-w-md mx-auto">

      <div className="text-center mb-6">

        <h2 className="text-xl font-bold">
          Ticket Scanner
        </h2>

        <p className="text-sm text-slate-500">
          Assignment ID: {assignmentId}
        </p>

        <div className="mt-2 text-lg font-semibold text-green-600">
          Gate Scan Count: {counter}
        </div>

      </div>

      <div
        id="reader"
        className="w-full rounded-xl overflow-hidden shadow"
      />

      <div className="mt-6">

        <Button
          variant="outline"
          className="w-full"
          onClick={handleBack}
        >
          Ganti Event
        </Button>

      </div>

    </div>

  );

}
