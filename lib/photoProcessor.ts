import { removeBackground } from "@imgly/background-removal";

export type Preset = {
  id: string;
  name: string;
  category: string;
  description: string;
  widthPx: number;
  heightPx: number;
  minKB: number;
  maxKB: number;
  format: "jpeg" | "png";
  bgColor: string;
  eyeLinePct?: number;
  headHeightPct?: number;
  signature?: boolean;
};

export const PRESETS: Preset[] = [
  { id:"india-passport", name:"Indian Passport / Visa", category:"India · Identity", description:"200×230 px · 20–50 KB · white bg", widthPx:200, heightPx:230, minKB:20, maxKB:50, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"india-pan", name:"PAN Card", category:"India · Identity", description:"213×213 px · 20–50 KB", widthPx:213, heightPx:213, minKB:20, maxKB:50, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"india-aadhaar", name:"Aadhaar Enrollment", category:"India · Identity", description:"300×400 px · max 100 KB", widthPx:300, heightPx:400, minKB:20, maxKB:100, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"india-voter", name:"Voter ID (EPIC)", category:"India · Identity", description:"300×300 px · 20–100 KB", widthPx:300, heightPx:300, minKB:20, maxKB:100, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"india-dl", name:"Driving Licence (Parivahan)", category:"India · Identity", description:"240×320 px · max 200 KB", widthPx:240, heightPx:320, minKB:20, maxKB:200, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"india-ews", name:"EWS / Caste Certificate", category:"India · Identity", description:"200×230 px · 10–50 KB", widthPx:200, heightPx:230, minKB:10, maxKB:50, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"arunachal-ilp", name:"Arunachal Pradesh ILP", category:"India · Travel Permits", description:"100×100 px · 200–500 KB", widthPx:100, heightPx:100, minKB:200, maxKB:500, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"nagaland-ilp", name:"Nagaland ILP", category:"India · Travel Permits", description:"150×200 px · 20–100 KB", widthPx:150, heightPx:200, minKB:20, maxKB:100, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"mizoram-ilp", name:"Mizoram ILP", category:"India · Travel Permits", description:"150×200 px · 20–100 KB", widthPx:150, heightPx:200, minKB:20, maxKB:100, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"sikkim-pap", name:"Sikkim Protected Area Permit", category:"India · Travel Permits", description:"200×230 px · 20–80 KB", widthPx:200, heightPx:230, minKB:20, maxKB:80, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"upsc", name:"UPSC Civil Services", category:"India · Exams", description:"350×350 px · 20–300 KB", widthPx:350, heightPx:350, minKB:20, maxKB:300, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"ssc", name:"SSC (CGL / CHSL / MTS)", category:"India · Exams", description:"200×230 px · 20–50 KB", widthPx:200, heightPx:230, minKB:20, maxKB:50, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"neet", name:"NEET (NTA)", category:"India · Exams", description:"200×230 px · 10–200 KB", widthPx:200, heightPx:230, minKB:10, maxKB:200, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"jee", name:"JEE Main / Advanced", category:"India · Exams", description:"200×230 px · 10–200 KB", widthPx:200, heightPx:230, minKB:10, maxKB:200, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"cat", name:"CAT (IIM)", category:"India · Exams", description:"240×320 px · max 80 KB", widthPx:240, heightPx:320, minKB:15, maxKB:80, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"gate", name:"GATE", category:"India · Exams", description:"240×320 px · 5–200 KB", widthPx:240, heightPx:320, minKB:5, maxKB:200, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"ibps", name:"IBPS / Bank PO", category:"India · Exams", description:"200×230 px · 20–50 KB", widthPx:200, heightPx:230, minKB:20, maxKB:50, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"railway-rrb", name:"Railway RRB", category:"India · Exams", description:"240×320 px · 15–40 KB", widthPx:240, heightPx:320, minKB:15, maxKB:40, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"irctc", name:"IRCTC / Indian Railways", category:"India · Travel", description:"200×230 px · 20–50 KB", widthPx:200, heightPx:230, minKB:20, maxKB:50, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"us-passport", name:"US Passport / Visa", category:"International", description:"600×600 px · 50–240 KB", widthPx:600, heightPx:600, minKB:50, maxKB:240, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"uk-passport", name:"UK Passport", category:"International", description:"600×750 px · 50–250 KB", widthPx:600, heightPx:750, minKB:50, maxKB:250, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"schengen", name:"Schengen Visa", category:"International", description:"413×531 px · 20–500 KB", widthPx:413, heightPx:531, minKB:20, maxKB:500, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"canada-visa", name:"Canada Visa / PR", category:"International", description:"420×540 px · 60–240 KB", widthPx:420, heightPx:540, minKB:60, maxKB:240, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"australia-visa", name:"Australia Visa", category:"International", description:"413×531 px · 40–500 KB", widthPx:413, heightPx:531, minKB:40, maxKB:500, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"china-visa", name:"China Visa", category:"International", description:"354×472 px · 40–120 KB", widthPx:354, heightPx:472, minKB:40, maxKB:120, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"japan-visa", name:"Japan Visa", category:"International", description:"413×531 px · 20–100 KB", widthPx:413, heightPx:531, minKB:20, maxKB:100, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"uae-visa", name:"UAE Visa", category:"International", description:"300×369 px · 20–100 KB", widthPx:300, heightPx:369, minKB:20, maxKB:100, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"linkedin", name:"LinkedIn Profile", category:"Professional", description:"400×400 px · up to 8 MB", widthPx:400, heightPx:400, minKB:30, maxKB:800, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"resume", name:"Resume / CV", category:"Professional", description:"300×400 px · 50–200 KB", widthPx:300, heightPx:400, minKB:50, maxKB:200, format:"jpeg", bgColor:"#FFFFFF" },
  { id:"sig-standard", name:"Standard Signature", category:"Signatures", description:"531×413 px · 10–50 KB · white background", widthPx:531, heightPx:413, minKB:10, maxKB:50, format:"jpeg", bgColor:"#FFFFFF", signature:true },
  { id:"sig-small", name:"Small Signature", category:"Signatures", description:"300×200 px · 5–30 KB", widthPx:300, heightPx:200, minKB:5, maxKB:30, format:"jpeg", bgColor:"#FFFFFF", signature:true },
  { id:"sig-square", name:"Square Signature", category:"Signatures", description:"250×250 px · 5–30 KB", widthPx:250, heightPx:250, minKB:5, maxKB:30, format:"jpeg", bgColor:"#FFFFFF", signature:true },
  { id:"sig-wide", name:"Wide Signature (forms)", category:"Signatures", description:"600×200 px · 10–50 KB", widthPx:600, heightPx:200, minKB:10, maxKB:50, format:"jpeg", bgColor:"#FFFFFF", signature:true },
  { id:"custom", name:"Custom — tweak any value", category:"Custom", description:"Define your own dimensions and file size", widthPx:200, heightPx:230, minKB:20, maxKB:50, format:"jpeg", bgColor:"#FFFFFF" },
];

