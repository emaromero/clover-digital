"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "./language-provider"

export default function Hero() {
  const { t } =
    useLanguage()

  return (
    <section
      id="home"
      className="w-full bg-[#B8D8D8] pt-20 dark:bg-[#004E64]"
    >
      <div className="container mx-auto px-4 py-16 md:py-24">

        <div className="grid items-center gap-8 md:grid-cols-2">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="flex max-w-xl flex-col space-y-6"
          >

            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Clover Digital
            </p>

            <h1 className="text-4xl font-bold leading-tight text-gray-800 dark:text-white md:text-5xl">
              {t("slogan")}
            </h1>

            <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
              {t(
                "hero-description"
              )}
            </p>

            <div className="pt-4">

              <motion.a
                href="#cotizador"
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className="inline-block rounded-md bg-gray-900 px-8 py-3 font-medium text-white transition-colors hover:bg-black"
              >
                {t(
                  "hero-cta"
                )}
              </motion.a>

            </div>

          </motion.div>

          <div className="flex justify-center">

            <div className="relative h-[400px] w-full md:h-[500px]">

              <Image
                src="https://i.postimg.cc/T1ztnRNc/Default.jpg"
                alt="Fotografía y video para vender propiedades - Clover Digital"
                fill
                priority
                fetchPriority="high"
                quality={82}
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-contain"
              />

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}