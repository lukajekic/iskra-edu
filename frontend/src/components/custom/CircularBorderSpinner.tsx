import React from "react"
import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

export function CircularBorderSpinner({ className, size = "md", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-[3px]",
  }

  return (
    <div
      role="status"
      className={cn(
        "animate-spin rounded-full border-t-primary",
        sizeClasses[size],
        className
      )}
      style={{
        borderLeftColor: "#eeeeee",
        borderBottomColor: "#eeeeee",
        borderRightColor: "#eeeeee",
      }}
      {...props}
    >
    </div>
  )
}