export type CropRegion = {
  x: number
  y: number
  width: number
  height: number
}

export type ProcessOptions = {
  widthPx: number;
  heightPx: number;
  minKB: number;
  maxKB: number;
  format: "jpeg" | "png";
  bgColor: string;
  headHeightPct?: number;
  eyeLinePct?: number;
  sourceCrop?: CropRegion;
  signature?: boolean;
};

export type AdjustmentOptions = {
  offsetX: number;
  offsetY: number;
  scale: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  sharpen: number;
  upscaleFactor: number;
  redEyeRemoval: number;
  skinSmoothing: number;
};

export const DEFAULT_ADJUSTMENTS: AdjustmentOptions = {
  offsetX: 0, offsetY: 0, scale: 1,
  brightness: 0, contrast: 0, saturation: 0, hue: 0, sharpen: 0, upscaleFactor: 1,
  redEyeRemoval: 0, skinSmoothing: 0,
};

export type ProcessResult = {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  sizeKB: number;
  format: string;
  withinSizeRange: boolean;
  notes: string[];
};

export type PipelineStep = {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const blobToDataURL = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

function findSubjectBounds(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;
  const step = 2;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 32) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }
  if (!found) return { x: 0, y: 0, w: width, h: height };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function estimateHeadGeometry(canvas: HTMLCanvasElement, bounds: { x: number; y: number; w: number; h: number }) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;

  const rowWidths: number[] = new Array(height).fill(0);
  const rowLeft: number[] = new Array(height).fill(width);
  const rowRight: number[] = new Array(height).fill(0);

  const yStart = Math.max(0, bounds.y);
  const yEnd = Math.min(height, bounds.y + bounds.h);

  for (let y = yStart; y < yEnd; y++) {
    let l = -1, r = -1;
    for (let x = bounds.x; x < bounds.x + bounds.w; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 64) {
        if (l === -1) l = x;
        r = x;
      }
    }
    if (l !== -1) {
      rowLeft[y] = l;
      rowRight[y] = r;
      rowWidths[y] = r - l;
    }
  }

  let headTop = yStart;
  for (let y = yStart; y < yEnd; y++) {
    if (rowWidths[y] > Math.max(8, bounds.w * 0.05)) { headTop = y; break; }
  }

  const scanEnd = Math.min(yEnd, headTop + Math.round(bounds.h * 0.5));
  let peakHeadWidth = 0;
  let peakHeadY = headTop;
  for (let y = headTop; y < scanEnd; y++) {
    if (rowWidths[y] > peakHeadWidth) {
      peakHeadWidth = rowWidths[y];
      peakHeadY = y;
    }
  }
  if (peakHeadWidth === 0) peakHeadWidth = bounds.w;

  const neckSearchEnd = Math.min(yEnd, peakHeadY + Math.round(bounds.h * 0.35));
  let neckWidth = peakHeadWidth;
  let neckY = peakHeadY;
  for (let y = peakHeadY + 2; y < neckSearchEnd; y++) {
    if (rowWidths[y] > 0 && rowWidths[y] < neckWidth) {
      neckWidth = rowWidths[y];
      neckY = y;
    }
    if (rowWidths[y] > peakHeadWidth * 1.15) break;
  }

  const estimatedHeadBottom = headTop + Math.round(peakHeadWidth * 1.4);
  const chinY = neckY > headTop ? Math.min(neckY, estimatedHeadBottom) : estimatedHeadBottom;

  let sumX = 0, count = 0;
  for (let y = headTop; y <= chinY; y++) {
    if (rowWidths[y] > 0) {
      sumX += (rowLeft[y] + rowRight[y]) / 2;
      count++;
    }
  }
  const faceCenterX = count > 0 ? sumX / count : bounds.x + bounds.w / 2;

  const headHeight = Math.max(8, chinY - headTop);
  const eyeY = headTop + headHeight * 0.45;

  return { headTop, chinY, headHeight, headWidth: peakHeadWidth, faceCenterX, eyeY };
}

