import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function readHeader(headers: any, name: string) {
  return headers?.[name.toLowerCase()] ?? headers?.get?.(name);
}

export function getRetryAfterSeconds(error: any, fallbackSeconds = 15) {
  const headers = error?.response?.headers;
  const retryAfter = readHeader(headers, "retry-after");
  if (retryAfter !== undefined) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds > 0) return Math.ceil(seconds);
    const dateSeconds = Math.ceil((Date.parse(String(retryAfter)) - Date.now()) / 1000);
    if (Number.isFinite(dateSeconds) && dateSeconds > 0) return dateSeconds;
  }

  const bodySeconds = Number(error?.response?.data?.retryAfterSeconds);
  if (Number.isFinite(bodySeconds) && bodySeconds > 0) return Math.ceil(bodySeconds);

  const reset = readHeader(headers, "ratelimit-reset");
  const resetValue = Number(reset);
  if (Number.isFinite(resetValue) && resetValue > 0) {
    return Math.ceil(resetValue > Date.now() / 1000 ? resetValue - Date.now() / 1000 : resetValue);
  }

  return fallbackSeconds;
}

type Props = {
  retryAt: number | null;
  onOpenChange: (open: boolean) => void;
};

export default function RateLimitDialog({ retryAt, onOpenChange }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (retryAt === null) return;
    const updateCountdown = () => setSecondsLeft(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)));
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 250);
    return () => window.clearInterval(timer);
  }, [retryAt]);

  return (
    <Dialog open={retryAt !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <Info aria-hidden="true" className="size-5" />
          </div>
          <DialogTitle>Malo uspori sa slanjem</DialogTitle>
          <DialogDescription>
            Poslato je previše zahteva u kratkom vremenu. Sačekaj još <strong>{secondsLeft} {secondsLeft === 1 ? "sekundu" : secondsLeft >= 2 && secondsLeft <= 4 ? "sekunde" : "sekundi"}</strong>, pa pokušaj ponovo. Tvoj odgovor ostaje sačuvan na ovoj stranici.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {secondsLeft > 0 ? "Razumem" : "U redu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
