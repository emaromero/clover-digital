"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "./language-provider"

export default function FeaturedWork() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { t } = useLanguage()

  return (
    <section className="w-full bg-white dark:bg-[#001219] py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div className="order-2 md:order-1">
            <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
              <Image
                src="https://i.postimg.cc/25mXZ0Sd/Pasión_por_la_Náutica_-_[www.pasionporlanautica.com].png"
                alt="Pasión por la Náutica"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="order-1 md:order-2 max-w-lg">
            <span className="text-[#0A9396] font-medium">Proyecto Destacado</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 text-gray-800 dark:text-white">
              Pasión por la Náutica
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Desarrollamos un sitio web completo para esta empresa dedicada al mundo náutico. El diseño refleja la
              pasión por el mar y los barcos, con una navegación intuitiva y un catálogo de productos fácil de explorar.
              Implementamos funcionalidades de e-commerce y optimizamos la experiencia para dispositivos móviles.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://pasionporlanautica.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gray-900 hover:bg-black text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Ver Sitio
              </a>
              <button className="inline-block border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-6 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                + Detalles
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