function applyRedEyeRemoval(data: Uint8ClampedArray, width: number, height: number, intensity: number) {
  if (intensity <= 0) return;
  const threshold = Math.max(20, 120 - intensity * 1.2);
  const desatAmount = intensity / 100;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r > g + b + threshold && r > 80) {
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      data[i] = Math.round(r + (gray - r) * desatAmount);
      data[i + 1] = Math.round(g + (gray - g) * desatAmount);
      data[i + 2] = Math.round(b + (gray - b) * desatAmount);
    }
  }
}

function applySkinSmoothing(ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) {
  if (intensity <= 0) return;
  const src = ctx.getImageData(0, 0, width, height);
  const srcData = new Uint8ClampedArray(src.data);
  const radius = Math.max(1, Math.round(intensity / 20));
  const blurData = new Uint8ClampedArray(src.data.length);
  const amt = intensity / 100;
  const edgeThreshold = Math.max(5, 30 - intensity * 0.25);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const px = x + kx, py = y + ky;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const idx = (py * width + px) * 4;
            rSum += srcData[idx];
            gSum += srcData[idx + 1];
            bSum += srcData[idx + 2];
            count++;
          }
        }
      }
      const i = (y * width + x) * 4;
      blurData[i] = rSum / count;
      blurData[i + 1] = gSum / count;
      blurData[i + 2] = bSum / count;
    }
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const edge = Math.abs(srcData[i] - srcData[((y - 1) * width + x) * 4])
        + Math.abs(srcData[i + 1] - srcData[((y - 1) * width + x) * 4 + 1])
        + Math.abs(srcData[i + 2] - srcData[((y - 1) * width + x) * 4 + 2])
        + Math.abs(srcData[i] - srcData[(y * width + x + 1) * 4])
        + Math.abs(srcData[i + 1] - srcData[(y * width + x + 1) * 4 + 1])
        + Math.abs(srcData[i + 2] - srcData[(y * width + x + 1) * 4 + 2]);
      const blend = Math.max(0, Math.min(1, 1 - edge / edgeThreshold)) * amt;
      src.data[i] = Math.round(srcData[i] + (blurData[i] - srcData[i]) * blend);
      src.data[i + 1] = Math.round(srcData[i + 1] + (blurData[i + 1] - srcData[i + 1]) * blend);
      src.data[i + 2] = Math.round(srcData[i + 2] + (blurData[i + 2] - srcData[i + 2]) * blend);
    }
  }
  ctx.putImageData(src, 0, 0);
}

function applyAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adj: AdjustmentOptions,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const brightness = adj.brightness / 100;
  const contrast = adj.contrast / 100;
  const satAdjust = adj.saturation / 100;
  const hueShift = adj.hue;
  const sharpenAmt = adj.sharpen / 100;

  // Color adjustments
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (brightness !== 0) {
      r += brightness * 255;
      g += brightness * 255;
      b += brightness * 255;
    }

    if (contrast !== 0) {
      const factor = contrast + 1;
      r = (r - 128) * factor + 128;
      g = (g - 128) * factor + 128;
      b = (b - 128) * factor + 128;
    }

    if (satAdjust !== 0 || hueShift !== 0) {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      let h = 0;
      let s = max === 0 ? 0 : delta / max;
      const l = (max + min) / 2;

      if (delta !== 0) {
        if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
        else if (max === g) h = ((b - r) / delta + 2) * 60;
        else if (max === b) h = ((r - g) / delta + 4) * 60;
      }

      if (hueShift !== 0) {
        h = (h + hueShift) % 360;
        if (h < 0) h += 360;
      }

      if (satAdjust !== 0) s = Math.max(0, Math.min(1, s + satAdjust));

      if (s === 0) {
        r = g = b = Math.round(l * 255);
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const hNorm = h / 360;
        r = Math.round(hue2rgb(p, q, hNorm + 1/3) * 255);
        g = Math.round(hue2rgb(p, q, hNorm) * 255);
        b = Math.round(hue2rgb(p, q, hNorm - 1/3) * 255);
      }
    }

    data[i] = Math.max(0, Math.min(255, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }

  ctx.putImageData(imageData, 0, 0);

  // Red-eye removal
  if (adj.redEyeRemoval > 0) {
    const redEyeData = ctx.getImageData(0, 0, width, height);
    applyRedEyeRemoval(redEyeData.data, width, height, adj.redEyeRemoval);
    ctx.putImageData(redEyeData, 0, 0);
  }

  // Skin smoothing
  if (adj.skinSmoothing > 0) {
    applySkinSmoothing(ctx, width, height, adj.skinSmoothing);
  }

  // Sharpen via unsharp mask at current resolution
  if (sharpenAmt > 0) {
    const sharpData = ctx.getImageData(0, 0, width, height);
    const srcData = new Uint8Array(sharpData.data);
    const half = 1;
    const amount = sharpenAmt * 3;

    for (let y = half; y < height - half; y++) {
      for (let x = half; x < width - half; x++) {
        for (let c = 0; c < 3; c++) {
          const idx = (y * width + x) * 4 + c;
          let sum = 0;
          for (let ky = -half; ky <= half; ky++) {
            for (let kx = -half; kx <= half; kx++) {
              sum += srcData[((y + ky) * width + (x + kx)) * 4 + c];
            }
          }
          const blurred = sum / 9;
          const original = srcData[idx];
          sharpData.data[idx] = Math.max(0, Math.min(255,
            Math.round(original + (original - blurred) * amount)
          ));
        }
      }
    }
    ctx.putImageData(sharpData, 0, 0);
  }
}

