"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedGradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

export function AnimatedGradientText({ 
  children, 
  className, 
  ...props 
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "animate-gradient bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
        className
      )}
      style={{
        "--bg-size": "400%",
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </span>
  )
}

// Add the animation to globals.css
export const animatedGradientTextStyle = `
@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  animation: gradient 3s ease infinite;
}
`