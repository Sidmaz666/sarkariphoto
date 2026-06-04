"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WarningCircle, ArrowCounterClockwise } from "@phosphor-icons/react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-md p-8 text-center">
        <WarningCircle className="mx-auto h-12 w-12 text-destructive mb-4" weight="fill" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {error.message || "An unexpected error occurred. Try refreshing the page."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} size="lg">
            <ArrowCounterClockwise className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
          >
            Refresh page
          </Button>
        </div>
      </Card>
    </div>
  )
}
