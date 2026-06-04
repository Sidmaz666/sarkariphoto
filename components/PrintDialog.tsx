"use client"

import * as React from "react"
import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Printer,
  Download,
  Image as ImageIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"
import {
  PAPER_SIZES,
  calculateGrid,
  renderPrintSheet,
  canvasToBlob,
  type PrintLayoutConfig,
  type PaperSize,
} from "@/lib/printLayout"

interface PrintDialogProps {
  photoUrl: string
  photoWidth: number
  photoHeight: number
  disabled?: boolean
  /** Called when print sheet blob is generated (for the parent to track) */
  children?: React.ReactNode
}

export function PrintDialog({
  photoUrl,
  photoWidth,
  photoHeight,
  disabled,
  children,
}: PrintDialogProps) {
  const [open, setOpen] = useState(false)
  const [paperSize, setPaperSize] = useState<PaperSize>(PAPER_SIZES[0])
  const [copies, setCopies] = useState(4)
  const borderIn = 0.08 // ~2mm
  const marginIn = 0.25 // ~6mm
  const gapIn = 0.12 // ~3mm
  const [portrait, setPortrait] = useState(false)
  const [showCutMarks, setShowCutMarks] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const config = useMemo<PrintLayoutConfig>(() => ({
    paperSize,
    copies,
    borderIn,
    marginIn,
    gapIn,
    showCutMarks,
    portrait,
  }), [paperSize, copies, borderIn, marginIn, gapIn, showCutMarks, portrait])

  const grid = calculateGrid(config, photoWidth, photoHeight)

  // Generate preview when dialog opens or config changes
  const generatePreview = useCallback(async () => {
    if (!photoUrl) return
    setGenerating(true)
    try {
      const canvas = await renderPrintSheet(photoUrl, config, photoWidth, photoHeight)

      // Create a scaled-down preview for the dialog
      const maxPreviewW = 400
      const scale = Math.min(1, maxPreviewW / canvas.width)
      const preview = document.createElement("canvas")
      preview.width = Math.round(canvas.width * scale)
      preview.height = Math.round(canvas.height * scale)
      const pctx = preview.getContext("2d")!
      pctx.imageSmoothingEnabled = true
      pctx.imageSmoothingQuality = "high"
      pctx.drawImage(canvas, 0, 0, preview.width, preview.height)

      if (previewUrl) URL.revokeObjectURL(previewUrl)
      const blob = await canvasToBlob(preview)
      setPreviewUrl(URL.createObjectURL(blob))

      // Store full-res canvas for download/print
      if (previewCanvasRef.current) {
        previewCanvasRef.current.width = canvas.width
        previewCanvasRef.current.height = canvas.height
        previewCanvasRef.current.getContext("2d")!.drawImage(canvas, 0, 0)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to generate print preview")
    } finally {
      setGenerating(false)
    }
  }, [photoUrl, config, photoWidth, photoHeight, previewUrl])

  useEffect(() => {
    if (open) {
      queueMicrotask(() => generatePreview())
    }
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [open, generatePreview, previewUrl])

  const handleDownload = async () => {
    if (!previewCanvasRef.current) return
    try {
      const blob = await canvasToBlob(previewCanvasRef.current)
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `print-sheet_${paperSize.id}_${copies}up.png`
      a.click()
      URL.revokeObjectURL(a.href)
      toast.success("Print sheet downloaded")
    } catch {
      toast.error("Download failed")
    }
  }

  const handlePrint = async () => {
    if (!previewCanvasRef.current) return
    try {
      const blob = await canvasToBlob(previewCanvasRef.current)
      const url = URL.createObjectURL(blob)

      // Open print dialog with the image
      const printWindow = window.open("")
      if (!printWindow) {
        // Fallback: download and tell user to print manually
        handleDownload()
        toast.info("Pop-up blocked. Downloaded instead — open and press Ctrl+P to print.")
        return
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Portrait Sheet</title>
            <style>
              @page { margin: 0; size: ${portrait ? paperSize.heightIn : paperSize.widthIn}in ${portrait ? paperSize.widthIn : paperSize.heightIn}in; }
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; }
              img { max-width: 100%; max-height: 100vh; }
              @media print {
                body { background: white; }
                img { max-width: 100%; max-height: 100vh; }
              }
            </style>
          </head>
          <body>
            <img src="${url}" onload="window.print(); window.close();" />
          </body>
        </html>
      `)
      printWindow.document.close()
    } catch {
      toast.error("Print failed")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="lg" variant="secondary" disabled={disabled}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Print Layout</DialogTitle>
          <DialogDescription>
            Arrange {copies} copies on {paperSize.name} paper for printing at home.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-3">
          {/* Paper size */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Paper size</Label>
              <Select
                value={paperSize.id}
                onValueChange={(id) =>
                  setPaperSize(PAPER_SIZES.find((p) => p.id === id) ?? PAPER_SIZES[0])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAPER_SIZES.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Copies</Label>
              <Select
                value={String(copies)}
                onValueChange={(v) => setCopies(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 4, 6, 8, 12, 16, 20, 24].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Orientation toggle */}
          <div className="space-y-2">
            <Label>Orientation</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPortrait(false)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  !portrait
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/30",
                )}
              >
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="1" width="10" height="14" rx="1" />
                </svg>
                Landscape
              </button>
              <button
                type="button"
                onClick={() => setPortrait(true)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  portrait
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/30",
                )}
              >
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="14" height="10" rx="1" />
                </svg>
                Portrait
              </button>
            </div>
          </div>

          {/* Grid info */}
          <Card className="flex items-center gap-3 p-3 text-xs bg-muted/30">
            <ImageIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="space-y-0.5">
              <p className="font-medium text-foreground">
                {grid.totalFit >= copies
                  ? `${copies} photo${copies > 1 ? "s" : ""} fit on one sheet`
                  : `Only ${grid.totalFit} fit — reduce copies`}
              </p>
              <p className="text-muted-foreground">
                {grid.cols} × {grid.rows} grid ·{" "}
                {portrait ? paperSize.heightIn : paperSize.widthIn}×{portrait ? paperSize.widthIn : paperSize.heightIn}&quot; at {paperSize.dpi} DPI ·{" "}
                {grid.canvasW}×{grid.canvasH} px
              </p>
            </div>
          </Card>

          {/* Cut marks toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Cut marks & borders</Label>
              <p className="text-[11px] text-muted-foreground">
                Show dashed cut lines and photo borders
              </p>
            </div>
            <Switch checked={showCutMarks} onCheckedChange={setShowCutMarks} />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className={cn(
                "flex items-center justify-center rounded-lg border bg-white p-3 min-h-[200px]",
                generating && "animate-pulse",
              )}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Print layout preview"
                  className="max-h-[320px] w-full object-contain rounded shadow-xs"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-8 w-8 opacity-40" />
                  <span className="text-xs">
                    {generating ? "Generating…" : "Preview not available"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Hidden full-res canvas */}
          <canvas ref={previewCanvasRef} className="hidden" />

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              onClick={handleDownload}
              disabled={generating || !previewUrl}
              variant="outline"
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
            <Button
              onClick={handlePrint}
              disabled={generating || !previewUrl}
              className="flex-1"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
