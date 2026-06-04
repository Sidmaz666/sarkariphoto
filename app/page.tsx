"use client"


import PhotoStudio from "@/components/PhotoStudio"
import { Toaster } from "@/components/ui/sonner"

import { ShieldCheck, Lightning } from "@phosphor-icons/react"

import { Pacifico } from "next/font/google"

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
})

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-center" richColors />

      {/* Hero top */}
      <section className="relative overflow-hidden py-12 pb-0">
        <div className="absolute inset-0" />
        <div className="absolute inset-0" />
        <div className="mx-auto max-w-4xl px-6 text-center py-8">
          <h1 className={`text-5xl font-bold tracking-tight sm:text-6xl bg-primary text-transparent bg-clip-text ${pacifico.className}`}>SarkariPhoto</h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Drop a photo — we remove the background, crop the head, fit your exact pixel size, and squeeze it into the KB range your form demands.
          </p>
        </div>
      </section>
      {/* Main content — upload area + settings */}
      <main className="mx-auto w-full max-w-4xl px-6 py-6">
        <PhotoStudio />
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl bg-primary text-transparent bg-clip-text ${pacifico.className}`}>SarkariPhoto</h1>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Browser-based tool for passport photos, ID photos, and signatures used in Indian
                government forms. Your photo never leaves your device — everything runs locally.
              </p>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-foreground mb-2 uppercase tracking-wider">Photos</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Indian Passport / Visa</li>
                <li>PAN Card / Aadhaar</li>
                <li>UPSC / SSC / Banking</li>
                <li>US / UK / Schengen Visa</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-foreground mb-2 uppercase tracking-wider">Signatures</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Form signature cropping</li>
                <li>White background cleanup</li>
                <li>Exact size &amp; KB output</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-muted-foreground/60">
            <span>&copy; {new Date().getFullYear()} SarkariPhoto</span>
            <span>
              Built by{" "}
              <a
                href="https://github.com/simaz666"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground/80 transition-colors"
              >
                simaz666
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
