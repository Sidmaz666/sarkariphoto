"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Spinner, X, Image, MagicWand, Layout, FileArrowDown, Brain } from "@phosphor-icons/react"

export type PipelineStepData = {
  id: string
  label: string
  status: "pending" | "running" | "done" | "error"
}

const stepMeta: Record<string, { icon: React.ElementType; color: string }> = {
  "load": { icon: Image, color: "text-blue-500" },
  "bg-removal": { icon: MagicWand, color: "text-purple-500" },
  "detect": { icon: Brain, color: "text-amber-500" },
  "compose": { icon: Layout, color: "text-emerald-500" },
  "size": { icon: FileArrowDown, color: "text-rose-500" },
  "done": { icon: Check, color: "text-emerald-500" },
}

interface PipelineProgressProps {
  steps: PipelineStepData[]
  currentMessage?: string
  className?: string
}

export function PipelineProgress({ steps, currentMessage, className }: PipelineProgressProps) {
  const isComplete = steps.every((s) => s.status === "done")

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-5 w-5 items-center justify-center">
          {isComplete ? (
            <Check className="h-4 w-4 text-emerald-500" weight="bold" />
          ) : (
            <Spinner className="h-4 w-4 text-primary animate-spin" />
          )}
        </div>
        <h3 className="text-sm font-semibold">
          {isComplete ? "Processing complete" : "Processing your photo…"}
        </h3>
      </div>

      <div className="space-y-1">
        {steps.map((step, i) => {
          const meta = stepMeta[step.id] || { icon: Check, color: "text-muted-foreground" }
          const Icon = meta.icon
          const isActive = step.status === "running"
          const isPast = step.status === "done" || step.status === "error"

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors text-xs",
                isActive && "bg-muted",
                isPast && "opacity-80",
              )}
            >
              {/* Step number / status */}
              <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                {step.status === "done" ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" weight="bold" />
                  </div>
                ) : step.status === "error" ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                    <X className="h-3 w-3 text-red-600 dark:text-red-400" weight="bold" />
                  </div>
                ) : step.status === "running" ? (
                  <Spinner className="h-3.5 w-3.5 text-primary animate-spin" />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    <span className="text-[10px] font-medium text-muted-foreground">{i + 1}</span>
                  </div>
                )}
              </div>

              {/* Icon */}
              <Icon className={cn("h-3.5 w-3.5 shrink-0", meta.color, isActive && "animate-pulse")} weight="bold" />

              {/* Label */}
              <span
                className={cn(
                  "flex-1",
                  isActive && "font-medium text-foreground",
                  !isActive && !isPast && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>

              {/* Status indicator */}
              {step.status === "running" && (
                <span className="text-[10px] text-primary">Processing…</span>
              )}
              {step.status === "done" && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Done</span>
              )}
              {step.status === "error" && (
                <span className="text-[10px] text-red-600 dark:text-red-400">Failed</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress dots animation */}
      {!isComplete && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          {currentMessage && (
            <span className="text-[10px] text-muted-foreground animate-pulse">{currentMessage}</span>
          )}
        </div>
      )}
    </div>
  )
}
