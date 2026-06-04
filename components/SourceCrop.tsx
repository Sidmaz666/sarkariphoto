"use client"

import * as React from "react"
import { useCallback, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { LockSimple, LockSimpleOpen, Plus, Minus, MagnifyingGlass } from "@phosphor-icons/react"

export type CropRegion = {
  x: number
  y: number
  width: number
  height: number
}

const HANDLE_SIZE = 12

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w"

const HANDLE_CURSORS: Record<Handle, string> = {
  nw: "cursor-nw-resize",
  n: "cursor-n-resize",
  ne: "cursor-ne-resize",
  e: "cursor-e-resize",
  se: "cursor-se-resize",
  s: "cursor-s-resize",
  sw: "cursor-sw-resize",
  w: "cursor-w-resize",
}

interface SourceCropProps {
  imageUrl: string
  aspectRatio: number
  crop: CropRegion
  onChange: (crop: CropRegion) => void
  onCropEnd?: (crop: CropRegion) => void
  className?: string
}

function fitContain(cw: number, ch: number, iw: number, ih: number) {
  const scale = Math.min(cw / iw, ch / ih)
  return { w: iw * scale, h: ih * scale, scale }
}

export function SourceCrop({
  imageUrl,
  aspectRatio,
  crop,
  onChange,
  onCropEnd,
  className,
}: SourceCropProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imgNatural, setImgNatural] = useState({ w: 1, h: 1 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [lockAspect, setLockAspect] = useState(true)
  const [drag, setDrag] = useState<{
    type: "move" | Handle
    startX: number
    startY: number
    crop: CropRegion
  } | null>(null)
  const [bgDrag, setBgDrag] = useState<{
    startX: number
    startY: number
    px: number
    py: number
  } | null>(null)

  React.useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }) }, [imageUrl])

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  const container = containerRef.current
  const cw = container?.clientWidth ?? 400
  const ch = container?.clientHeight ?? 400
  const fit = fitContain(cw, ch, imgNatural.w, imgNatural.h)
  const imgW = fit.w * zoom
  const imgH = fit.h * zoom
  const imgX = (cw - imgW) / 2 + pan.x
  const imgY = (ch - imgH) / 2 + pan.y

  const rect = {
    x: imgX + crop.x * imgW,
    y: imgY + crop.y * imgH,
    w: crop.width * imgW,
    h: crop.height * imgH,
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    const el = e.target as HTMLElement
    const handleType = el.dataset.cropHandle as Handle | undefined
    if (handleType) {
      setDrag({ type: handleType, startX: e.clientX, startY: e.clientY, crop: { ...crop } })
      el.setPointerCapture(e.pointerId)
      e.preventDefault()
      return
    }
    if (el.dataset.cropMove) {
      setDrag({ type: "move", startX: e.clientX, startY: e.clientY, crop: { ...crop } })
      el.setPointerCapture(e.pointerId)
      e.preventDefault()
      return
    }
    if (zoom > 1) {
      setBgDrag({ startX: e.clientX, startY: e.clientY, px: pan.x, py: pan.y })
      el.setPointerCapture?.(e.pointerId)
      e.preventDefault()
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (bgDrag) {
      setPan({ x: bgDrag.px + e.clientX - bgDrag.startX, y: bgDrag.py + e.clientY - bgDrag.startY })
      return
    }
    if (!drag) return
    const unitW = imgW
    const unitH = imgH
    const dx = (e.clientX - drag.startX) / unitW
    const dy = (e.clientY - drag.startY) / unitH
    let c = { ...drag.crop }

    if (drag.type === "move") {
      c.x = clamp(drag.crop.x + dx, 0, 1 - drag.crop.width)
      c.y = clamp(drag.crop.y + dy, 0, 1 - drag.crop.height)
    } else {
      const handle = drag.type as Handle
      let newX = c.x, newY = c.y, newW = c.width, newH = c.height
      const handleLeft = handle.includes("w")
      const handleRight = handle.includes("e")
      const handleTop = handle.includes("n")
      const handleBottom = handle.includes("s")

      if (handleRight) newW = clamp(c.width + dx, 0.05, 1 - c.x)
      if (handleBottom) newH = clamp(c.height + dy, 0.05, 1 - c.y)
      if (handleLeft) {
        const maxW = c.x + c.width
        newW = clamp(c.width - dx, 0.05, maxW)
        newX = clamp(maxW - newW, 0, maxW - 0.05)
      }
      if (handleTop) {
        const maxH = c.y + c.height
        newH = clamp(c.height - dy, 0.05, maxH)
        newY = clamp(maxH - newH, 0, maxH - 0.05)
      }

      if (lockAspect) {
        const ar = aspectRatio
        if (handleRight && !handleLeft && !handleTop && !handleBottom) {
          newW = clamp(newW, 0.05, 1 - c.x)
          newH = newW / ar
        } else if (handleLeft && !handleRight) {
          newW = clamp(newW, 0.05, c.x + c.width)
          newH = newW / ar
          newX = clamp(c.x + c.width - newW, 0, 1 - newW)
        } else if (handleBottom && !handleTop && !handleLeft && !handleRight) {
          newH = clamp(newH, 0.05, 1 - c.y)
          newW = newH * ar
        } else if (handleTop && !handleBottom) {
          newH = clamp(newH, 0.05, c.y + c.height)
          newW = newH * ar
          newY = clamp(c.y + c.height - newH, 0, 1 - newH)
        } else {
          const fromW = newW
          const fromH = newH
          if (fromW / fromH > ar) {
            newW = fromH * ar
          } else {
            newH = fromW / ar
          }
        }
      }

      c = { x: newX, y: newY, width: clamp(newW, 0.05, 0.95), height: clamp(newH, 0.05, 0.95) }
    }

    onChange(c)
  }

  const handlePointerUp = () => {
    if (bgDrag) { setBgDrag(null); return }
    if (drag) { setDrag(null); onCropEnd?.(crop); return }
  }

  const zoomIn = () => setZoom((z) => clamp(z * 1.3, 0.5, 10))
  const zoomOut = () => setZoom((z) => clamp(z / 1.3, 0.5, 10))
  const zoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-black select-none",
        zoom > 1 ? "cursor-grab active:cursor-grabbing" : "",
        className,
      )}
      style={{ touchAction: "none", willChange: "transform" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Image with position/size updated for zoom and pan */}
      <img
        src={imageUrl}
        alt="Crop source"
        className="block absolute"
        draggable={false}
        style={{
          left: imgX,
          top: imgY,
          width: imgW,
          height: imgH,
          willChange: "transform",
        }}
        onLoad={(e) => {
          const img = e.currentTarget
          setImgNatural({ w: img.naturalWidth, h: img.naturalHeight })
          setImageLoaded(true)
        }}
      />

      {imageLoaded && (
        <>
          {/* Dim overlay outside crop */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute bg-black/60" style={{ left: 0, top: 0, right: 0, height: Math.max(0, rect.y) }} />
            <div className="absolute bg-black/60" style={{ left: 0, top: rect.y + rect.h, right: 0, bottom: 0 }} />
            <div className="absolute bg-black/60" style={{ left: 0, top: rect.y, width: Math.max(0, rect.x), height: rect.h }} />
            <div className="absolute bg-black/60" style={{ left: rect.x + rect.w, top: rect.y, right: 0, height: rect.h }} />
          </div>

          {/* Crop rectangle */}
          <div
            data-crop-move
            className="absolute border-2 border-white/80 pointer-events-auto z-10"
            style={{
              left: rect.x,
              top: rect.y,
              width: rect.w,
              height: rect.h,
              cursor: drag?.type === "move" ? "grabbing" : "grab",
            }}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
              <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="white" strokeWidth="0.5" />
              <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="white" strokeWidth="0.5" />
              <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="white" strokeWidth="0.5" />
              <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="white" strokeWidth="0.5" />
            </svg>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLockAspect(!lockAspect) }}
              className="absolute -top-8 right-0 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-white hover:bg-black/90 transition-colors pointer-events-auto"
            >
              {lockAspect ? <LockSimple className="h-2.5 w-2.5" weight="fill" /> : <LockSimpleOpen className="h-2.5 w-2.5" />}
              {aspectRatio.toFixed(2)}
            </button>

            {/* Corner handles */}
            {(["nw", "ne", "se", "sw"] as Handle[]).map((h) => {
              const isRight = h.includes("e")
              const isBottom = h.includes("s")
              return (
                <div
                  key={h}
                  data-crop-handle={h}
                  className={cn(
                    "absolute w-3 h-3 bg-white border-2 border-black/40 rounded-sm pointer-events-auto z-10",
                    HANDLE_CURSORS[h],
                  )}
                  style={{
                    [isRight ? "right" : "left"]: -HANDLE_SIZE / 2,
                    [isBottom ? "bottom" : "top"]: -HANDLE_SIZE / 2,
                  }}
                />
              )
            })}

            {/* Edge handles */}
            {(["n", "e", "s", "w"] as Handle[]).map((h) => {
              const horiz = h === "e" || h === "w"
              const right = h === "e"
              const left = h === "w"
              const bottom = h === "s"
              const top = h === "n"
              return (
                <div
                  key={h}
                  data-crop-handle={h}
                  className={cn(
                    "absolute bg-white border border-black/30 rounded-sm pointer-events-auto z-10",
                    HANDLE_CURSORS[h],
                  )}
                  style={{
                    width: horiz ? HANDLE_SIZE : 6,
                    height: horiz ? 6 : HANDLE_SIZE,
                    [right ? "right" : left ? "left" : "left"]: horiz ? -HANDLE_SIZE / 2 : "50%",
                    [bottom ? "bottom" : top ? "top" : "top"]: !horiz ? -HANDLE_SIZE / 2 : "50%",
                    transform: horiz ? "translateY(-50%)" : "translateX(-50%)",
                  }}
                />
              )
            })}
          </div>

          {/* Zoom controls */}
          <div className="absolute top-3 right-3 flex items-center gap-1 z-20 pointer-events-none">
            <div className="flex items-center gap-1 rounded bg-black/60 px-1.5 py-1 pointer-events-auto">
              <button type="button" onClick={zoomOut} className="flex items-center justify-center w-6 h-6 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors" title="Zoom out">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={zoomReset} className="flex items-center justify-center px-1.5 h-6 rounded text-[10px] font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap" title="Reset zoom">
                <MagnifyingGlass className="h-3 w-3 mr-0.5" />
                {Math.round(zoom * 100)}%
              </button>
              <button type="button" onClick={zoomIn} className="flex items-center justify-center w-6 h-6 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors" title="Zoom in">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded bg-black/60 px-3 py-1 text-[10px] text-white/90 backdrop-blur-sm pointer-events-none z-20 whitespace-nowrap">
            <span>{Math.round(crop.width * 100)}×{Math.round(crop.height * 100)}%</span>
            <span className="text-white/50">·</span>
            <span>{aspectRatio.toFixed(2)} : 1</span>
          </div>
        </>
      )}
    </div>
  )
}
