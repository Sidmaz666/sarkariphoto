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
  planPrintPages,
  maxCopiesOnPage,
  renderPrintPages,
  canvasToBlob,
  getPhotoPrintSizeInches,
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

const DEFAULT_BORDER_IN = 0.06
const DEFAULT_MARGIN_IN = 0.1
const DEFAULT_GAP_IN = 0.08

const COPY_OPTIONS = [1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48]

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
  const pageCanvasesRef = useRef<HTMLCanvasElement[]>([])
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

  const pageLayouts = useMemo(
    () => planPrintPages(copies, config, photoWidth, photoHeight),
    [copies, config, photoWidth, photoHeight],
  )

  const perSheetMax = useMemo(
    () => maxCopiesOnPage(config, photoWidth, photoHeight),
    [config, photoWidth, photoHeight],
  )

  const printSize = getPhotoPrintSizeInches(
    photoWidth,
    photoHeight,
    paperSize.dpi,
  )

  const firstPage = pageLayouts[0]

  const buildPreviewFromPages = (pages: HTMLCanvasElement[]) => {
    if (pages.length === 0) return null
    const gap = 16
    const maxPreviewW = 400
    let totalH = 0
    const sizes = pages.map((p) => {
      const scale = Math.min(1, maxPreviewW / p.width)
      return { w: Math.round(p.width * scale), h: Math.round(p.height * scale), page: p, scale }
    })
    totalH = sizes.reduce((sum, s, i) => sum + s.h + (i > 0 ? gap : 0), 0)
    const preview = document.createElement("canvas")
    preview.width = maxPreviewW
    preview.height = totalH
    const ctx = preview.getContext("2d")!
    ctx.fillStyle = "#f4f4f5"
    ctx.fillRect(0, 0, preview.width, preview.height)
    let y = 0
    for (const s of sizes) {
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, y, s.w, s.h)
      ctx.drawImage(s.page, 0, y, s.w, s.h)
      y += s.h + gap
    }
    return preview
  }

  const generatePreview = useCallback(async () => {
    if (!photoUrl || !open) return
    const runId = ++generateIdRef.current
    setGenerating(true)
    try {
      const pages = await renderPrintPages(photoUrl, config, photoWidth, photoHeight)
      if (runId !== generateIdRef.current) return

      pageCanvasesRef.current = pages
      const preview = buildPreviewFromPages(pages)
      if (!preview) return

      const blob = await canvasToBlob(preview)
      if (runId !== generateIdRef.current) return

      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      const url = URL.createObjectURL(blob)
      previewUrlRef.current = url
      setPreviewUrl(url)
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
    pageCanvasesRef.current = []
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setPreviewUrl(null)
    setGenerating(false)
  }, [open])

  const handleDownload = async () => {
    const pages = pageCanvasesRef.current
    if (pages.length === 0) return
    try {
      if (pages.length === 1) {
        const blob = await canvasToBlob(pages[0])
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = `print-sheet_${paperSize.id}_${copies}up.png`
        a.click()
        URL.revokeObjectURL(a.href)
      } else {
        for (let i = 0; i < pages.length; i++) {
          const blob = await canvasToBlob(pages[i])
          const a = document.createElement("a")
          a.href = URL.createObjectURL(blob)
          a.download = `print-sheet_${paperSize.id}_${copies}up_page${i + 1}.png`
          a.click()
          URL.revokeObjectURL(a.href)
          await new Promise((r) => setTimeout(r, 200))
        }
      }
      toast.success(
        pages.length === 1 ? "Print sheet downloaded" : `Downloaded ${pages.length} pages`,
      )
    } catch {
      toast.error("Download failed")
    }
  }

  const handlePrint = async () => {
    const pages = pageCanvasesRef.current
    if (pages.length === 0) return
    try {
      const blobs = await Promise.all(pages.map((p) => canvasToBlob(p)))
      const urls = blobs.map((b) => URL.createObjectURL(b))

      const printWindow = window.open("")
      if (!printWindow) {
        handleDownload()
        toast.info("Pop-up blocked. Downloaded instead — open and press Ctrl+P to print.")
        return
      }

      const pageW = portrait ? paperSize.heightIn : paperSize.widthIn
      const pageH = portrait ? paperSize.widthIn : paperSize.heightIn

      const sheetsHtml = urls
        .map(
          (url) =>
            `<div class="sheet"><img src="${url}" width="${pages[0].width}" height="${pages[0].height}" alt="Print page" /></div>`,
        )
        .join("")

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Portrait Sheet</title>
            <style>
              @page { margin: 0; size: ${pageW}in ${pageH}in; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              html, body { background: #fff; }
              .sheet {
                width: ${pageW}in;
                height: ${pageH}in;
                overflow: hidden;
                page-break-after: always;
                break-after: page;
              }
              .sheet:last-child { page-break-after: auto; break-after: auto; }
              .sheet img {
                display: block;
                width: ${pageW}in;
                height: ${pageH}in;
                object-fit: fill;
              }
              @media print {
                html, body { background: #fff; }
              }
            </style>
          </head>
          <body>${sheetsHtml}</body>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </html>
      `)
      printWindow.document.close()
    } catch {
      toast.error("Print failed")
    }
  }

  const actionsEnabled = !generating && pageLayouts.length > 0 && !!previewUrl

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
      <DialogContent
        className={cn(
          "gap-0 p-0",
          "h-[min(90vh,720px)] w-[calc(100%-1.5rem)] max-w-xl",
          "sm:w-full",
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b bg-muted/20 px-6 py-5 pr-14 text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Printer className="h-4 w-4" weight="duotone" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base">Print layout</DialogTitle>
              <DialogDescription className="text-xs leading-relaxed">
                Each copy prints at true size ({photoWidth}×{photoHeight} px).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="dialog-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Paper size</Label>
                <Select
                  value={paperSize.id}
                  onValueChange={(id) =>
                    setPaperSize(PAPER_SIZES.find((p) => p.id === id) ?? PAPER_SIZES[0])
                  }
                >
                  <SelectTrigger className="w-full">
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
                <Label className="text-xs">Copies</Label>
                <Select
                  value={String(copies)}
                  onValueChange={(v) => setCopies(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COPY_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Orientation</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPortrait(false)}
                  className={cn(
                    "flex flex-1 items-center justify-center rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors",
                    !portrait
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border bg-background text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  Landscape
                </button>
                <button
                  type="button"
                  onClick={() => setPortrait(true)}
                  className={cn(
                    "flex flex-1 items-center justify-center rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors",
                    portrait
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border bg-background text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  Portrait
                </button>
              </div>
            </div>

            <Card className="flex items-start gap-3 rounded-xl border-border/80 bg-muted/25 p-3.5 text-xs">
              <ImageIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 space-y-0.5">
                <p className="font-medium text-foreground">
                  {copies} copy{copies > 1 ? "ies" : ""} · {pageLayouts.length} sheet
                  {pageLayouts.length > 1 ? "s" : ""}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Each photo {printSize.widthIn.toFixed(2)}&quot; × {printSize.heightIn.toFixed(2)}&quot; (
                  {photoWidth}×{photoHeight} px at {paperSize.dpi} DPI)
                  {firstPage
                    ? ` · up to ${perSheetMax}/sheet · ${firstPage.cols}×${firstPage.rows} on page 1`
                    : ""}
                </p>
              </div>
            </Card>

            <div className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
              <Label className="text-xs font-medium">Layout options</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-sm">Photo borders</span>
                    <p className="text-[11px] text-muted-foreground">Outline around each portrait</p>
                  </div>
                  <Switch checked={showPhotoBorders} onCheckedChange={setShowPhotoBorders} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-sm">Spacing between photos</span>
                    <p className="text-[11px] text-muted-foreground">Gap for easier cutting</p>
                  </div>
                  <Switch checked={showSpacing} onCheckedChange={setShowSpacing} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-sm">Cut marks</span>
                    <p className="text-[11px] text-muted-foreground">Dashed guides and corner marks</p>
                  </div>
                  <Switch checked={showCutMarks} onCheckedChange={setShowCutMarks} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">
                Preview{pageLayouts.length > 1 ? ` (${pageLayouts.length} pages)` : ""}
              </Label>
              <div
                className={cn(
                  "flex items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-zinc-100 p-4 min-h-[200px]",
                  generating && "opacity-70",
                )}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Print layout preview"
                    className="max-h-[280px] w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                    <ImageIcon className="h-8 w-8 opacity-40" />
                    <span className="text-xs text-center max-w-[220px]">
                      {generating ? "Generating preview…" : "Adjust options to update the sheet preview"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t bg-muted/20 px-6 py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
            <Button
              onClick={handleDownload}
              disabled={!actionsEnabled}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
            <Button
              onClick={handlePrint}
              disabled={!actionsEnabled}
              className="flex-1 rounded-xl"
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
