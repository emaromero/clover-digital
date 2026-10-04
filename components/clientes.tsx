"use client"

import Image from "next/image"
import { useLanguage } from "./language-provider"

// Cada logo va en un recuadro del mismo color de fondo que su imagen, así se ve parejo en modo claro y oscuro.
const clientes = [
  { name: "RE/MAX", logo: "/clientes/remax.png", bg: "#ffffff" },
  { name: "Century 21", logo: "/clientes/century21.png", bg: "#ffffff" },
  { name: "Keller Williams", logo: "/clientes/keller-williams.png", bg: "#b20202" },
  { name: "Romero Bienes Raíces", logo: "/clientes/romero.png", bg: "#1c1c1c" },
]

export default function Clientes() {
  const { t } = useLanguage()

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-[#001219]">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-xl md:text-2xl font-bold mb-8 text-gray-800 dark:text-white">{t("clients-title")}</h2>
        <ul className="flex flex-wrap justify-center gap-4 md:gap-6">
          {clientes.map((c) => (
            <li
              key={c.name}
              style={{ backgroundColor: c.bg }}
              className="relative w-36 h-24 md:w-52 md:h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10"
            >
              <Image src={c.logo} alt={c.name} fill sizes="208px" className="object-contain p-2" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
