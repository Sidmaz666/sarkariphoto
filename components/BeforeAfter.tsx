"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Image as ImageIcon } from "@phosphor-icons/react"

interface BeforeAfterProps {
  beforeUrl: string
  afterUrl: string
  beforeLabel?: string
  afterLabel?: string
  aspectRatio?: number
  className?: string
}

export function BeforeAfter({
  beforeUrl,
  afterUrl,
  beforeLabel = "Original",
  afterLabel = "Processed",
  aspectRatio,
  className,
}: BeforeAfterProps) {
  const [loaded, setLoaded] = React.useState({ before: false, after: false })

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-muted grid grid-cols-2 gap-1 p-1",
        className,
      )}
      style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : undefined }}
    >
      {(!loaded.before || !loaded.after) && (
        <div className="absolute inset-0 col-span-2 flex items-center justify-center z-10 bg-muted/80 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ImageIcon className="h-4 w-4 animate-pulse" />
            Loading preview…
          </div>
        </div>
      )}

      {/* Before (left) */}
      <div className="relative flex items-center justify-center overflow-hidden rounded border border-border bg-[conic-gradient(at_50%_50%,_oklch(0.95_0.01_250)_0deg,_oklch(0.97_0.01_250)_90deg,_oklch(0.95_0.01_250)_180deg,_oklch(0.97_0.01_250)_270deg)]">
        <img
          src={beforeUrl}
          alt={beforeLabel}
          className="block object-contain"
          draggable={false}
          onLoad={() => setLoaded((p) => ({ ...p, before: true }))}
          style={{
            opacity: loaded.before ? 1 : 0,
            transition: "opacity 0.2s",
            width: "100%",
            height: "100%",
          }}
        />
        <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {beforeLabel}
        </span>
      </div>

      {/* After (right) */}
      <div className="relative flex items-center justify-center overflow-hidden rounded border border-border bg-[conic-gradient(at_50%_50%,_oklch(0.95_0.01_250)_0deg,_oklch(0.97_0.01_250)_90deg,_oklch(0.95_0.01_250)_180deg,_oklch(0.97_0.01_250)_270deg)]">
        <img
          src={afterUrl}
          alt={afterLabel}
          className="block object-contain"
          draggable={false}
          onLoad={() => setLoaded((p) => ({ ...p, after: true }))}
          style={{
            opacity: loaded.after ? 1 : 0,
            transition: "opacity 0.2s",
            width: "100%",
            height: "100%",
          }}
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {afterLabel}
        </span>
      </div>
    </div>
  )
}
