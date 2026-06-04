export type PaperSize = {
  id: string
  name: string
  /** Width in inches */
  widthIn: number
  /** Height in inches */
  heightIn: number
  /** Print resolution */
  dpi: number
}

export const PAPER_SIZES: PaperSize[] = [
  { id: "4x6", name: '4×6"', widthIn: 6, heightIn: 4, dpi: 300 },
  { id: "5x7", name: '5×7"', widthIn: 7, heightIn: 5, dpi: 300 },
  { id: "a4", name: "A4", widthIn: 8.27, heightIn: 11.69, dpi: 300 },
  { id: "letter", name: "Letter", widthIn: 8.5, heightIn: 11, dpi: 300 },
]

export type PrintLayoutConfig = {
  paperSize: PaperSize
  copies: number
  borderIn: number
  marginIn: number
  gapIn: number
  showCutMarks: boolean
  showPhotoBorders: boolean
  showSpacing: boolean
  portrait?: boolean
}

export type CalculatedGrid = {
  cols: number
  rows: number
  canvasW: number
  canvasH: number
  cellW: number
  cellH: number
  photoAreaW: number
  photoAreaH: number
  marginXPx: number
  marginYPx: number
  /** Copies drawn on this page (≤ cols × rows) */
  copiesOnPage: number
}

function pagePixels(config: PrintLayoutConfig) {
  const { paperSize, portrait } = config
  const dpi = paperSize.dpi
  return {
    pw: (portrait ? paperSize.heightIn : paperSize.widthIn) * dpi,
    ph: (portrait ? paperSize.widthIn : paperSize.heightIn) * dpi,
    dpi,
    m: config.marginIn * dpi,
    g: config.showSpacing ? config.gapIn * dpi : 0,
    b: config.showPhotoBorders ? config.borderIn * dpi : 0,
  }
}

/** Each photo prints at true pixel size → photoW/dpi × photoH/dpi inches on paper */
function cellDimensions(photoW: number, photoH: number, b: number) {
  return {
    cellW: photoW + b * 2,
    cellH: photoH + b * 2,
    photoAreaW: photoW,
    photoAreaH: photoH,
  }
}

function gridFitsPage(
  cols: number,
  rows: number,
  cellW: number,
  cellH: number,
  pw: number,
  ph: number,
  m: number,
  g: number,
): boolean {
  const usableW = pw - m * 2
  const usableH = ph - m * 2
  const totalW = cols * cellW + (cols - 1) * g
  const totalH = rows * cellH + (rows - 1) * g
  return totalW <= usableW && totalH <= usableH
}

/** Best top-left grid for exactly `copies` photos at full portrait pixel size */
export function calculateGridForCopies(
  copies: number,
  config: PrintLayoutConfig,
  photoW: number,
  photoH: number,
): CalculatedGrid | null {
  if (copies < 1) return null

  const { pw, ph, m, g, b, dpi } = pagePixels(config)
  const { cellW, cellH, photoAreaW, photoAreaH } = cellDimensions(photoW, photoH, b)

  let best: { cols: number; rows: number; waste: number; extraSlots: number } | null = null

  for (let cols = 1; cols <= copies; cols++) {
    const rows = Math.ceil(copies / cols)
    if (!gridFitsPage(cols, rows, cellW, cellH, pw, ph, m, g)) continue

    const slots = cols * rows
    const usableW = pw - m * 2
    const usableH = ph - m * 2
    const totalW = cols * cellW + (cols - 1) * g
    const totalH = rows * cellH + (rows - 1) * g
    const waste = (usableW - totalW) + (usableH - totalH)
    const extraSlots = slots - copies

    const better =
      !best ||
      extraSlots < best.extraSlots ||
      (extraSlots === best.extraSlots && waste < best.waste) ||
      (extraSlots === best.extraSlots && waste === best.waste && cols > best.cols)

    if (better) {
      best = { cols, rows, waste, extraSlots }
    }
  }

  if (!best) return null

  return {
    cols: best.cols,
    rows: best.rows,
    canvasW: pw,
    canvasH: ph,
    cellW,
    cellH,
    photoAreaW,
    photoAreaH,
    marginXPx: m,
    marginYPx: m,
    copiesOnPage: copies,
  }
}

/** Maximum copies that fit on one sheet at true portrait dimensions */
export function maxCopiesOnPage(
  config: PrintLayoutConfig,
  photoW: number,
  photoH: number,
): number {
  for (let n = 100; n >= 1; n--) {
    if (calculateGridForCopies(n, config, photoW, photoH)) return n
  }
  return 1
}

/** Split total copies across pages; every photo stays true output pixel size */
export function planPrintPages(
  totalCopies: number,
  config: PrintLayoutConfig,
  photoW: number,
  photoH: number,
): CalculatedGrid[] {
  const pages: CalculatedGrid[] = []
  let remaining = totalCopies
  const perPageMax = maxCopiesOnPage(config, photoW, photoH)

  while (remaining > 0) {
    const onPage = Math.min(remaining, perPageMax)
    const grid = calculateGridForCopies(onPage, config, photoW, photoH)
    if (!grid) break
    pages.push(grid)
    remaining -= onPage
  }

  if (pages.length === 0 && totalCopies > 0) {
    const fallback = calculateGridForCopies(1, config, photoW, photoH)
    if (fallback) pages.push(fallback)
  }

  return pages
}