async function encodeJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("JPEG encode failed"))),
      "image/jpeg",
      quality,
    );
  });
}

async function encodePng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encode failed"))), "image/png");
  });
}

async function padJpegToSizeAsync(blob: Blob, targetBytes: number): Promise<Blob> {
  const buffer = await blob.arrayBuffer();
  const src = new Uint8Array(buffer);
  if (src.length >= targetBytes) return blob;
  if (src[0] !== 0xff || src[1] !== 0xd8) return blob;

  const extraNeeded = targetBytes - src.length;
  const MAX_DATA = 65533;
  const segments: Uint8Array[] = [];
  let remaining = extraNeeded;
  while (remaining > 0) {
    const segSize = Math.min(MAX_DATA + 4, remaining);
    const dataLen = segSize - 4;
    const seg = new Uint8Array(segSize);
    seg[0] = 0xff; seg[1] = 0xfe;
    const len = dataLen + 2;
    seg[2] = (len >> 8) & 0xff;
    seg[3] = len & 0xff;
    remaining -= segSize;
    segments.push(seg);
  }

  const totalExtra = segments.reduce((a, s) => a + s.length, 0);
  const out = new Uint8Array(src.length + totalExtra);
  out[0] = src[0];
  out[1] = src[1];
  let off = 2;
  for (const seg of segments) {
    out.set(seg, off);
    off += seg.length;
  }
  out.set(src.subarray(2), off);
  return new Blob([out], { type: "image/jpeg" });
}

async function fitToFileSize(
  canvas: HTMLCanvasElement,
  format: "jpeg" | "png",
  minKB: number,
  maxKB: number,
  notes: string[],
): Promise<Blob> {
  const minBytes = minKB * 1024;
  const maxBytes = maxKB * 1024;

  if (format === "png") {
    let blob = await encodePng(canvas);
    if (blob.size > maxBytes) {
      notes.push(`PNG is ${(blob.size/1024).toFixed(1)} KB — exceeds ${maxKB} KB max. Try JPEG.`);
    }
    if (blob.size < minBytes) {
      const jpeg = await encodeJpeg(canvas, 0.95);
      blob = await padJpegToSizeAsync(jpeg, minBytes);
      notes.push("Converted to JPEG with padding to meet minimum file size.");
    }
    return blob;
  }

  let lo = 0.1, hi = 0.98;
  let chosen: Blob | null = null;

  const highQ = await encodeJpeg(canvas, 0.98);
  if (highQ.size <= maxBytes) {
    chosen = highQ;
  } else {
    for (let i = 0; i < 15; i++) {
      const q = (lo + hi) / 2;
      const b = await encodeJpeg(canvas, q);
      if (b.size <= maxBytes) {
        chosen = b;
        lo = q;
      } else {
        hi = q;
      }
    }
    if (!chosen) {
      chosen = await encodeJpeg(canvas, 0.08);
      notes.push(`Even at lowest quality, file is ${(chosen.size/1024).toFixed(1)} KB — exceeds ${maxKB} KB max.`);
    }
  }

  if (chosen.size < minBytes) {
    const padded = await padJpegToSizeAsync(chosen, minBytes);
    const actualKB = padded.size / 1024;
    if (actualKB >= minKB) {
      notes.push(`Minimum size met.`);
    } else {
      notes.push(`File too small (${(chosen.size/1024).toFixed(1)} KB). Trying higher-resolution render…`);
      const bigCanvas = document.createElement("canvas");
      bigCanvas.width = canvas.width * 2;
      bigCanvas.height = canvas.height * 2;
      const bctx = bigCanvas.getContext("2d")!;
      bctx.imageSmoothingEnabled = true;
      bctx.imageSmoothingQuality = "high";
      bctx.scale(2, 2);
      bctx.drawImage(canvas, 0, 0);
      bctx.setTransform(1, 0, 0, 1, 0, 0);
      const biggerBlob = await encodeJpeg(bigCanvas, 0.95);
      const repadded = await padJpegToSizeAsync(biggerBlob, minBytes);
      notes.push(`Upscaled then padded to meet file size requirements.`);
      return repadded;
    }
    return padded;
  }

  if (chosen.size / 1024 > maxKB) {
    notes.push(`Final file ${(chosen.size/1024).toFixed(1)} KB slightly exceeds ${maxKB} KB max.`);
  }

  return chosen;
}

