import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QrScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: { orderId: string; token: string }) => void;
}

export function QrScanner({ open, onClose, onScan }: QrScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>("qr-scanner-" + Math.random().toString(36).slice(2));

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    let isRunning = false;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(containerRef.current);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            try {
              const data = JSON.parse(decodedText);
              if (data.orderId && data.token) {
                isRunning = false;
                scanner.stop().catch(() => {});
                if (mounted) onScan(data);
              }
            } catch {
              // Not valid JSON QR, ignore
            }
          },
          () => {} // ignore scan failures
        );
        isRunning = true;
      } catch (err) {
        if (mounted) setError("Unable to access camera. Please grant camera permission.");
      }
    };

    // Small delay to ensure DOM element exists
    const timeout = setTimeout(startScanner, 300);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      if (scannerRef.current && isRunning) {
        isRunning = false;
        scannerRef.current.stop().catch(() => {});
      }
      scannerRef.current = null;
    };
  }, [open, onScan]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Scan Pickup QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            id={containerRef.current}
            className="w-full rounded-xl overflow-hidden bg-muted min-h-[280px]"
          />

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center">
              {error}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Point your camera at the customer's QR code to confirm pickup
          </p>

          <Button variant="outline" className="w-full" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
