"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface BorderBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  duration?: number
  borderWidth?: number
  colorFrom?: string
  colorTo?: string
  delay?: number
}

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  borderWidth = 1.5,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
  children,
  ...props
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-background p-px",
        className
      )}
      style={{
        "--size": size,
        "--duration": duration,
        "--border-width": borderWidth,
        "--color-from": colorFrom,
        "--color-to": colorTo,
        "--delay": `-${delay}s`,
      } as React.CSSProperties}
      {...props}
    >
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          padding: `${borderWidth}px`,
          background: `linear-gradient(90deg, ${colorFrom}, ${colorTo}, ${colorFrom})`,
          backgroundSize: `${size}% 100%`,
          animation: `border-beam ${duration}s infinite linear`,
          animationDelay: delay ? `${delay}s` : undefined,
        }}
      />
      <div className="relative z-10 h-full w-full rounded-xl bg-background">
        {children}
      </div>
    </div>
  )
}