/** If crop extends beyond source canvas, pad with bgColor so it fills frame */
function ensureCropFits(
  source: HTMLCanvasElement,
  cropX: number, cropY: number, cropW: number, cropH: number,
  bgColor: string,
): { canvas: HTMLCanvasElement; cropX: number; cropY: number } {
  if (cropX >= 0 && cropY >= 0 && cropX + cropW <= source.width && cropY + cropH <= source.height) {
    return { canvas: source, cropX, cropY };
  }
  const padL = Math.max(0, -cropX);
  const padT = Math.max(0, -cropY);
  const padR = Math.max(0, cropX + cropW - source.width);
  const padB = Math.max(0, cropY + cropH - source.height);
  const padded = document.createElement("canvas");
  padded.width = source.width + padL + padR;
  padded.height = source.height + padT + padB;
  const ctx = padded.getContext("2d")!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, padded.width, padded.height);
  ctx.drawImage(source, padL, padT);
  return { canvas: padded, cropX: cropX + padL, cropY: cropY + padT };
}

/** Core compose-and-crop logic shared by both processPhoto and reprocessPhoto */
async function composeAndCrop(
  cutoutCanvas: HTMLCanvasElement,
  opts: ProcessOptions,
  adjustments: AdjustmentOptions,
  notes: string[],
): Promise<HTMLCanvasElement> {
  const headHeightPct = opts.headHeightPct ?? 0.7;
  const eyeLinePct = opts.eyeLinePct ?? 0.4;
  const targetAspect = opts.widthPx / opts.heightPx;

  const bounds = findSubjectBounds(cutoutCanvas);
  const geom = estimateHeadGeometry(cutoutCanvas, bounds);

  let cropH = geom.headHeight / headHeightPct;
  let cropW = cropH * targetAspect;

  const scale = adjustments.scale;
  cropW /= scale;
  cropH /= scale;

  let cropY = geom.eyeY - cropH * eyeLinePct;
  let cropX = geom.faceCenterX - cropW / 2;

  cropX -= adjustments.offsetX;
  cropY -= adjustments.offsetY;

  // Compose cutout onto bg-colored canvas
  const composed = document.createElement("canvas");
  composed.width = cutoutCanvas.width;
  composed.height = cutoutCanvas.height;
  const cctx = composed.getContext("2d")!;
  cctx.fillStyle = opts.bgColor;
  cctx.fillRect(0, 0, composed.width, composed.height);
  cctx.drawImage(cutoutCanvas, 0, 0);

  // Ensure crop fits within canvas (pad if needed)
  const { canvas: srcCanvas, cropX: cx, cropY: cy } = ensureCropFits(
    composed, cropX, cropY, cropW, cropH, opts.bgColor,
  );

  // Upscale factor
  const upscale = adjustments.upscaleFactor;

  // Render cropped region onto upscaled working canvas
  const workCanvas = document.createElement("canvas");
  workCanvas.width = opts.widthPx * upscale;
  workCanvas.height = opts.heightPx * upscale;
  const wctx = workCanvas.getContext("2d")!;
  wctx.imageSmoothingEnabled = true;
  wctx.imageSmoothingQuality = "high";
  wctx.fillStyle = opts.bgColor;
  wctx.fillRect(0, 0, workCanvas.width, workCanvas.height);

  // Draw cropped region to fill the entire upscaled canvas (no margins)
  wctx.drawImage(srcCanvas, cx, cy, cropW, cropH, 0, 0, workCanvas.width, workCanvas.height);

  // Apply image adjustments (color + sharpen) at the upscaled resolution
  applyAdjustments(wctx, workCanvas.width, workCanvas.height, adjustments);

  // Downscale to target dimensions if upscaled
  if (upscale > 1) {
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = opts.widthPx;
    finalCanvas.height = opts.heightPx;
    const fctx = finalCanvas.getContext("2d")!;
    fctx.imageSmoothingEnabled = true;
    fctx.imageSmoothingQuality = "high";
    fctx.drawImage(workCanvas, 0, 0, opts.widthPx, opts.heightPx);
    notes.push(`Upscaled ${upscale}x for higher quality, then downscaled to target.`);
    return finalCanvas;
  }

  return workCanvas;
}

