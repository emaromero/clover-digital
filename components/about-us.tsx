"use client"

import { useRef } from "react"
import {
  motion,
  useInView,
} from "framer-motion"
import Image from "next/image"

import { useLanguage } from "./language-provider"

export default function AboutUs() {
  const ref =
    useRef(null)

  const isInView =
    useInView(
      ref,
      {
        once: true,
        amount: 0.3,
      }
    )

  const { t } =
    useLanguage()

  return (
    <section
      id="about"
      className="bg-[#B8D8D8]/30 py-16 dark:bg-[#004E64]/30 md:py-24"
    >

      <div className="container mx-auto px-4">

        <motion.div
          ref={ref}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {
                  opacity: 0,
                  y: 20,
                }
          }
          transition={{
            duration: 0.6,
          }}
          className="grid items-center gap-12 md:grid-cols-2"
        >

          <div className="order-2 md:order-1">

            <div className="relative h-[400px] w-full overflow-hidden rounded-lg">

              <Image
                src="https://i.postimg.cc/KGVDj860/44e82f250037593-6a158c108f7cb.jpg"
                alt="Fotografía inmobiliaria realizada por Clover Digital"
                fill
                quality={80}
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-contain"
              />

            </div>

          </div>

          <div className="order-1 max-w-lg md:order-2">

            <h2 className="mb-6 mt-2 text-3xl font-bold text-gray-800 dark:text-white md:text-4xl">
              {t(
                "about-title"
              )}
            </h2>

            <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
              {t(
                "about-p1"
              )}
            </p>

            <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
              {t(
                "about-p2"
              )}
            </p>

            <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
              {t(
                "about-p3"
              )}
            </p>

          </div>

        </motion.div>

      </div>

    </section>
  )
}