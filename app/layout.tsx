import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { APP_VERSION, BUILD_TIME } from "@/lib/version";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  title: {
    default: "SarkariPhoto — Passport & ID Photo Maker for Govt Forms",
    template: "%s — SarkariPhoto",
  },
  description:
    "Upload any photo and get a perfectly cropped, white-background portrait sized for Indian passport, PAN, Aadhaar, UPSC, SSC, visa and government forms. 100% private — runs in your browser.",
  keywords: [
    "passport photo",
    "ID photo",
    "Indian passport photo",
    "sarkari photo",
    "govt form photo",
    "photo resizer",
    "background remover",
    "visa photo",
    "PAN card photo",
    "Aadhaar photo",
    "UPSC photo",
    "photo to KB",
    "online passport photo tool",
    "signature for govt forms",
  ],
  authors: [{ name: "SarkariPhoto" }],
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "SarkariPhoto",
    title: "SarkariPhoto — Passport & ID Photo Maker for Govt Forms",
    description:
      "Drop a photo — we remove the background, crop the head, fit exact pixel size & KB range. Signatures too. ",
    url: baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "SarkariPhoto — Passport & ID Photo Maker for Govt Forms",
    description:
      "Drop a photo — we remove the background, crop the head, fit exact pixel size & KB range. Signatures too. ",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%234F46E5'/%3E%3Ccircle cx='16' cy='14' r='5' fill='none' stroke='white' stroke-width='2.5'/%3E%3Crect x='7' y='7' width='18' height='18' rx='3' fill='none' stroke='white' stroke-width='2.5'/%3E%3Cpath d='M11 24c1-3 3-5 5-5s4 2 5 5' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E",
    apple: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'%3E%3Crect width='180' height='180' rx='36' fill='%234F46E5'/%3E%3Ccircle cx='90' cy='78' r='28' fill='none' stroke='white' stroke-width='10'/%3E%3Crect x='40' y='38' width='100' height='100' rx='16' fill='none' stroke='white' stroke-width='10'/%3E%3Cpath d='M64 134c8-18 18-28 26-28s18 10 26 28' fill='none' stroke='white' stroke-width='10'/%3E%3C/svg%3E",
  },
  manifest: "/manifest.json",
  other: {
    "app-version": APP_VERSION,
    "build-time": BUILD_TIME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", jetbrainsMono.variable)}
    >
      <head>
        <meta httpEquiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta name="app-version" content={APP_VERSION} />
        <meta name="theme-color" content="#ffffff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "SarkariPhoto",
              url: baseUrl,
              description:
                "Upload any photo and get a perfectly cropped, white-background portrait sized for Indian passport, PAN, UPSC, visa and government forms. Also supports signature cropping for govt forms.",
              applicationCategory: "Multimedia",
              operatingSystem: "Any",
              browserRequirements: "Requires JavaScript",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
