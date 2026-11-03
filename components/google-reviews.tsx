"use client"

import { useLanguage } from "./language-provider"

const REVIEW_URL = "https://g.page/r/Cf6WHSOEt25gEBM/review"

export default function GoogleReviews() {
  const { language } = useLanguage()

  const copy =
    language === "es"
      ? {
          eyebrow: "Reseñas de Google",
          title: "La experiencia de nuestros clientes",
          description:
            "Cada producción se trabaja con atención al detalle, comunicación clara y una entrega pensada para que la propiedad se vea profesional desde el primer impacto.",
          basedOn: "Basado en 10 reseñas",
          button: "Dejar una reseña",
        }
      : {
          eyebrow: "Google Reviews",
          title: "What our clients say",
          description:
            "Every production is handled with attention to detail, clear communication and a delivery designed to make each property look professional from the very first impression.",
          basedOn: "Based on 10 reviews",
          button: "Leave a review",
        }

  return (
    <section
      id="reviews"
      className="py-20 md:py-28 bg-gray-50 dark:bg-[#001219]"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#06222c] p-8 md:p-12 shadow-sm">
          <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0e5c6e] dark:text-[#5fb8cc] mb-4">
                {copy.eyebrow}
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {copy.title}
              </h2>

              <p className="text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                {copy.description}
              </p>
            </div>

            <div className="md:text-right">
              <div className="inline-flex flex-col items-start md:items-end">
                <div className="text-5xl font-bold text-gray-900 dark:text-white leading-none">
                  5,0
                </div>

                <div
                  className="text-2xl tracking-wide mt-2"
                  aria-label="5 de 5 estrellas"
                >
                  ★★★★★
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {copy.basedOn}
                </p>

                <a
                  href={REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#0e5c6e] hover:bg-[#001219] dark:hover:bg-white dark:hover:text-[#001219] text-white font-semibold px-6 py-3 transition-colors"
                >
                  {copy.button}
                  <span className="ml-2" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}