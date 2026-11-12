
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Registrate en Clover Digital",

  description:
    "Creá tu cuenta para acceder a tus producciones, fotos, videos y entregas desde un solo lugar.",

  alternates: {
    canonical: "/registro",
  },

  robots: {
    index: false,
    follow: false,
  },

  openGraph: {
    title: "Registrate en Clover Digital",

    description:
      "Creá tu cuenta para acceder a tus producciones, fotos, videos y entregas desde un solo lugar.",

    url: "/registro",

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
    title: "Registrate en Clover Digital",

    description:
      "Creá tu cuenta para acceder a tus producciones, fotos, videos y entregas desde un solo lugar.",

    images: ["/logo-clover.png"],
  },
}

export default function RegistroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
