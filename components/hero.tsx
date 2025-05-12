"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "./language-provider"

export default function Hero() {
  const { t, language } = useLanguage()

  return (
    <section id="home" className="w-full bg-[#B8D8D8] dark:bg-[#004E64] pt-20">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6 max-w-xl"
          >
            <h1 className="text-sm font-medium text-gray-700 dark:text-gray-200">Clover Digital</h1>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-gray-800 dark:text-white">
              {t("slogan")}
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{t("hero-description")}</p>
            <div className="pt-4">
              <motion.a
                href="#contact-us"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gray-900 hover:bg-black text-white font-medium py-3 px-8 rounded-md transition-colors"
              >
                {t("hero-cta")}
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative w-full h-[400px] md:h-[500px]">
              <Image
                src="https://i.postimg.cc/gJbbmFwv/foto-celular-inicio.png"
                alt="Smartphone con diseño digital"
                width={500}
                height={500}
                className="object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
