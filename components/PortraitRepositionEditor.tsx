"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Plus, Minus, MagnifyingGlass } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import {
  applySourceCropToCanvas,
  computePortraitCropRect,
  ensureCropFits,
  renderPortraitOutputFrame,
  type AdjustmentOptions,
  type CropRegion,
} from "@/lib/photoProcessor"

interface PortraitRepositionEditorProps {
  cutoutUrl: string
  bgColor: string
  widthPx: number
  heightPx: number
  headHeightPct: number
  eyeLinePct: number
  sourceCrop?: CropRegion
  adjustments: AdjustmentOptions
  onOffsetChange: (x: number, y: number) => void
  onScaleChange: (s: number) => void
  onInteractionEnd?: () => void
  imageClassName?: string
}

export function PortraitRepositionEditor({
  cutoutUrl,
  bgColor,
  widthPx,
  heightPx,
  headHeightPct,
  eyeLinePct,
  sourceCrop,
  adjustments,
  onOffsetChange,
  onScaleChange,
  onInteractionEnd,
  imageClassName,
}: PortraitRepositionEditorProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cutoutRef = useRef<HTMLCanvasElement | null>(null)
  const [imgReady, setImgReady] = useState(false)
  const [mode, setMode] = useState<"idle" | "pan">("idle")
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 })
  const displayScaleRef = useRef(1)

  const { offsetX, offsetY, scale } = adjustments
  const aspectRatio = widthPx / heightPx
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  const frameOpts = useMemo(
    () => ({ widthPx, heightPx, bgColor, headHeightPct, eyeLinePct }),
    [widthPx, heightPx, bgColor, headHeightPct, eyeLinePct],
  )

  useEffect(() => {
    setImgReady(false)
    cutoutRef.current = null
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const raw = document.createElement("canvas")
      raw.width = img.naturalWidth
      raw.height = img.naturalHeight
      raw.getContext("2d")!.drawImage(img, 0, 0)
      cutoutRef.current = applySourceCropToCanvas(raw, sourceCrop)
      setImgReady(true)
    }
    img.onerror = () => setImgReady(false)
    img.src = cutoutUrl
  }, [cutoutUrl, sourceCrop])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const cutout = cutoutRef.current
    if (!canvas || !wrap || !cutout || !imgReady) return

    const rect = wrap.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const cw = Math.max(1, Math.floor(rect.width))
    const ch = Math.max(280, Math.floor(rect.height))
    canvas.width = Math.floor(cw * dpr)
    canvas.height = Math.floor(ch * dpr)
    canvas.style.width = `${cw}px`
    canvas.style.height = `${ch}px`

    const ctx = canvas.getContext("2d")!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, cw, ch)

    const crop = computePortraitCropRect(cutout, frameOpts, { offsetX, offsetY, scale })

    const composed = document.createElement("canvas")
    composed.width = cutout.width
    composed.height = cutout.height
    const cctx = composed.getContext("2d")!
    cctx.fillStyle = bgColor
    cctx.fillRect(0, 0, composed.width, composed.height)
    cctx.drawImage(cutout, 0, 0)

    const { canvas: srcCanvas, cropX, cropY } = ensureCropFits(
      composed,
      crop.cropX,
      crop.cropY,
      crop.cropW,
      crop.cropH,
      bgColor,
    )

    const frameW = Math.min(cw * 0.72, 360)
    const frameH = frameW / aspectRatio
    const frameX = (cw - frameW) / 2
    const frameY = (ch - frameH) / 2

    const s = frameW / crop.cropW
    displayScaleRef.current = s
    const drawX = frameX - cropX * s
    const drawY = frameY - cropY * s

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(srcCanvas, drawX, drawY, srcCanvas.width * s, srcCanvas.height * s)

    ctx.fillStyle = "rgba(0,0,0,0.45)"
    ctx.fillRect(0, 0, cw, frameY)
    ctx.fillRect(0, frameY + frameH, cw, ch - frameY - frameH)
    ctx.fillRect(0, frameY, frameX, frameH)
    ctx.fillRect(frameX + frameW, frameY, cw - frameX - frameW, frameH)

    const outputFrame = renderPortraitOutputFrame(cutout, frameOpts, adjustments)
    ctx.drawImage(outputFrame, frameX, frameY, frameW, frameH)

    ctx.strokeStyle = "rgba(255,255,255,0.95)"
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.strokeRect(frameX + 0.5, frameY + 0.5, frameW - 1, frameH - 1)
    ctx.setLineDash([])
    ctx.strokeStyle = "rgba(0,0,0,0.25)"
    ctx.lineWidth = 1
    ctx.strokeRect(frameX + 0.5, frameY + 0.5, frameW - 1, frameH - 1)
  }, [
    imgReady,
    bgColor,
    widthPx,
    heightPx,
    headHeightPct,
    eyeLinePct,
    offsetX,
    offsetY,
    scale,
    aspectRatio,
    adjustments,
    frameOpts.bgColor,
    frameOpts.widthPx,
    frameOpts.heightPx,
    frameOpts.headHeightPct,
    frameOpts.eyeLinePct,
  ])

  useEffect(() => {
    draw()
    const wrap = wrapRef.current
    if (!wrap) return
    const ro = new ResizeObserver(() => draw())
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [draw])

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-zoom-control]")) return
    setMode("pan")
    panStart.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    e.preventDefault()
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (mode !== "pan") return
    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
    const s = displayScaleRef.current || 1
    onOffsetChange(
      panStart.current.ox + dx / s,
      panStart.current.oy + dy / s,
    )
  }

  const handlePointerUp = () => {
    if (mode === "pan") onInteractionEnd?.()
    setMode("idle")
  }

  const zoomIn = () => {
    onScaleChange(Math.round(clamp(scale * 1.15, 0.3, 5) * 20) / 20)
    onInteractionEnd?.()
  }
  const zoomOut = () => {
    onScaleChange(Math.round(clamp(scale / 1.15, 0.3, 5) * 20) / 20)
    onInteractionEnd?.()
  }
  const zoomReset = () => {
    onScaleChange(1)
    onOffsetChange(0, 0)
    onInteractionEnd?.()
  }

  return (
    <div
      ref={wrapRef}
      className={cn("relative w-full min-h-[320px] max-h-[480px]", imageClassName)}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "block w-full h-full touch-none",
          mode === "pan" ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      <div className="absolute top-3 left-3 z-10 pointer-events-none max-w-[90%]">
        <span className="rounded bg-black/55 px-2 py-1 text-[10px] text-white/90 backdrop-blur-sm leading-snug">
          Dashed frame = exact saved portrait ({widthPx}×{heightPx})
        </span>
      </div>

      <div data-zoom-control className="absolute top-3 right-3 z-10">
        <div className="flex items-center gap-0.5 rounded-lg bg-black/60 px-1 py-1 shadow-sm">
          <button
            type="button"
            onClick={zoomOut}
            className="flex items-center justify-center w-7 h-7 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom out"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={zoomReset}
            className="flex items-center justify-center px-2 h-7 rounded text-[10px] font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
            title="Reset"
          >
            <MagnifyingGlass className="h-3 w-3 mr-0.5" />
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            className="flex items-center justify-center w-7 h-7 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom in"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
