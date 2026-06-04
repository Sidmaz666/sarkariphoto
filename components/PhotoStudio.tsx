"use client"

import * as React from "react"
import { useCallback, useMemo, useRef, useState } from "react"
import {
  Upload,
  Download,
  Sparkle,
  ArrowCounterClockwise,
  CheckCircle,
  WarningCircle,
  Image as ImageIcon,
  MagnifyingGlass,
  Sliders,
  LockSimple,
  LockSimpleOpen,
  Printer,
  Sun,
  CircleHalf,
  Drop,
  Palette,
  MagnifyingGlassPlus,
  Crop,
  Scan,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  PRESETS,
  processPhoto,
  reprocessPhoto,
  DEFAULT_ADJUSTMENTS,
  type ProcessResult,
  type ProcessOptions,
  type AdjustmentOptions,
  type PipelineStep,
  type CropRegion,
} from "@/lib/photoProcessor"

interface RepositionState {
  offsetX: number
  offsetY: number
  scale: number
}
import { cn } from "@/lib/utils"
import { BeforeAfter } from "@/components/BeforeAfter"
import { PipelineProgress } from "@/components/PipelineProgress"
import { CropOverlay } from "@/components/CropOverlay"
import { SourceCrop } from "@/components/SourceCrop"
import { CompositionGuide } from "@/components/CompositionGuide"
import { PrintDialog } from "@/components/PrintDialog"
import { EditToolbar } from "@/components/EditToolbar"