/** @deprecated Use calculateGridForCopies / planPrintPages */
export function calculateGrid(
  config: PrintLayoutConfig,
  photoW: number,
  photoH: number,
): CalculatedGrid & { totalFit: number } {
  const perPage = maxCopiesOnPage(config, photoW, photoH)
  const grid =
    calculateGridForCopies(Math.min(config.copies, perPage), config, photoW, photoH) ??
    calculateGridForCopies(1, config, photoW, photoH)!
  return { ...grid, totalFit: perPage }
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

function drawPage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  grid: CalculatedGrid,
  config: PrintLayoutConfig,
) {
  const dpi = config.paperSize.dpi
  const b = config.showPhotoBorders ? config.borderIn * dpi : 0
  const gapPx = config.showSpacing ? config.gapIn * dpi : 0

  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, grid.canvasW, grid.canvasH)

  if (config.showCutMarks) {
    ctx.strokeStyle = "#CCCCCC"
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    for (let i = 0; i < grid.copiesOnPage; i++) {
      const r = Math.floor(i / grid.cols)
      const c = i % grid.cols
      const x = grid.marginXPx + c * (grid.cellW + gapPx) + b
      const y = grid.marginYPx + r * (grid.cellH + gapPx) + b
      ctx.strokeRect(x, y, grid.photoAreaW, grid.photoAreaH)
    }
    ctx.setLineDash([])
  }

  for (let i = 0; i < grid.copiesOnPage; i++) {
    const r = Math.floor(i / grid.cols)
    const c = i % grid.cols
    const cellX = grid.marginXPx + c * (grid.cellW + gapPx)
    const cellY = grid.marginYPx + r * (grid.cellH + gapPx)

    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(cellX, cellY, grid.cellW, grid.cellH)

    if (config.showPhotoBorders) {
      ctx.strokeStyle = "#BBBBBB"
      ctx.lineWidth = 1
      ctx.strokeRect(cellX + 0.5, cellY + 0.5, grid.cellW - 1, grid.cellH - 1)
    }

    const photoX = cellX + b
    const photoY = cellY + b
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(img, photoX, photoY, grid.photoAreaW, grid.photoAreaH)
  }

  if (config.showCutMarks) {
    const markLen = 12
    ctx.strokeStyle = "#999999"
    ctx.lineWidth = 1
    for (let i = 0; i < grid.copiesOnPage; i++) {
      const r = Math.floor(i / grid.cols)
      const c = i % grid.cols
      const x = grid.marginXPx + c * (grid.cellW + gapPx) - 1
      const y = grid.marginYPx + r * (grid.cellH + gapPx) - 1
      const cx = x + grid.cellW + 2
      const cy = y + grid.cellH + 2

      ctx.beginPath()
      ctx.moveTo(x, y + markLen)
      ctx.lineTo(x, y)
      ctx.lineTo(x + markLen, y)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(cx - markLen, y)
      ctx.lineTo(cx, y)
      ctx.lineTo(cx, y + markLen)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(x, cy - markLen)
      ctx.lineTo(x, cy)
      ctx.lineTo(x + markLen, cy)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(cx - markLen, cy)
      ctx.lineTo(cx, cy)
      ctx.lineTo(cx, cy - markLen)
      ctx.stroke()
    }
  }
}

function renderPageCanvas(
  img: HTMLImageElement,
  grid: CalculatedGrid,
  config: PrintLayoutConfig,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = grid.canvasW
  canvas.height = grid.canvasH
  drawPage(canvas.getContext("2d")!, img, grid, config)
  return canvas
}

/** One or more full-size print pages at true portrait dimensions per copy */
export async function renderPrintPages(
  photoUrl: string,
  config: PrintLayoutConfig,
  photoWidth: number,
  photoHeight: number,
): Promise<HTMLCanvasElement[]> {
  const img = await loadImage(photoUrl)
  const layouts = planPrintPages(config.copies, config, photoWidth, photoHeight)
  return layouts.map((grid) => renderPageCanvas(img, grid, config))
}

/** First page only (legacy) */
export async function renderPrintSheet(
  photoUrl: string,
  config: PrintLayoutConfig,
  photoWidth: number,
  photoHeight: number,
): Promise<HTMLCanvasElement> {
  const pages = await renderPrintPages(photoUrl, config, photoWidth, photoHeight)
  return pages[0]!
}

export function getPhotoPrintSizeInches(photoW: number, photoH: number, dpi: number) {
  return {
    widthIn: photoW / dpi,
    heightIn: photoH / dpi,
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas to Blob failed"))),
      "image/png",
    )
  })
}
