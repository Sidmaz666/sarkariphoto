"use client"

import * as React from "react"
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Plus, Minus, MagnifyingGlass, Check, ArrowCounterClockwise, ArrowClockwise } from "@phosphor-icons/react"

interface CropOverlayProps {
  imageUrl: string
  bgColor: string
  aspectRatio: number
  offsetX: number
  offsetY: number
  scale: number
  /** Classes for the image viewport only (e.g. max-height) */
  imageClassName?: string
  className?: string
  onOffsetChange: (x: number, y: number) => void
  onScaleChange: (s: number) => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onSave?: () => void
  onCancel?: () => void
  /** Called when a drag/resize gesture ends (for history snapshots) */
  onInteractionEnd?: () => void
  /** Hide built-in toolbar (parent renders EditToolbar) */
  hideToolbar?: boolean
}

export function CropOverlay({
  imageUrl,
  bgColor,
  aspectRatio,
  offsetX,
  offsetY,
  scale,
  imageClassName,
  className,
  onOffsetChange,
  onScaleChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSave,
  onCancel,
  onInteractionEnd,
  hideToolbar = false,
}: CropOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [mode, setMode] = useState<"idle" | "move" | "resize">("idle")
  const startRef = useRef({ x: 0, y: 0, ox: 0, oy: 0, s: 1 })

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  const handlePointerDown = (e: React.PointerEvent) => {
    const el = e.target as HTMLElement
    if (el.dataset.resize) {
      setMode("resize")
      startRef.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY, s: scale }
      el.setPointerCapture(e.pointerId)
      e.preventDefault()
      return
    }
    setMode("move")
    startRef.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY, s: scale }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    e.preventDefault()
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (mode === "resize") {
      const dy = e.clientY - startRef.current.y
      const newScale = clamp(startRef.current.s + dy / 150, 0.3, 5)
      onScaleChange(Math.round(newScale * 20) / 20)
      return
    }
    if (mode !== "move") return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    onOffsetChange(startRef.current.ox + dx, startRef.current.oy + dy)
  }

  const handlePointerUp = () => {
    if (mode !== "idle") onInteractionEnd?.()
    setMode("idle")
  }

  const endZoom = () => onInteractionEnd?.()
  const zoomIn = () => {
    onScaleChange(Math.round(clamp(scale * 1.2, 0.3, 5) * 20) / 20)
    endZoom()
  }
  const zoomOut = () => {
    onScaleChange(Math.round(clamp(scale / 1.2, 0.3, 5) * 20) / 20)
    endZoom()
  }
  const zoomReset = () => {
    onScaleChange(1)
    onOffsetChange(0, 0)
    endZoom()
  }

  return (
    <div className={cn(className)}>
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden select-none w-full",
          imageClassName,
        )}
        style={{
          backgroundColor: bgColor,
          aspectRatio: `${aspectRatio}`,
          touchAction: "none",
          willChange: "transform",
          cursor: mode === "move" ? "grabbing" : mode === "resize" ? "ns-resize" : "grab",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Hidden img to detect load */}
        <img src={imageUrl} alt="" className="hidden" onLoad={() => setImgLoaded(true)} />

        {/* The result image — the user sees their current output and adjusts it */}
        {imgLoaded && (
          <img
            src={imageUrl}
            alt="Reposition"
            draggable={false}
            className="block w-full h-full"
            style={{
              objectFit: "cover",
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
              willChange: "transform",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Resize handle at bottom center */}
        <div
          data-resize
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto cursor-ns-resize"
        >
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 shadow-md border border-border hover:bg-white transition-colors select-none">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-foreground">
              <path d="M3 11L11 3M3 7L7 3M7 11L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] font-medium text-foreground">{Math.round(scale * 100)}%</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-foreground">
              <path d="M11 11L3 3M11 7L7 3M7 11L3 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Zoom controls top-right */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <div className="flex items-center gap-0.5 rounded-lg bg-black/60 px-1 py-1 pointer-events-auto shadow-sm">
            <button type="button" onClick={zoomOut} className="flex items-center justify-center w-7 h-7 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" title="Zoom out">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={zoomReset} className="flex items-center justify-center px-2 h-7 rounded text-[10px] font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap" title="Reset zoom">
              <MagnifyingGlass className="h-3 w-3 mr-0.5" />
              {Math.round(scale * 100)}%
            </button>
            <button type="button" onClick={zoomIn} className="flex items-center justify-center w-7 h-7 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" title="Zoom in">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Help text */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <span className="rounded bg-black/50 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
            Drag to move · Bottom handle or buttons to resize
          </span>
        </div>
      </div>

      {!hideToolbar && onSave && onCancel && onUndo && onRedo && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button type="button" onClick={onUndo} disabled={!canUndo} className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-foreground/70 hover:bg-muted disabled:opacity-30 transition-colors">
              <ArrowCounterClockwise className="h-3 w-3" />
              Undo
            </button>
            <button type="button" onClick={onRedo} disabled={!canRedo} className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-foreground/70 hover:bg-muted disabled:opacity-30 transition-colors">
              <ArrowClockwise className="h-3 w-3" />
              Redo
            </button>
          </div>
          <div className="flex-1" />
          <button type="button" onClick={onCancel} className="rounded border border-border px-3 py-1 text-[11px] text-foreground/70 hover:bg-muted transition-colors">
            Cancel
          </button>
          <button type="button" onClick={onSave} className="flex items-center gap-1.5 rounded bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Check className="h-3.5 w-3.5" weight="bold" />
            Save
          </button>
        </div>
      )}
    </div>
  )
}
