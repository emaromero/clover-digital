
import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Clover Academy",
  description:
    "Formate en fotografía inmobiliaria con Clover Academy. Accedé a tus cursos, clases y contenidos de formación.",

  alternates: {
    canonical: "/academy",
  },

  robots: {
    index: false,
    follow: false,
  },

  openGraph: {
    title: "Clover Academy | Formación inmobiliaria",
    description:
      "Aprendé fotografía inmobiliaria y mejorá la presentación de propiedades con los cursos de Clover Academy.",
    url: "/academy",
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
    title: "Clover Academy | Formación inmobiliaria",
    description:
      "Cursos y formación en fotografía inmobiliaria.",
    images: ["/logo-clover.png"],
  },
}

export default function AcademyLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
