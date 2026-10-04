"use client"

import Image from "next/image"
import { useLanguage } from "./language-provider"

// Logos cuadrados y ya centrados (public/clientes). Para sumar un cliente: agregá el archivo y una línea acá.
const clientes = [
  { name: "RE/MAX", logo: "/clientes/remax.png" },
  { name: "Century 21", logo: "/clientes/century21.png" },
  { name: "Keller Williams", logo: "/clientes/keller-williams.png" },
  { name: "Coldwell Banker", logo: "/clientes/coldwell-banker.png" },
  { name: "Romero Bienes Raíces", logo: "/clientes/romero.png" },
]

export default function Clientes() {
  const { t } = useLanguage()

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-[#001219]">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-xl md:text-2xl font-bold mb-8 text-gray-800 dark:text-white">{t("clients-title")}</h2>
        <ul className="flex flex-wrap justify-center gap-4 md:gap-8">
          {clientes.map((c) => (
            <li key={c.name} className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border border-gray-200 dark:border-white/15 shadow-sm">
              <Image src={c.logo} alt={c.name} fill sizes="144px" className="object-cover" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
