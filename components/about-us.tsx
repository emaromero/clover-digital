"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "./language-provider"

export default function AboutUs() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { t, language } = useLanguage()

  return (
    <section id="about" className="py-16 md:py-24 bg-[#B8D8D8]/30 dark:bg-[#004E64]/30">
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
                src="https://i.postimg.cc/NFTcmsBD/segunda-foto-inicio-conocenos.png"
                alt="Diseño de sitio web"
                width={400}
                height={400}
                className="object-contain"
              />
            </div>
          </div>

          <div className="order-1 md:order-2 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 text-gray-800 dark:text-white">
              {t("about-title")}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{t("about-p1")}</p>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{t("about-p2")}</p>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{t("about-p3")}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
