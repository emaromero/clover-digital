import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Registrate en Clover Digital",

  description:
    "Creá tu cuenta para acceder a tus producciones, fotos, videos y entregas desde un solo lugar.",

  openGraph: {
    title: "Registrate en Clover Digital",
    description:
      "Creá tu cuenta para acceder a tus producciones, fotos, videos y entregas desde un solo lugar.",
    url: "/registro",
    siteName: "Clover Digital",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Clover Digital",
      },
    ],
    type: "website",
    locale: "es_AR",
  },

  twitter: {
    card: "summary_large_image",
    title: "Registrate en Clover Digital",
    description:
      "Creá tu cuenta para acceder a tus producciones, fotos, videos y entregas desde un solo lugar.",
    images: ["/og-image.jpg"],
  },
}

export default function RegistroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}