export async function processPhoto(
  file: File,
  opts: ProcessOptions,
  adjustments: AdjustmentOptions = DEFAULT_ADJUSTMENTS,
  onProgress?: (msg: string) => void,
  onStep?: (stepId: string, status: "running" | "done" | "error") => void,
): Promise<ProcessResult & { cutoutDataURL?: string }> {
  const notes: string[] = [];

  onProgress?.("Loading image…");
  onStep?.("load", "running");
  const fileURL = URL.createObjectURL(file);
  const originalImg = await loadImage(fileURL);
  onStep?.("load", "done");

  let cutoutDataURL: string | undefined;
  let finalCanvas: HTMLCanvasElement;

  if (opts.signature) {
    // Signature path — no bg removal, no face detection; just resize to fill target
    onProgress?.("Resizing signature…");
    onStep?.("bg-removal", "done");
    onStep?.("detect", "done");
    onStep?.("compose", "running");
    cutoutDataURL = await blobToDataURL(file);

    const canvas = document.createElement("canvas");
    canvas.width = opts.widthPx;
    canvas.height = opts.heightPx;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const srcW = originalImg.naturalWidth;
    const srcH = originalImg.naturalHeight;
    const srcAspect = srcW / srcH;
    const tgtAspect = opts.widthPx / opts.heightPx;

    let dw: number, dh: number, dx: number, dy: number;
    if (srcAspect > tgtAspect) {
      dw = canvas.width;
      dh = canvas.width / srcAspect;
      dx = 0;
      dy = (canvas.height - dh) / 2;
    } else {
      dh = canvas.height;
      dw = canvas.height * srcAspect;
      dx = (canvas.width - dw) / 2;
      dy = 0;
    }
    ctx.drawImage(originalImg, dx, dy, dw, dh);

    // Apply adjustments
    applyAdjustments(ctx, canvas.width, canvas.height, adjustments);

    finalCanvas = canvas;
    onStep?.("detect", "done");
    onStep?.("compose", "done");
  } else {
    onProgress?.("Removing background.…");
    onStep?.("bg-removal", "running");
    let cutoutBlob: Blob;
    try {
      cutoutBlob = await removeBackground(fileURL, {
        output: { format: "image/png", quality: 1 },
      });
      onStep?.("bg-removal", "done");
      cutoutDataURL = await blobToDataURL(cutoutBlob);
    } catch (err) {
      onStep?.("bg-removal", "error");
      notes.push("Background removal failed.");
      URL.revokeObjectURL(fileURL);
      throw err;
    }

    onProgress?.("Loading cutout…");
    const cutoutImg = await loadImage(cutoutDataURL);

    const cutoutCanvas = document.createElement("canvas");
    cutoutCanvas.width = cutoutImg.naturalWidth;
    cutoutCanvas.height = cutoutImg.naturalHeight;
    cutoutCanvas.getContext("2d")!.drawImage(cutoutImg, 0, 0);

    // Apply source crop if specified
    let processCanvas = cutoutCanvas;
    if (opts.sourceCrop) {
      const { x, y, width, height } = opts.sourceCrop;
      const cropW = Math.round(cutoutCanvas.width * width)
      const cropH = Math.round(cutoutCanvas.height * height)
      const cropX = Math.round(cutoutCanvas.width * x)
      const cropY = Math.round(cutoutCanvas.height * y)
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = cropW;
      cropCanvas.height = cropH;
      cropCanvas.getContext("2d")!.drawImage(
        cutoutCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH,
      );
      processCanvas = cropCanvas;
    }

    onProgress?.("Detecting face & framing portrait…");
    onStep?.("detect", "running");

    onProgress?.("Composing final image…");
    onStep?.("compose", "running");
    finalCanvas = await composeAndCrop(processCanvas, opts, adjustments, notes);
    onStep?.("detect", "done");
    onStep?.("compose", "done");
  }
  URL.revokeObjectURL(fileURL);

  onProgress?.("Optimizing file size…");
  onStep?.("size", "running");
  const blob = await fitToFileSize(finalCanvas, opts.format, opts.minKB, opts.maxKB, notes);
  onStep?.("size", "done");

  const sizeKB = blob.size / 1024;
  const withinSizeRange = sizeKB >= opts.minKB && sizeKB <= opts.maxKB;

  onProgress?.("Done!");
  onStep?.("done", "done");

  return {
    blob,
    url: URL.createObjectURL(blob),
    width: opts.widthPx,
    height: opts.heightPx,
    sizeKB,
    format: opts.format,
    withinSizeRange,
    notes,
    cutoutDataURL,
  };
}

