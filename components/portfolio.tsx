"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "./language-provider"

// Portadas de proyectos del Behance de Clover Digital (behance.net/cloverdigital1).
// Para mejor calidad, descargá las fotos originales a /public/portfolio y reemplazá estas URLs.
const proyectos = [
  { title: "Alley Recoleta", id: "255438219", slug: "Alley-Recoleta-Juan-M", img: "adf407255438219.Y3JvcCwyNTU2LDIwMDAsMjIxLDA.jpg" },
  { title: "Av. Independencia", id: "255061503", slug: "Av-Independencia-Ana-B-x-Coldwell-Banker", img: "34107d255061503.Y3JvcCwyNTU2LDIwMDAsMjIxLDA.jpg" },
  { title: "Av. Maipú", id: "255060785", slug: "Av-Maipu-Blanca", img: "e6a327255060785.Y3JvcCwyNTU2LDIwMDAsMjIxLDA.jpg" },
  { title: "Av. Directorio", id: "255060407", slug: "Av-Directorio-Fernando", img: "03195d255060407.Y3JvcCwxMzYyLDEwNjYsMTE4LDA.jpg" },
  { title: "Bazurco", id: "255060191", slug: "Bazurco-Juan-Manuel", img: "96b1c8255060191.Y3JvcCwyNTU2LDIwMDAsMjIxLDA.jpg" },
  { title: "Libertador", id: "250841899", slug: "Libertador-Juan-M", img: "6e35e1250841899.Y3JvcCwyNTU2LDIwMDAsMjIxLDA.jpg" },
  { title: "La Taruca", id: "250620537", slug: "La-Taruca-Mariela", img: "1d94cc250620537.Y3JvcCwxMzA5LDEwMjQsMTEzLDA.png" },
  { title: "Vicente López", id: "250567901", slug: "Vicente-Lopez-Valeria", img: "0639ec250567901.Y3JvcCwyNTU2LDIwMDAsMjIxLDA.jpg" },
]

export default function Portfolio() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const { t } = useLanguage()

  return (
    <section id="portfolio" className="py-16 md:py-24 bg-[#B8D8D8]/30 dark:bg-[#004E64]/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">
          {t("portfolio-title")}
        </h2>
        <motion.ul
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto"
        >
          {proyectos.map((p) => (
            <li key={p.id}>
              <a
                href={`https://www.behance.net/gallery/${p.id}/${p.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-[4/3] overflow-hidden rounded-lg"
              >
                <Image
                  src={`https://mir-s3-cdn-cf.behance.net/projects/404/${p.img}`}
                  alt={`Proyecto ${p.title}`}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#001219]/90 to-transparent px-3 pb-2 pt-8 text-sm font-medium text-white">
                  {p.title}
                </span>
              </a>
            </li>
          ))}
        </motion.ul>
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <a
            href="https://www.behance.net/cloverdigital1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#0e5c6e] hover:bg-[#001219] text-white font-medium py-3 px-8 rounded-md transition-colors"
          >
            {t("portfolio-behance")}
          </a>
          <a
            href="https://www.instagram.com/cloverdigital.arg/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-[#0e5c6e] text-[#0e5c6e] dark:text-white dark:border-white hover:bg-[#0e5c6e] hover:text-white font-medium py-3 px-8 rounded-md transition-colors"
          >
            {t("portfolio-more")}
          </a>
        </div>
      </div>
    </section>
  )
}
