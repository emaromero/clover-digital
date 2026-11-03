"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useLanguage } from "./language-provider"

const REVIEW_URL =
  "https://g.page/r/Cf6WHSOEt25gEBM/review"

export default function GoogleReviews() {
  const { language } = useLanguage()
  const reduceMotion = useReducedMotion()

  const copy =
    language === "es"
      ? {
          eyebrow: "Reseñas de Google",
          title: "La experiencia de nuestros clientes",
          description:
            "Cada producción se trabaja con atención al detalle, comunicación clara y una entrega pensada para que la propiedad se vea profesional desde el primer impacto.",
          basedOn: "Basado en 10 reseñas",
          button: "Dejar una reseña",
          rating: "5 de 5 estrellas",
        }
      : {
          eyebrow: "Google Reviews",
          title: "What our clients say",
          description:
            "Every production is handled with attention to detail, clear communication and a delivery designed to make each property look professional from the very first impression.",
          basedOn: "Based on 10 reviews",
          button: "Leave a review",
          rating: "5 out of 5 stars",
        }

  return (
    <section
      id="reviews"
      className="py-20 md:py-28 bg-gray-50 dark:bg-[#001219]"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 30,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.15,
          }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#06222c] p-8 md:p-12 shadow-sm"
        >
          <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr] md:items-center">
            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: -20,
                    }
              }
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.08,
              }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0e5c6e] dark:text-[#5fb8cc] mb-4">
                {copy.eyebrow}
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {copy.title}
              </h2>

              <p className="text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                {copy.description}
              </p>
            </motion.div>

            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.94,
                      y: 12,
                    }
              }
              whileInView={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.18,
              }}
              className="md:text-right"
            >
              <div className="inline-flex flex-col items-start md:items-end">
                <motion.div
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          scale: 0.8,
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: 0.28,
                  }}
                  className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-none"
                >
                  5,0
                </motion.div>

                <motion.div
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 8,
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: 0.37,
                  }}
                  className="text-2xl md:text-3xl tracking-wide mt-3 text-[#fbbc04]"
                  aria-label={copy.rating}
                >
                  ★★★★★
                </motion.div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {copy.basedOn}
                </p>

                <motion.a
                  href={REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -2,
                          scale: 1.02,
                        }
                  }
                  whileTap={
                    reduceMotion
                      ? undefined
                      : {
                          scale: 0.98,
                        }
                  }
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#0e5c6e] hover:bg-[#001219] dark:hover:bg-white dark:hover:text-[#001219] text-white font-semibold px-6 py-3 transition-colors shadow-sm hover:shadow-md"
                >
                  {copy.button}

                  <span className="ml-2" aria-hidden="true">
                    →
                  </span>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}