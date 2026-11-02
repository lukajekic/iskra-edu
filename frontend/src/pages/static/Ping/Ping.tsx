import React, { useState } from "react";
import { Play, RefreshCw, CheckCircle2, AlertTriangle, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PingServerPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePing = async () => {
    setStatus("loading");
    setErrorMessage(null);

    const baseUrl = import.meta.env.VITE_BACKEND || "";
    const pingEndpoint = `${baseUrl.replace(/\/$/, "")}/ping`;

    try {
      const response = await fetch(pingEndpoint, { method: "GET" });
      const data = await response.json();

      if (response.ok && data.status === "OK") {
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
        }, 2500);
      } else {
        throw new Error(`Neočekivan odgovor (Status: ${response.status})`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Server nije odgovorio.");
      setStatus("error");
      setTimeout(() => {
        setStatus("idle");
      }, 2500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      {/* Glavni Shadcn Card */}
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Server className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Render Cold-Start Warmup
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Priprema okruženja pre početka prezentacije uživo
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="leading-relaxed">
              Dugme ispod šalje upit na <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">/ping</code> endpont radi buđenja bezplatne ili neaktivne Render instunce.
            </p>
            <p className="mt-2 font-medium text-foreground">
              Pokreni ovo pre početka Pitch-a uživo kako demo ne bi čekao cold start!
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
              {errorMessage}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={handlePing}
            size="lg"
            className="w-full font-semibold shadow-md transition-all active:scale-[0.98]"
          >
            {errorMessage ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5" /> Pokušaj ponovo
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5 fill-current" /> Pokreni Server (Ping)
              </>
            )}
          </Button>

          {errorMessage && (
            <p className="text-center text-xs text-muted-foreground">
              Preporučuje se još jedan klik kako bi se potvrdio odziv.
            </p>
          )}
        </CardFooter>
      </Card>

      {/* Fullscreen Overlay Modal */}
      {status !== "idle" && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${
            status === "loading"
              ? "animate-pulse bg-yellow-500 text-black"
              : status === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-20 w-20 animate-spin" />
              <h2 className="text-4xl font-extrabold tracking-tight">COLD START U TOKU...</h2>
              <p className="text-xl font-medium opacity-90">
                Budimo Render instancu. Ovo može potrajati 20–50 sekundi.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-24 w-24 animate-bounce" />
              <h2 className="text-5xl font-extrabold tracking-tight">SERVER JE SPREMAN!</h2>
              <p className="text-2xl font-medium">Sve je podignuto. Srećno na Pitch-u! 🚀</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <AlertTriangle className="h-24 w-24 animate-bounce" />
              <h2 className="text-5xl font-extrabold tracking-tight">GREŠKA PRI PINGU!</h2>
              <p className="text-2xl font-medium">
                Server se nije odazvao na vreme ili je vratio grešku.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}