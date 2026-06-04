import * as React from "react"
import { Slider } from "radix-ui"
import { cn } from "@/lib/utils"

function Root({
  className,
  ...props
}: React.ComponentProps<typeof Slider.Root>) {
  return (
    <Slider.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
        <Slider.Range className="absolute h-full bg-primary" />
      </Slider.Track>
      <Slider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50" />
    </Slider.Root>
  )
}

export { Root as Slider }
