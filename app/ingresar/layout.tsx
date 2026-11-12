
import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ingresá a Clover Digital",
  description:
    "Accedé a tu cuenta y consultá tus producciones, fotografías, videos y entregas desde un solo lugar.",

  alternates: {
    canonical: "/ingresar",
  },

  robots: {
    index: false,
    follow: false,
  },

  openGraph: {
    title: "Ingresá a Clover Digital",
    description:
      "Accedé a tu cuenta y consultá tus producciones, fotografías, videos y entregas desde un solo lugar.",
    url: "/ingresar",
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
    title: "Ingresá a Clover Digital",
    description:
      "Accedé a tu cuenta y consultá tus producciones, fotografías, videos y entregas desde un solo lugar.",
    images: ["/logo-clover.png"],
  },
}

export default function IngresarLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
