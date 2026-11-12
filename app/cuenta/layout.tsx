
import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portal de Clientes",
  description:
    "Consultá el estado de tus producciones y accedé a tus fotografías, videos y entregas de Clover Digital.",

  alternates: {
    canonical: "/cuenta",
  },

  robots: {
    index: false,
    follow: false,
  },

  openGraph: {
    title: "Portal de Clientes | Clover Digital",
    description:
      "Consultá el estado de tus producciones y accedé a tus fotografías, videos y entregas desde tu espacio personal.",
    url: "/cuenta",
    siteName: "Clover Digital",
    images: [
      {
        url: "/logo-clover.png",
        width: 1080,
        height: 1080,
        alt: "Logo de Clover Digital",
      },
    ],
    type: "website",
    locale: "es_AR",
  },

  twitter: {
    card: "summary",
    title: "Portal de Clientes | Clover Digital",
    description:
      "Consultá tus producciones, fotografías, videos y entregas.",
    images: ["/logo-clover.png"],
  },
}

export default function CuentaLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