export default function PhotoStudio() {
  const [file, setFile] = useState<File | null>(null)
  const [previewURL, setPreviewURL] = useState<string | null>(null)
  const [presetId, setPresetId] = useState<string>("india-passport")
  const [presetSearch, setPresetSearch] = useState("")
  const [width, setWidth] = useState(200)
  const [height, setHeight] = useState(230)
  const [minKB, setMinKB] = useState(20)
  const [maxKB, setMaxKB] = useState(50)
  const [format, setFormat] = useState<"jpeg" | "png">("jpeg")
  const [bgColor, setBgColor] = useState("#FFFFFF")
  const [headPct, setHeadPct] = useState(70)
  const [eyePct, setEyePct] = useState(40)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState("")
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([])
  const [result, setResult] = useState<ProcessResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [adjustments, setAdjustments] = useState<AdjustmentOptions>(DEFAULT_ADJUSTMENTS)
  const [cutoutDataURL, setCutoutDataURL] = useState<string | null>(null)
  const [lockAspectRatio, setLockAspectRatio] = useState(true)
  const [showManualCrop, setShowManualCrop] = useState(false)
  const [showReposition, setShowReposition] = useState(false)
  const [showAutoDetect, setShowAutoDetect] = useState(true)
  const [showGuide, setShowGuide] = useState(false)
  const [sourceCrop, setSourceCrop] = useState<CropRegion>({ x: 0, y: 0, width: 1, height: 1 })
  const [cropHistory, setCropHistory] = useState<CropRegion[]>([])
  const [cropHistoryIdx, setCropHistoryIdx] = useState(-1)
  const preCropRef = useRef<CropRegion>({ x: 0, y: 0, width: 1, height: 1 })
  const [reposHistory, setReposHistory] = useState<RepositionState[]>([])
  const [reposHistoryIdx, setReposHistoryIdx] = useState(-1)
  const reposIdxRef = useRef(-1)
  const preReposRef = useRef<RepositionState>({ offsetX: 0, offsetY: 0, scale: 1 })
  const inputRef = useRef<HTMLInputElement>(null)

  const filterCss = useMemo(() => {
    const parts: string[] = []
    if (adjustments.brightness !== 0) parts.push(`brightness(${1 + adjustments.brightness / 100})`)
    if (adjustments.contrast !== 0) parts.push(`contrast(${1 + adjustments.contrast / 100})`)
    if (adjustments.saturation !== 0) parts.push(`saturate(${1 + adjustments.saturation / 100})`)
    if (adjustments.hue !== 0) parts.push(`hue-rotate(${adjustments.hue}deg)`)
    return parts.length ? { filter: parts.join(" ") } : {}
  }, [adjustments.brightness, adjustments.contrast, adjustments.saturation, adjustments.hue])

  const updatePipelineStep = (stepId: string, status: "running" | "done" | "error") => {
    setPipelineSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status } : s)),
    )
  }

  const grouped = useMemo(() => {
    const q = presetSearch.trim().toLowerCase()
    const filtered = q
      ? PRESETS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
      : PRESETS
    const map = new Map<string, typeof PRESETS>()
    for (const p of filtered) {
      const arr = map.get(p.category) ?? []
      arr.push(p)
      map.set(p.category, arr)
    }
    return Array.from(map.entries())
  }, [presetSearch])

  const applyPreset = (id: string) => {
    setPresetId(id)
    const p = PRESETS.find((x) => x.id === id)
    if (p && id !== "custom") {
      setWidth(p.widthPx)
      setHeight(p.heightPx)
      setMinKB(p.minKB)
      setMaxKB(p.maxKB)
      setFormat(p.format)
      setBgColor(p.bgColor)
    }
  }

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      return
    }
    if (previewURL) URL.revokeObjectURL(previewURL)
    if (result) URL.revokeObjectURL(result.url)
    if (cutoutDataURL) URL.revokeObjectURL(cutoutDataURL)
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreviewURL(url)
    setResult(null)
    setCutoutDataURL(null)
    setAdjustments(DEFAULT_ADJUSTMENTS)
    setShowManualCrop(false)
    setShowReposition(false)
    setSourceCrop({ x: 0, y: 0, width: 1, height: 1 })
    setCropHistory([])
    setCropHistoryIdx(-1)
    cropIdxRef.current = -1
    setReposHistory([])
    setReposHistoryIdx(-1)
    reposIdxRef.current = -1

    // Auto-detect closest preset from image dimensions
    const img = new Image()
    img.onload = () => {
      const ar = img.naturalWidth / img.naturalHeight
      let best = PRESETS[0]
      let bestDiff = Infinity
      for (const p of PRESETS) {
        if (p.id === "custom") continue
        if (p.signature) continue
        const pAr = p.widthPx / p.heightPx
        const diff = Math.abs(ar - pAr)
        if (diff < bestDiff) {
          bestDiff = diff
          best = p
        }
      }
      if (bestDiff < 0.3) {
        applyPreset(best.id)
        toast.info(`Suggested template: ${best.name}`, {
          description: best.description,
        })
      }
    }
    img.src = url
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const handleWidthChange = (v: number) => {
    setWidth(v)
    setPresetId("custom")
    if (lockAspectRatio && height > 0) {
      setHeight(Math.round(v / (width / height)))
    }
  }

  const handleHeightChange = (v: number) => {
    setHeight(v)
    setPresetId("custom")
    if (lockAspectRatio && width > 0) {
      setWidth(Math.round(v * (width / height)))
    }
  }

  const updateAdj = (partial: Partial<AdjustmentOptions>) => {
    setAdjustments((a) => ({ ...a, ...partial }))
  }

  const cropIdxRef = useRef(-1)

  const handleCropEnd = (c: CropRegion) => {
    setCropHistory((prev) => {
      const truncated = prev.slice(0, cropIdxRef.current + 1)
      truncated.push(c)
      return truncated
    })
    cropIdxRef.current += 1
    setCropHistoryIdx(cropIdxRef.current)
  }

  const undoCrop = useCallback(() => {
    if (cropHistoryIdx > 0) {
      const newIdx = cropHistoryIdx - 1
      setCropHistoryIdx(newIdx)
      setSourceCrop(cropHistory[newIdx])
    }
  }, [cropHistory, cropHistoryIdx])

  const redoCrop = useCallback(() => {
    if (cropHistoryIdx < cropHistory.length - 1) {
      const newIdx = cropHistoryIdx + 1
      setCropHistoryIdx(newIdx)
      setSourceCrop(cropHistory[newIdx])
    }
  }, [cropHistory, cropHistoryIdx])

  const applyCrop = () => {
    setShowManualCrop(false)
  }

  const cancelCrop = () => {
    setSourceCrop(preCropRef.current)
    setShowManualCrop(false)
  }

  // ── Reposition history ──
  const pushReposHistory = useCallback((state: RepositionState) => {
    setReposHistory((prev) => {
      const truncated = prev.slice(0, reposIdxRef.current + 1)
      truncated.push(state)
      return truncated
    })
    reposIdxRef.current += 1
    setReposHistoryIdx(reposIdxRef.current)
  }, [])

  const handleReposOffsetChange = useCallback((x: number, y: number) => {
    setAdjustments((a) => ({ ...a, offsetX: x, offsetY: y }))
  }, [])

  const handleReposScaleChange = useCallback((s: number) => {
    setAdjustments((a) => ({ ...a, scale: s }))
  }, [])

  const snapshotReposHistory = useCallback(() => {
    setAdjustments((a) => {
      pushReposHistory({ offsetX: a.offsetX, offsetY: a.offsetY, scale: a.scale })
      return a
    })
  }, [pushReposHistory])

  const undorepos = useCallback(() => {
    if (reposHistoryIdx > 0) {
      const newIdx = reposHistoryIdx - 1
      setReposHistoryIdx(newIdx)
      const entry = reposHistory[newIdx]
      setAdjustments((a) => ({ ...a, offsetX: entry.offsetX, offsetY: entry.offsetY, scale: entry.scale }))
    }
  }, [reposHistory, reposHistoryIdx])

  const redorepos = useCallback(() => {
    if (reposHistoryIdx < reposHistory.length - 1) {
      const newIdx = reposHistoryIdx + 1
      setReposHistoryIdx(newIdx)
      const entry = reposHistory[newIdx]
      setAdjustments((a) => ({ ...a, offsetX: entry.offsetX, offsetY: entry.offsetY, scale: entry.scale }))
    }
  }, [reposHistory, reposHistoryIdx])

  const cancelRepos = useCallback(() => {
    setAdjustments((a) => ({
      ...a,
      offsetX: preReposRef.current.offsetX,
      offsetY: preReposRef.current.offsetY,
      scale: preReposRef.current.scale,
    }))
    setShowReposition(false)
  }, [])

  const run = useCallback(async () => {
    if (!file) {
      toast.error("Upload a photo first")
      return
    }
    if (width < 50 || height < 50 || width > 4000 || height > 4000) {
      toast.error("Dimensions must be between 50 and 4000 px")
      return
    }
    if (minKB >= maxKB) {
      toast.error("Min KB must be less than Max KB")
      return
    }

    if (result) URL.revokeObjectURL(result.url)

    setProcessing(true)
    setResult(null)

    const isSignatureMode = isSignature
    const steps: PipelineStep[] = isSignatureMode
      ? [
        { id: "load", label: "Loading image", status: "pending" },
        { id: "compose", label: "Resizing signature", status: "pending" },
        { id: "size", label: "Optimizing file size", status: "pending" },
        { id: "done", label: "Ready", status: "pending" },
      ]
      : [
        { id: "load", label: "Loading image", status: "pending" },
        { id: "bg-removal", label: "Removing background", status: "pending" },
        { id: "detect", label: "Detecting face & framing", status: "pending" },
        { id: "compose", label: "Composing final image", status: "pending" },
        { id: "size", label: "Optimizing file size", status: "pending" },
        { id: "done", label: "Ready", status: "pending" },
      ]
    setPipelineSteps(steps)

    try {
      const opts: ProcessOptions = {
        widthPx: width,
        heightPx: height,
        minKB,
        maxKB,
        format,
        bgColor,
        headHeightPct: headPct / 100,
        eyeLinePct: eyePct / 100,
        sourceCrop,
        signature: isSignatureMode,
      }

      const r = await processPhoto(
        file,
        opts,
        adjustments,
        setProgress,
        updatePipelineStep,
      )

      setResult(r)
      if (r.cutoutDataURL) {
        setCutoutDataURL(r.cutoutDataURL)
      }

      if (r.withinSizeRange) {
        toast.success(`Ready — ${r.sizeKB.toFixed(1)} KB · ${r.width}×${r.height}`, {
          description: `Within ${minKB}–${maxKB} KB target.`,
        })
      } else {
        const msg =
          r.sizeKB < minKB
            ? `${r.sizeKB.toFixed(1)} KB is below ${minKB} KB min. Try smaller dimensions or JPEG.`
            : `${r.sizeKB.toFixed(1)} KB exceeds ${maxKB} KB max. Try larger dimensions or lower quality.`
        toast.warning(msg)
      }
    } catch (err) {
      console.error(err)
      toast.error("Processing failed", {
        description: "Try a different image or check the console for details.",
      })
      setPipelineSteps((prev) =>
        prev.map((s) => (s.status === "running" ? { ...s, status: "error" } : s)),
      )
    } finally {
      setProcessing(false)
      setProgress("")
    }
  }, [file, width, height, minKB, maxKB, format, bgColor, headPct, eyePct, adjustments, result, sourceCrop])

  const handleReprocess = useCallback(async () => {
    if (!previewURL || !file) return
    const sig = PRESETS.find((p) => p.id === presetId)?.signature ?? false

    if (result) URL.revokeObjectURL(result.url)

    setProcessing(true)
    setResult(null)

    const steps: PipelineStep[] = sig
      ? [
        { id: "detect", label: "Re-sizing signature", status: "running" },
        { id: "compose", label: "Composing final image", status: "pending" },
        { id: "size", label: "Optimizing file size", status: "pending" },
        { id: "done", label: "Ready", status: "pending" },
      ]
      : [
        { id: "detect", label: "Re-framing portrait", status: "running" },
        { id: "compose", label: "Composing final image", status: "pending" },
        { id: "size", label: "Optimizing file size", status: "pending" },
        { id: "done", label: "Ready", status: "pending" },
      ]
    setPipelineSteps(steps)

    try {
      const opts: ProcessOptions = {
        widthPx: width,
        heightPx: height,
        minKB,
        maxKB,
        format,
        bgColor,
        headHeightPct: headPct / 100,
        eyeLinePct: eyePct / 100,
        sourceCrop,
        signature: sig,
      }

      if (cutoutDataURL) {
        const r = await reprocessPhoto(
          cutoutDataURL,
          opts,
          adjustments,
          setProgress,
          updatePipelineStep,
        )
        setResult(r)
        if (r.withinSizeRange) {
          toast.success(`Re-processed — ${r.sizeKB.toFixed(1)} KB · ${r.width}×${r.height}`)
        } else {
          const msg =
            r.sizeKB < minKB
              ? `${r.sizeKB.toFixed(1)} KB is below ${minKB} KB min.`
              : `${r.sizeKB.toFixed(1)} KB exceeds ${maxKB} KB max.`
          toast.warning(msg)
        }
      } else {
        const stepsFull: PipelineStep[] = sig
          ? [
            { id: "load", label: "Loading image", status: "pending" },
            { id: "compose", label: "Resizing signature", status: "pending" },
            { id: "size", label: "Optimizing file size", status: "pending" },
            { id: "done", label: "Ready", status: "pending" },
          ]
          : [
            { id: "load", label: "Loading image", status: "pending" },
            { id: "bg-removal", label: "Removing background", status: "pending" },
            { id: "detect", label: "Detecting face & framing", status: "pending" },
            { id: "compose", label: "Composing final image", status: "pending" },
            { id: "size", label: "Optimizing file size", status: "pending" },
            { id: "done", label: "Ready", status: "pending" },
          ]
        setPipelineSteps(stepsFull)
        const r = await processPhoto(
          file,
          opts,
          adjustments,
          setProgress,
          updatePipelineStep,
        )
        setResult(r)
        if (r.withinSizeRange) {
          toast.success(`Re-processed — ${r.sizeKB.toFixed(1)} KB · ${r.width}×${r.height}`)
        } else {
          toast.warning(`Re-processed: ${r.sizeKB.toFixed(1)} KB (target ${minKB}–${maxKB} KB)`)
        }
      }
    } catch (err) {
      console.error(err)
      toast.error("Re-processing failed")
    } finally {
      setProcessing(false)
      setProgress("")
    }
  }, [file, previewURL, width, height, minKB, maxKB, format, bgColor, headPct, eyePct, adjustments, cutoutDataURL, result, sourceCrop, presetId])

  const saveRepos = useCallback(() => {
    setShowReposition(false)
    handleReprocess()
  }, [handleReprocess])

  const reset = () => {
    if (previewURL) URL.revokeObjectURL(previewURL)
    if (result) URL.revokeObjectURL(result.url)
    if (cutoutDataURL) URL.revokeObjectURL(cutoutDataURL)
    setFile(null)
    setPreviewURL(null)
    setResult(null)
    setCutoutDataURL(null)
    setAdjustments(DEFAULT_ADJUSTMENTS)
    setShowManualCrop(false)
    setShowReposition(false)
    setSourceCrop({ x: 0, y: 0, width: 1, height: 1 })
    setReposHistory([])
    setReposHistoryIdx(-1)
    reposIdxRef.current = -1
    setPipelineSteps([])
  }

  const download = () => {
    if (!result) return
    const a = document.createElement("a")
    a.href = result.url
    a.download = `portrait_${width}x${height}_${Math.round(result.sizeKB)}kb.${result.format === "jpeg" ? "jpg" : "png"
      }`
    a.click()
  }

  const currentPreset = PRESETS.find((p) => p.id === presetId)
  const isSignature = currentPreset?.signature ?? false
  const pipelineActive = pipelineSteps.some((s) => s.status === "running")
  const cropEditorActive = showManualCrop && !!previewURL && !pipelineActive
  const reposEditorActive = showReposition && !!result && !!previewURL && !pipelineActive

  const cropToolbar = cropEditorActive ? (
    <EditToolbar
      canUndo={cropHistoryIdx > 0}
      canRedo={cropHistoryIdx < cropHistory.length - 1}
      onUndo={undoCrop}
      onRedo={redoCrop}
      onCancel={cancelCrop}
      onSave={applyCrop}
      saveLabel="Apply crop"
    />
  ) : null

  const reposToolbar = reposEditorActive ? (
    <EditToolbar
      canUndo={reposHistoryIdx > 0}
      canRedo={reposHistoryIdx < reposHistory.length - 1}
      onUndo={undorepos}
      onRedo={redorepos}
      onCancel={cancelRepos}
      onSave={saveRepos}
      saveLabel="Save position"
    />
  ) : null

  return (
    <div className="flex flex-col gap-6">
      {/* ─── Left: Upload + Preview ───────────────────── */}
      <div className="space-y-5">
        {!file ? (
          <Card
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed p-8 text-center transition-all sm:min-h-[260px] sm:p-12",
              dragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-muted/30",
            )}
          >

            <Upload className="h-8 w-8 text-primary sm:h-10 sm:w-10 mt-6" />
            <div>
              <p className="text-base font-semibold sm:text-lg">
                {isSignature ? "Drop your signature here" : "Drop your photo here"}
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                or tap to browse · JPG, PNG, HEIC, WebP
              </p>
            </div>
            <p className="max-w-sm text-xs text-muted-foreground mt-4">
              {isSignature
                ? "Upload a scanned signature on white paper for govt forms."
                : "Best results: clear front‑facing photo, even lighting, head & shoulders visible."
              }
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {/* ── Manual crop (source image) ── */}
            {cropEditorActive && (
              <>
                <SourceCrop
                  imageUrl={previewURL!}
                  aspectRatio={width / height}
                  crop={sourceCrop}
                  onChange={setSourceCrop}
                  onCropEnd={handleCropEnd}
                  className="max-h-[420px] w-full"
                />
                {cropToolbar}
              </>
            )}

            {/* ── Preview before / without active crop ── */}
            {previewURL && !pipelineActive && !cropEditorActive && !reposEditorActive && !result && (
              <Card className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Preview
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {file ? (file.size / 1024).toFixed(0) : "?"} KB
                  </Badge>
                </div>
                <div className="relative flex items-center justify-center bg-[conic-gradient(at_50%_50%,_oklch(0.95_0.01_250)_0deg,_oklch(0.97_0.01_250)_90deg,_oklch(0.95_0.01_250)_180deg,_oklch(0.97_0.01_250)_270deg)] p-4">
                  <img
                    src={previewURL}
                    alt="Preview"
                    className="max-h-[400px] w-full rounded-sm object-contain"
                    style={filterCss}
                  />
                  {showGuide && <CompositionGuide />}
                </div>
                <div className="flex items-center justify-center border-t bg-muted/20 px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">
                    Adjust settings below and tap <strong>Generate Portrait</strong>
                  </span>
                </div>
              </Card>
            )}

            {/* ── During processing ── */}
            {previewURL && !result && pipelineActive && (
              <Card className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Source</span>
                  <Badge variant="secondary" className="text-xs">
                    {file ? (file.size / 1024).toFixed(0) : "?"} KB
                  </Badge>
                </div>
                <div className="flex items-center justify-center bg-[conic-gradient(at_50%_50%,_oklch(0.95_0.01_250)_0deg,_oklch(0.97_0.01_250)_90deg,_oklch(0.95_0.01_250)_180deg,_oklch(0.97_0.01_250)_270deg)] p-4">
                  <img
                    src={previewURL}
                    alt="Uploaded"
                    className="max-h-[400px] w-full rounded-sm object-contain"
                  />
                </div>
              </Card>
            )}

            {/* ── Reposition (after generation) ── */}
            {reposEditorActive && result && (
              <>
                <CropOverlay
                  imageUrl={result.url}
                  bgColor={bgColor}
                  aspectRatio={width / height}
                  offsetX={adjustments.offsetX}
                  offsetY={adjustments.offsetY}
                  scale={adjustments.scale}
                  className="max-h-[480px] w-full"
                  onOffsetChange={handleReposOffsetChange}
                  onScaleChange={handleReposScaleChange}
                  onInteractionEnd={snapshotReposHistory}
                  hideToolbar
                />
                {reposToolbar}
              </>
            )}

            {/* ── After generation (compare view) ── */}
            {previewURL && result && !pipelineActive && !reposEditorActive && !cropEditorActive && (
              <BeforeAfter
                beforeUrl={previewURL}
                afterUrl={result.url}
                aspectRatio={width / height}
                className="max-h-[480px] w-full"
              />
            )}

            {/* Pipeline progress */}
            {pipelineSteps.length > 0 && (processing || pipelineActive) && (
              <PipelineProgress steps={pipelineSteps} currentMessage={progress} />
            )}

            {/* Result badge */}
            {result && (
              <Card
                className={cn(
                  "p-4",
                  result.withinSizeRange
                    ? "border-emerald-400/40 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20",
                )}
              >
                <div className="flex items-start gap-3">
                  {result.withinSizeRange ? (
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" weight="fill" />
                  ) : (
                    <WarningCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" weight="fill" />
                  )}
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {result.withinSizeRange ? "Ready to upload" : "File size warning"}
                      </span>
                      <Badge
                        variant={result.withinSizeRange ? "success" : "warning"}
                        className="text-[10px]"
                      >
                        {result.sizeKB.toFixed(1)} KB · {result.width}×{result.height}
                      </Badge>
                    </div>
                    {result.notes.length > 0 && (
                      <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground space-y-0.5">
                        {result.notes.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    )}
                    {result.notes.length === 0 && result.withinSizeRange && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        All requirements met — file is {result.sizeKB.toFixed(1)} KB within the {minKB}–{maxKB} KB range.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}


            <div>
              <Button
                onClick={run}
                disabled={processing}
                size="lg"
                className="w-full sm:flex-none"
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 mr-2 inline-block rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Sparkle className="mr-2 h-4 w-4" weight="fill" />
                    {result ? "Re-generate" : "Generate Portrait"}
                  </>
                )}
              </Button>
            </div>


            {/* Actions */}
            <div className="flex flex-wrap gap-2 sm:gap-3">

              {result && (
                <>
                  <Button onClick={download} size="lg" variant="secondary">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <PrintDialog
                    photoUrl={result.url}
                    photoWidth={result.width}
                    photoHeight={result.height}
                  >
                    <Button size="lg" variant="secondary">
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </PrintDialog>
                </>
              )}
              <Button onClick={reset} size="lg" variant="ghost" disabled={processing}>
                <ArrowCounterClockwise className="mr-2 h-4 w-4" />
                New
              </Button>
            </div>
          </div>
        )}


      </div>

      {/* ─── Right: All Settings ──────────────────────── */}
      <Card className="h-fit space-y-5 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Settings</h2>
        </div>

        {/* Template */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Template</Label>
            {isSignature && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                Signature
              </span>
            )}
          </div>
          <Select value={presetId} onValueChange={applyPreset}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[400px] pt-12">
              <div className="p-2 border-b bg-popover fixed top-0 z-10 w-full">
                <div className="relative">
                  <MagnifyingGlass className="pointer-events-none absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder="Search 30+ templates…"
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="h-8 pl-7 text-xs"
                  />
                </div>
              </div>
              {grouped.map(([cat, items]) => (
                <SelectGroup key={cat}>
                  <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </SelectLabel>
                  {items.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div>
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
              {grouped.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No templates match &quot;{presetSearch}&quot;
                </div>
              )}
            </SelectContent>
          </Select>
          {currentPreset && currentPreset.id !== "custom" && (
            <p className="text-[11px] text-muted-foreground">{currentPreset.description}</p>
          )}
        </div>

        <Separator className="my-1" />

        {/* Dimensions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Dimensions (px)</Label>
            <button
              type="button"
              onClick={() => setLockAspectRatio(!lockAspectRatio)}
              className={cn(
                "flex items-center gap-1 text-[10px] transition-colors",
                lockAspectRatio ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {lockAspectRatio ? (
                <LockSimple className="h-3 w-3" weight="fill" />
              ) : (
                <LockSimpleOpen className="h-3 w-3" />
              )}
              {lockAspectRatio ? "Locked" : "Free"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="w" className="text-[10px]">Width</Label>
              <Input
                id="w" type="number" min={50} max={4000} value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="h" className="text-[10px]">Height</Label>
              <Input
                id="h" type="number" min={50} max={4000} value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* File size */}
        <div className="space-y-2">
          <Label className="text-xs">File size (KB)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="min" className="text-[10px]">Min</Label>
              <Input
                id="min" type="number" min={0} value={minKB}
                onChange={(e) => { setMinKB(Number(e.target.value)); setPresetId("custom") }}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="max" className="text-[10px]">Max</Label>
              <Input
                id="max" type="number" min={1} value={maxKB}
                onChange={(e) => { setMaxKB(Number(e.target.value)); setPresetId("custom") }}
              />
            </div>
          </div>
        </div>

        {/* Format + Background */}
        <div className="space-y-2">
          <Label>Format</Label>
          <Select
            value={format}
            onValueChange={(v: "jpeg" | "png") => { setFormat(v); setPresetId("custom") }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="jpeg">JPEG (recommended)</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bg">Background color</Label>
          <div className="flex gap-2">
            <Input
              id="bg" type="color" value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-9 w-12 cursor-pointer p-1"
            />
            <Input
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="flex-1 font-mono text-xs uppercase"
            />
          </div>
        </div>

        <Separator className="my-1" />

        {!isSignature && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs cursor-pointer">Composition guide</Label>
            </div>
            <Switch checked={showGuide} onCheckedChange={setShowGuide} />
          </div>
        )}

        {/* Crop options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crop className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs cursor-pointer">Manual crop</Label>
            </div>
            <Switch
              checked={showManualCrop}
              disabled={!previewURL}
              onCheckedChange={(v) => {
                if (v) {
                  preCropRef.current = { ...sourceCrop }
                  const init = [{ ...sourceCrop }]
                  setCropHistory(init)
                  cropIdxRef.current = 0
                  setCropHistoryIdx(0)
                }
                setShowManualCrop(v)
              }}
            />
          </div>
          {showManualCrop && (
            <>
              <p className="text-[10px] text-muted-foreground pl-5">
                Drag the rectangle to select the area to process
              </p>
              {cropToolbar && (
                <div className="rounded-lg border bg-muted/20 p-3">
                  {cropToolbar}
                </div>
              )}
            </>
          )}
          {!isSignature && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-xs cursor-pointer">Auto-detect face</Label>
              </div>
              <Switch checked={showAutoDetect} onCheckedChange={setShowAutoDetect} />
            </div>
          )}
          {!isSignature && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MagnifyingGlass className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label className="text-xs cursor-pointer">Reposition subject</Label>
                </div>
                <Switch
                  checked={showReposition}
                  disabled={!result}
                  onCheckedChange={(v) => {
                    if (v) {
                      preReposRef.current = {
                        offsetX: adjustments.offsetX,
                        offsetY: adjustments.offsetY,
                        scale: adjustments.scale,
                      }
                      const init = [{ offsetX: adjustments.offsetX, offsetY: adjustments.offsetY, scale: adjustments.scale }]
                      setReposHistory(init)
                      reposIdxRef.current = 0
                      setReposHistoryIdx(0)
                    }
                    setShowReposition(v)
                  }}
                />
              </div>
              {showReposition && (
                <>
                  <p className="text-[10px] text-muted-foreground pl-5">
                    Drag image to reposition · use zoom controls to resize
                  </p>
                  {reposToolbar && (
                    <div className="rounded-lg border bg-muted/20 p-3">
                      {reposToolbar}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {!isSignature && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <Label>Head size</Label>
                <span className="text-muted-foreground">{headPct}% of frame</span>
              </div>
              <Slider
                value={[headPct]} min={40} max={90} step={1}
                onValueChange={(v) => { setHeadPct(v[0]); setPresetId("custom") }}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <Label>Eye line from top</Label>
                <span className="text-muted-foreground">{eyePct}%</span>
              </div>
              <Slider
                value={[eyePct]} min={25} max={55} step={1}
                onValueChange={(v) => { setEyePct(v[0]); setPresetId("custom") }}
              />
            </div>
          </div>
        )}

        <Separator className="my-1" />

        {/* Adjustments - Brightness, Contrast, Saturation, Hue */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-foreground/80">Adjustments</Label>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sun className="h-3 w-3 text-muted-foreground" />
                <Label>Brightness</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.brightness}</span>
            </div>
            <Slider value={[adjustments.brightness]} onValueChange={([v]) => updateAdj({ brightness: v })} min={-100} max={100} step={1} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CircleHalf className="h-3 w-3 text-muted-foreground" />
                <Label>Contrast</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.contrast}</span>
            </div>
            <Slider value={[adjustments.contrast]} onValueChange={([v]) => updateAdj({ contrast: v })} min={-100} max={100} step={1} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Drop className="h-3 w-3 text-muted-foreground" />
                <Label>Saturation</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.saturation}</span>
            </div>
            <Slider value={[adjustments.saturation]} onValueChange={([v]) => updateAdj({ saturation: v })} min={-100} max={100} step={1} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Palette className="h-3 w-3 text-muted-foreground" />
                <Label>Hue</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.hue}°</span>
            </div>
            <Slider value={[adjustments.hue]} onValueChange={([v]) => updateAdj({ hue: v })} min={0} max={360} step={1} />
          </div>
        </div>

        {!isSignature && (
          <>
            {/* Red-eye removal */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Red-eye removal</Label>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.redEyeRemoval}%</span>
                </div>
                <Slider value={[adjustments.redEyeRemoval]} onValueChange={([v]) => updateAdj({ redEyeRemoval: v })} min={0} max={100} step={1} />
                <p className="text-[10px] text-muted-foreground">
                  Detects and desaturates red pupils
                </p>
              </div>
            </div>

            {/* Skin smoothing */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Skin smoothing</Label>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.skinSmoothing}%</span>
                </div>
                <Slider value={[adjustments.skinSmoothing]} onValueChange={([v]) => updateAdj({ skinSmoothing: v })} min={0} max={100} step={1} />
                <p className="text-[10px] text-muted-foreground">
                  Softens skin while preserving edges
                </p>
              </div>
            </div>
          </>
        )}

        {/* Sharpen + Upscale */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkle className="h-3 w-3 text-muted-foreground" />
                <Label>Sharpen</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.sharpen}</span>
            </div>
            <Slider value={[adjustments.sharpen]} onValueChange={([v]) => updateAdj({ sharpen: v })} min={0} max={100} step={1} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MagnifyingGlassPlus className="h-3 w-3 text-muted-foreground" />
                <Label>Upscale</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.upscaleFactor}x</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((f) => (
                <Button
                  key={f}
                  variant={adjustments.upscaleFactor === f ? "default" : "outline"}
                  size="xs"
                  onClick={() => updateAdj({ upscaleFactor: f })}
                  className="text-[10px]"
                >
                  {f}x
                </Button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Upscale renders at higher resolution then downscales for crisper output.
            </p>
          </div>
        </div>

        {/* Re-process actions (only when result exists) */}
        {result && (
          <>
            <Separator className="my-1" />
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-foreground/70">Apply changes</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdjustments(DEFAULT_ADJUSTMENTS)}
                  disabled={processing}
                  className="text-xs flex-1"
                >
                  Reset all
                </Button>
                <Button
                  size="sm"
                  onClick={handleReprocess}
                  disabled={processing}
                  className="text-xs flex-1"
                >
                  {processing ? "Applying…" : "Re-process"}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* What this does */}
      {/* Info card */}
      <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-[11px] text-muted-foreground">
        <p className="font-medium text-foreground">What this does</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          <li>Detects face & head, crops to passport composition</li>
          <li>Removes background, replaces with solid color</li>
          <li>Resizes to your exact dimensions with no margins</li>
          <li>Adjusts quality or pads to hit your KB range</li>
          <li>Manual crop overlay to fine-tune positioning</li>
          <li>Brightness, contrast, saturation, hue, sharpen & upscale controls</li>
        </ul>
      </div>
    </div>
  )
}
