import React, { useEffect, useMemo, useState } from "react";
import { Coins, Euro } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface TokenBalanceProps {
  usedTokens: number;
  totalLimit: number;
  resetAt?: string | null;
}

export const TokenBalanceIndicator: React.FC<TokenBalanceProps> = ({
  usedTokens,
  totalLimit,
  resetAt = null,
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const resetTime = resetAt ? new Date(resetAt).getTime() : null;
  const resetIsDue = Boolean(resetTime && resetTime <= now);
  // Backend radi lazy refill pri sledećem AI zahtevu; UI nakon isteka verno prikazuje balans tog novog ciklusa.
  const remainingTokens = resetIsDue ? totalLimit : Math.max(0, totalLimit - usedTokens);
  const percentageUsed = resetIsDue ? 0 : Math.min(100, (usedTokens / totalLimit) * 100);
  const minutesToReset = resetTime && !resetIsDue ? Math.max(1, Math.ceil((resetTime - now) / 60_000)) : null;
  const resetLabel = useMemo(() => {
    if (!resetTime) return "Ciklus počinje pri prvom AI zahtevu.";
    if (resetIsDue) return "Refill je spreman — sledeći AI zahtev će u bazi vratiti 20k.";
    return `Dopuna kredita za ${minutesToReset} min.`;
  }, [minutesToReset, resetIsDue, resetTime]);

  // Formatiranje velikih brojeva (npr. 3070 -> 3.1k)
  const formatTokens = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
  };

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-help text-xs font-medium">
            <Euro className="w-4 h-4 text-primary" />
            <span className="font-mono text-foreground">
              {formatTokens(remainingTokens)} / {formatTokens(totalLimit)} Kredita preostalo
            </span>
          </div>
        </TooltipTrigger>
        
        <TooltipContent align="end" className="w-56 p-3 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Potrošeno danas:</span>
            <span className="font-mono text-white font-semibold">
              {usedTokens.toLocaleString()}
            </span>
          </div>
          
          <Progress 
            value={percentageUsed} 
            className="h-1 w-full bg-secondary [&>div]:bg-primary" 
          />
          
          <p className="text-[11px] text-muted-foreground leading-normal">
            Preostalo je još {remainingTokens.toLocaleString()} kredita u trenutnom satnom ciklusu.
          </p>
          <p className="text-[11px] leading-normal text-primary">
            {resetLabel}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