export async function reprocessPhoto(
  cutoutDataURL: string,
  opts: ProcessOptions,
  adjustments: AdjustmentOptions = DEFAULT_ADJUSTMENTS,
  onProgress?: (msg: string) => void,
  onStep?: (stepId: string, status: "running" | "done" | "error") => void,
): Promise<ProcessResult> {
  const notes: string[] = [];

  onProgress?.("Re-composing…");
  onStep?.("detect", "running");
  const cutoutImg = await loadImage(cutoutDataURL);

  let finalCanvas: HTMLCanvasElement;

  if (opts.signature) {
    // Signature path — simple resize to fill target
    onStep?.("compose", "running");
    const canvas = document.createElement("canvas");
    canvas.width = opts.widthPx;
    canvas.height = opts.heightPx;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const srcW = cutoutImg.naturalWidth;
    const srcH = cutoutImg.naturalHeight;
    const srcAspect = srcW / srcH;
    const tgtAspect = opts.widthPx / opts.heightPx;

    let dw: number, dh: number, dx: number, dy: number;
    if (srcAspect > tgtAspect) {
      dw = canvas.width;
      dh = canvas.width / srcAspect;
      dx = 0;
      dy = (canvas.height - dh) / 2;
    } else {
      dh = canvas.height;
      dw = canvas.height * srcAspect;
      dx = (canvas.width - dw) / 2;
      dy = 0;
    }
    ctx.drawImage(cutoutImg, dx, dy, dw, dh);
    applyAdjustments(ctx, canvas.width, canvas.height, adjustments);
    finalCanvas = canvas;
    onStep?.("detect", "done");
    onStep?.("compose", "done");
  } else {
    const cutoutCanvas = document.createElement("canvas");
    cutoutCanvas.width = cutoutImg.naturalWidth;
    cutoutCanvas.height = cutoutImg.naturalHeight;
    cutoutCanvas.getContext("2d")!.drawImage(cutoutImg, 0, 0);
    onStep?.("detect", "done");

    onProgress?.("Composing final image…");
    onStep?.("compose", "running");
    finalCanvas = await composeAndCrop(cutoutCanvas, opts, adjustments, notes);
    onStep?.("compose", "done");
  }

  onProgress?.("Optimizing file size…");
  onStep?.("size", "running");
  const blob = await fitToFileSize(finalCanvas, opts.format, opts.minKB, opts.maxKB, notes);
  onStep?.("size", "done");

  const sizeKB = blob.size / 1024;
  const withinSizeRange = sizeKB >= opts.minKB && sizeKB <= opts.maxKB;

  onProgress?.("Done!");
  onStep?.("done", "done");

  return {
    blob,
    url: URL.createObjectURL(blob),
    width: opts.widthPx,
    height: opts.heightPx,
    sizeKB,
    format: opts.format,
    withinSizeRange,
    notes,
  };
}
