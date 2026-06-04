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
  children?: React.ReactNode
}

const DEFAULT_BORDER_IN = 0.08
const DEFAULT_MARGIN_IN = 0.25
const DEFAULT_GAP_IN = 0.12

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
  const [portrait, setPortrait] = useState(false)
  const [showCutMarks, setShowCutMarks] = useState(true)
  const [showPhotoBorders, setShowPhotoBorders] = useState(true)
  const [showSpacing, setShowSpacing] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const generateIdRef = useRef(0)

  const config = useMemo<PrintLayoutConfig>(() => ({
    paperSize,
    copies,
    borderIn: DEFAULT_BORDER_IN,
    marginIn: DEFAULT_MARGIN_IN,
    gapIn: DEFAULT_GAP_IN,
    showCutMarks,
    showPhotoBorders,
    showSpacing,
    portrait,
  }), [paperSize, copies, showCutMarks, showPhotoBorders, showSpacing, portrait])

  const grid = calculateGrid(config, photoWidth, photoHeight)
  const layoutFits = grid.totalFit >= copies

  const generatePreview = useCallback(async () => {
    if (!photoUrl || !open) return
    const runId = ++generateIdRef.current
    setGenerating(true)
    try {
      const canvas = await renderPrintSheet(photoUrl, config, photoWidth, photoHeight)
      if (runId !== generateIdRef.current) return

      const maxPreviewW = 400
      const scale = Math.min(1, maxPreviewW / canvas.width)
      const preview = document.createElement("canvas")
      preview.width = Math.round(canvas.width * scale)
      preview.height = Math.round(canvas.height * scale)
      const pctx = preview.getContext("2d")!
      pctx.imageSmoothingEnabled = true
      pctx.imageSmoothingQuality = "high"
      pctx.drawImage(canvas, 0, 0, preview.width, preview.height)

      const blob = await canvasToBlob(preview)
      if (runId !== generateIdRef.current) return

      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      const url = URL.createObjectURL(blob)
      previewUrlRef.current = url
      setPreviewUrl(url)

      if (previewCanvasRef.current) {
        previewCanvasRef.current.width = canvas.width
        previewCanvasRef.current.height = canvas.height
        previewCanvasRef.current.getContext("2d")!.drawImage(canvas, 0, 0)
      }
    } catch (err) {
      if (runId === generateIdRef.current) {
        console.error(err)
        toast.error("Failed to generate print preview")
      }
    } finally {
      if (runId === generateIdRef.current) setGenerating(false)
    }
  }, [photoUrl, config, photoWidth, photoHeight, open])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => {
      void generatePreview()
    }, 120)
    return () => window.clearTimeout(t)
  }, [open, generatePreview])

  useEffect(() => {
    if (open) return
    generateIdRef.current += 1
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setPreviewUrl(null)
    setGenerating(false)
  }, [open])

  const handleDownload = async () => {
    if (!previewCanvasRef.current || !layoutFits) return
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
    if (!previewCanvasRef.current || !layoutFits) return
    try {
      const blob = await canvasToBlob(previewCanvasRef.current)
      const url = URL.createObjectURL(blob)

      const printWindow = window.open("")
      if (!printWindow) {
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
              img { width: 100%; height: auto; }
              @media print {
                body { background: white; }
                img { width: 100%; height: auto; page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <img src="${url}" onload="window.print(); setTimeout(function(){ window.close(); }, 500);" />
          </body>
        </html>
      `)
      printWindow.document.close()
    } catch {
      toast.error("Print failed")
    }
  }

  const actionsEnabled = !generating && !!previewUrl && layoutFits

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
                Portrait
              </button>
            </div>
          </div>

          <Card className="flex items-center gap-3 p-3 text-xs bg-muted/30">
            <ImageIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="space-y-0.5">
              <p className={cn("font-medium", !layoutFits && "text-destructive")}>
                {layoutFits
                  ? `${copies} photo${copies > 1 ? "s" : ""} fit on one sheet`
                  : `Only ${grid.totalFit} fit — reduce copies or disable spacing`}
              </p>
              <p className="text-muted-foreground">
                {grid.cols} × {grid.rows} grid ·{" "}
                {portrait ? paperSize.heightIn : paperSize.widthIn}×{portrait ? paperSize.widthIn : paperSize.heightIn}&quot; at {paperSize.dpi} DPI
              </p>
            </div>
          </Card>

          <div className="space-y-3 rounded-lg border p-3">
            <Label className="text-sm">Layout options</Label>
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-sm">Photo borders</span>
                <p className="text-[11px] text-muted-foreground">Outline around each portrait</p>
              </div>
              <Switch checked={showPhotoBorders} onCheckedChange={setShowPhotoBorders} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-sm">Spacing between photos</span>
                <p className="text-[11px] text-muted-foreground">Gap so copies are easy to cut apart</p>
              </div>
              <Switch checked={showSpacing} onCheckedChange={setShowSpacing} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-sm">Cut marks</span>
                <p className="text-[11px] text-muted-foreground">Dashed guides and corner marks</p>
              </div>
              <Switch checked={showCutMarks} onCheckedChange={setShowCutMarks} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className={cn(
                "flex items-center justify-center rounded-lg border bg-white p-3 min-h-[200px]",
                generating && "opacity-70",
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
                    {generating ? "Generating…" : "Open preview by adjusting options above"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <canvas ref={previewCanvasRef} className="hidden" aria-hidden />

          <div className="flex gap-3 pt-1">
            <Button
              onClick={handleDownload}
              disabled={!actionsEnabled}
              variant="outline"
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
            <Button
              onClick={handlePrint}
              disabled={!actionsEnabled}
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
