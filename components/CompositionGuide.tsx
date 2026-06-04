"use client"

import { cn } from "@/lib/utils"

interface CompositionGuideProps {
  className?: string
}

export function CompositionGuide({ className }: CompositionGuideProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none z-10", className)}>
      {/* Head oval */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%]">
        <svg width="200" height="260" viewBox="0 0 200 260" className="w-32 h-40 sm:w-44 sm:h-56">
          {/* Outer oval - acceptable head size range */}
          <ellipse cx="100" cy="120" rx="65" ry="85" fill="none" stroke="rgba(34,197,94,0.35)" strokeWidth="2" strokeDasharray="6,4" />
          {/* Inner oval - minimum head size */}
          <ellipse cx="100" cy="120" rx="45" ry="60" fill="none" stroke="rgba(34,197,94,0.25)" strokeWidth="1.5" strokeDasharray="4,3" />
          {/* Target head area - filled */}
          <ellipse cx="100" cy="120" rx="52" ry="70" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" />
          {/* Center crosshair */}
          <line x1="100" y1="10" x2="100" y2="70" stroke="rgba(34,197,94,0.4)" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="100" y1="170" x2="100" y2="250" stroke="rgba(34,197,94,0.4)" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="20" y1="120" x2="80" y2="120" stroke="rgba(34,197,94,0.4)" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="120" y1="120" x2="180" y2="120" stroke="rgba(34,197,94,0.4)" strokeWidth="1" strokeDasharray="3,3" />
          {/* Eye line guide */}
          <line x1="30" y1="85" x2="170" y2="85" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" strokeDasharray="5,3" />
          <circle cx="75" cy="85" r="3" fill="rgba(34,197,94,0.6)" />
          <circle cx="125" cy="85" r="3" fill="rgba(34,197,94,0.6)" />
          {/* Labels */}
          <text x="100" y="235" textAnchor="middle" fill="rgba(34,197,94,0.6)" fontSize="10" fontFamily="monospace">
            Face guide
          </text>
        </svg>
      </div>
    </div>
  )
}
