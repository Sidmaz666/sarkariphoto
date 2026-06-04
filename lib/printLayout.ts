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
  /** How many copies to arrange on the sheet */
  copies: number
  /** Border around each photo in inches */
  borderIn: number
  /** Margin around the page edge */
  marginIn: number
  /** Gap between photos */
  gapIn: number
  /** Should cut marks be drawn */
  showCutMarks: boolean
  /** Portrait orientation (swap paper width/height) */
  portrait?: boolean
}

export type CalculatedGrid = {
  cols: number
  rows: number
  /** Pixel dimensions of the print canvas */
  canvasW: number
  canvasH: number
  /** Pixel dimensions of each photo cell (photo + border) */
  cellW: number
  cellH: number
  /** Pixel dimensions of just the photo area (inside border) */
  photoAreaW: number
  photoAreaH: number
  /** Pixel offsets for margins */
  marginXPx: number
  marginYPx: number
  /** Total photos that fit (cols × rows) */
  totalFit: number
}

/** Calculate the best grid layout for the given config and photo dimensions */
export function calculateGrid(
  config: PrintLayoutConfig,
  photoW: number,
  photoH: number,
): CalculatedGrid {
  const { paperSize, copies, borderIn, marginIn, gapIn, portrait } = config
  const dpi = paperSize.dpi

  const pw = (portrait ? paperSize.heightIn : paperSize.widthIn) * dpi
  const ph = (portrait ? paperSize.widthIn : paperSize.heightIn) * dpi
  const m = marginIn * dpi
  const g = gapIn * dpi
  const b = borderIn * dpi

  // Photo area inside border
  const paW = photoW
  const paH = photoH

  // Cell = photo + 2× border
  const cellW = paW + b * 2
  const cellH = paH + b * 2

  // Usable area
  const usableW = pw - m * 2
  const usableH = ph - m * 2

  // Try to find the best grid arrangement
  let bestCols = 1
  let bestRows = 1
  let bestTotal = 1

  for (let cols = 1; cols <= 10; cols++) {
    const rows = Math.ceil(copies / cols)
    const totalW = cols * cellW + (cols - 1) * g
    const totalH = rows * cellH + (rows - 1) * g

    if (totalW <= usableW && totalH <= usableH) {
      if (cols * rows >= copies && cols * rows >= bestTotal) {
        bestCols = cols
        bestRows = rows
        bestTotal = cols * rows
      }
    }
  }

  // Fallback: if nothing fits, use 1×1 centered
  if (bestTotal < 1) {
    return {
      cols: 1, rows: 1,
      canvasW: pw, canvasH: ph,
      cellW: Math.min(paW + b * 2, usableW),
      cellH: Math.min(paH + b * 2, usableH),
      photoAreaW: paW, photoAreaH: paH,
      marginXPx: m, marginYPx: m,
      totalFit: 1,
    }
  }

  // Recalculate with the best grid
  const totalW = bestCols * cellW + (bestCols - 1) * g
  const totalH = bestRows * cellH + (bestRows - 1) * g

  // Center the grid on the page
  const marginXPx = (pw - totalW) / 2
  const marginYPx = (ph - totalH) / 2

  return {
    cols: bestCols,
    rows: bestRows,
    canvasW: pw,
    canvasH: ph,
    cellW,
    cellH,
    photoAreaW: paW,
    photoAreaH: paH,
    marginXPx,
    marginYPx,
    totalFit: bestTotal,
  }
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

  
/** Generate a print sheet canvas */
export async function renderPrintSheet(
  photoUrl: string,
  config: PrintLayoutConfig,
  photoWidth: number,
  photoHeight: number,
): Promise<HTMLCanvasElement> {
  const img = await loadImage(photoUrl)
  const grid = calculateGrid(config, photoWidth, photoHeight)
  const dpi = config.paperSize.dpi

  const canvas = document.createElement("canvas")
  canvas.width = grid.canvasW
  canvas.height = grid.canvasH
  const ctx = canvas.getContext("2d")!
  const b = config.borderIn * dpi

  // Fill with white
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw cut marks first (behind photos)
  if (config.showCutMarks) {
    ctx.strokeStyle = "#CCCCCC"
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])

    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const x = grid.marginXPx + c * (grid.cellW + config.gapIn * dpi) + b
        const y = grid.marginYPx + r * (grid.cellH + config.gapIn * dpi) + b
        ctx.strokeRect(x, y, grid.photoAreaW, grid.photoAreaH)
      }
    }

    ctx.setLineDash([])
  }

  // Draw each photo
  const copiesToDraw = Math.min(config.copies, grid.totalFit)
  for (let i = 0; i < copiesToDraw; i++) {
    const r = Math.floor(i / grid.cols)
    const c = i % grid.cols

    // Cell top-left (includes border)
    const cellX = grid.marginXPx + c * (grid.cellW + config.gapIn * dpi)
    const cellY = grid.marginYPx + r * (grid.cellH + config.gapIn * dpi)

    // Draw white border background
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(cellX, cellY, grid.cellW, grid.cellH)

    // Draw thin border line
    ctx.strokeStyle = "#DDDDDD"
    ctx.lineWidth = 0.5
    ctx.strokeRect(cellX, cellY, grid.cellW, grid.cellH)

    // Draw photo inside the border
    const photoX = cellX + b
    const photoY = cellY + b

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(img, photoX, photoY, grid.photoAreaW, grid.photoAreaH)
  }

  // Additional cut marks at corners
  if (config.showCutMarks) {
    const markLen = 12
    ctx.strokeStyle = "#999999"
    ctx.lineWidth = 1
    ctx.setLineDash([])

    // Corner marks at each photo
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const x = grid.marginXPx + c * (grid.cellW + config.gapIn * dpi) - 1
        const y = grid.marginYPx + r * (grid.cellH + config.gapIn * dpi) - 1
        const cx = x + grid.cellW + 2
        const cy = y + grid.cellH + 2

        // Top-left corner
        ctx.beginPath()
        ctx.moveTo(x, y + markLen)
        ctx.lineTo(x, y)
        ctx.lineTo(x + markLen, y)
        ctx.stroke()

        // Top-right corner
        ctx.beginPath()
        ctx.moveTo(cx - markLen, y)
        ctx.lineTo(cx, y)
        ctx.lineTo(cx, y + markLen)
        ctx.stroke()

        // Bottom-left corner
        ctx.beginPath()
        ctx.moveTo(x, cy - markLen)
        ctx.lineTo(x, cy)
        ctx.lineTo(x + markLen, cy)
        ctx.stroke()

        // Bottom-right corner
        ctx.beginPath()
        ctx.moveTo(cx - markLen, cy)
        ctx.lineTo(cx, cy)
        ctx.lineTo(cx, cy - markLen)
        ctx.stroke()
      }
    }
  }

  return canvas
}

/** Convert a canvas to a PNG blob */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas to Blob failed"))),
      "image/png",
    )
  })
}
