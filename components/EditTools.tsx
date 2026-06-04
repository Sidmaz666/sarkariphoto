"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  ArrowsOut,
  MagnifyingGlassPlus,
  Sun,
  CircleHalf,
  Drop,
  Palette,
  Sparkle,
  ArrowsIn,
} from "@phosphor-icons/react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { AdjustmentOptions } from "@/lib/photoProcessor"

interface EditToolsProps {
  adjustments: AdjustmentOptions
  onChange: (adj: AdjustmentOptions) => void
  onReset: () => void
  onReprocess: () => void
  isProcessing: boolean
  hasResult?: boolean
  className?: string
}

export function EditTools({
  adjustments,
  onChange,
  onReset,
  onReprocess,
  isProcessing,
  hasResult,
  className,
}: EditToolsProps) {
  const update = (partial: Partial<AdjustmentOptions>) => {
    onChange({ ...adjustments, ...partial })
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs defaultValue="frame">
        <TabsList className="w-full">
          <TabsTrigger value="frame" className="flex-1 gap-1.5">
            <ArrowsOut className="h-3.5 w-3.5" /> Frame
          </TabsTrigger>
          <TabsTrigger value="adjust" className="flex-1 gap-1.5">
            <Sun className="h-3.5 w-3.5" /> Adjust
          </TabsTrigger>
          <TabsTrigger value="enhance" className="flex-1 gap-1.5">
            <Sparkle className="h-3.5 w-3.5" /> Enhance
          </TabsTrigger>
        </TabsList>

        {/* ─── Frame Tab ───────────────────────────────── */}

        <TabsContent value="frame" className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Horizontal position</Label>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {adjustments.offsetX > 0 ? "+" : ""}{adjustments.offsetX}px
              </span>
            </div>
            <Slider
              value={[adjustments.offsetX]}
              onValueChange={([v]) => update({ offsetX: v })}
              min={-200}
              max={200}
              step={1}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Vertical position</Label>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {adjustments.offsetY > 0 ? "+" : ""}{adjustments.offsetY}px
              </span>
            </div>
            <Slider
              value={[adjustments.offsetY]}
              onValueChange={([v]) => update({ offsetY: v })}
              min={-200}
              max={200}
              step={1}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MagnifyingGlassPlus className="h-3 w-3 text-muted-foreground" />
                <Label>Zoom</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {Math.round(adjustments.scale * 100)}%
              </span>
            </div>
            <Slider
              value={[Math.round(adjustments.scale * 100)]}
              onValueChange={([v]) => update({ scale: v / 100 })}
              min={50}
              max={200}
              step={1}
            />
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="xs"
                onClick={() => update({ scale: 1 })}
                className="text-[10px] px-2"
              >
                <ArrowsIn className="h-3 w-3 mr-1" /> Reset
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ─── Adjust Tab ──────────────────────────────── */}

        <TabsContent value="adjust" className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sun className="h-3 w-3 text-muted-foreground" />
                <Label>Brightness</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.brightness}</span>
            </div>
            <Slider
              value={[adjustments.brightness]}
              onValueChange={([v]) => update({ brightness: v })}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CircleHalf className="h-3 w-3 text-muted-foreground" />
                <Label>Contrast</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.contrast}</span>
            </div>
            <Slider
              value={[adjustments.contrast]}
              onValueChange={([v]) => update({ contrast: v })}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Drop className="h-3 w-3 text-muted-foreground" />
                <Label>Saturation</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.saturation}</span>
            </div>
            <Slider
              value={[adjustments.saturation]}
              onValueChange={([v]) => update({ saturation: v })}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Palette className="h-3 w-3 text-muted-foreground" />
                <Label>Hue</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.hue}°</span>
            </div>
            <Slider
              value={[adjustments.hue]}
              onValueChange={([v]) => update({ hue: v })}
              min={0}
              max={360}
              step={1}
            />
          </div>
        </TabsContent>

        {/* ─── Enhance Tab ─────────────────────────────── */}

        <TabsContent value="enhance" className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkle className="h-3 w-3 text-muted-foreground" />
                <Label>Sharpen</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{adjustments.sharpen}</span>
            </div>
            <Slider
              value={[adjustments.sharpen]}
              onValueChange={([v]) => update({ sharpen: v })}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MagnifyingGlassPlus className="h-3 w-3 text-muted-foreground" />
                <Label>Upscale</Label>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {adjustments.upscaleFactor}x
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((f) => (
                <Button
                  key={f}
                  variant={adjustments.upscaleFactor === f ? "default" : "outline"}
                  size="xs"
                  onClick={() => update({ upscaleFactor: f })}
                  className="text-[10px] rounded-md"
                >
                  {f}x
                </Button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Upscale renders at higher resolution then downscales for crisper output. Only helps file size slightly.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={isProcessing}
          className="text-xs"
        >
          Reset all
        </Button>
        {hasResult ? (
          <Button
            size="sm"
            onClick={onReprocess}
            disabled={isProcessing}
            className="flex-1 text-xs gap-1"
          >
            {isProcessing ? "Applying…" : "Apply changes & re-process"}
          </Button>
        ) : (
          <div className="flex-1 flex items-center justify-end">
            <span className="text-[10px] text-muted-foreground">
              Adjustments applied on generate
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
