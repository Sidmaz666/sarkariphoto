"use client"

import { Button } from "@/components/ui/button"
import { ArrowClockwise, ArrowCounterClockwise, Check } from "@phosphor-icons/react"

interface EditToolbarProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onCancel: () => void
  onSave: () => void
  saveLabel?: string
  className?: string
}

export function EditToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onCancel,
  onSave,
  saveLabel = "Save",
  className,
}: EditToolbarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <ArrowCounterClockwise className="h-3.5 w-3.5" />
          Undo
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <ArrowClockwise className="h-3.5 w-3.5" />
          Redo
        </Button>
      </div>
      <div className="flex-1 min-w-[8px]" />
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="button" size="sm" onClick={onSave}>
        <Check className="h-3.5 w-3.5" weight="bold" />
        {saveLabel}
      </Button>
    </div>
  )
}
