"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "./language-provider"

// Lista de clientes
const clients = [
  {
    id: 1,
    name: "Looki",
    logo: "https://i.postimg.cc/NjMrVwGM/logo-looki.png",
  },
  {
    id: 2,
    name: "Matilda",
    logo: "https://i.postimg.cc/7YX2mLkd/logo-matilda.png",
  },
  {
    id: 3,
    name: "Plim Plim",
    logo: "https://i.postimg.cc/cHqgrgRg/logo-plimplim.png",
  },
  { id: 4, name: "Estampa", logo: "https://i.postimg.cc/Hn9yGY7J/logo-estampa.png" },
  {
    id: 5,
    name: "Pasión",
    logo: "https://i.postimg.cc/52RFWkjm/logo-pasion-por-la-nautica.png",
  },
  {
    id: 6,
    name: "Ringo",
    logo: "https://i.postimg.cc/wvhtJq2W/logo-ringo-intimates.png",
  },
  { id: 7, name: "Adrián", logo: "https://i.postimg.cc/9Fc9d7vy/logo-fenando-remax.png" },
  { id: 8, name: "Pablo", logo: "https://i.postimg.cc/mr11LNHW/logo-pablito-motos.png" },
  {
    id: 9,
    name: "Sda",
    logo: "https://i.postimg.cc/d3whjbSJ/logo-SDA.png",
  },
  { id: 10, name: "Marine Park", logo: "https://i.postimg.cc/CMGDnN6F/logo-Marine-Park.png" },
  { id: 11, name: "El zurdo", logo: "https://i.postimg.cc/vB9nzLYt/logo-el-zurdo.png" },
  { id: 12, name: "Transporte Escolar N&L", logo: "https://i.postimg.cc/sxrh0Q1d/logo-transporte-escolar.png" },
]

export default function ClientsCarousel() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { t, language } = useLanguage()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(0)
  const [animationPaused, setAnimationPaused] = useState(false)

  // Duplicamos los clientes para crear un carrusel infinito
  const allClients = [...clients, ...clients, ...clients]

  // Función para mover el carrusel continuamente
  useEffect(() => {
    if (!carouselRef.current || animationPaused) return

    let animationId: number
    let lastTimestamp: number

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp
      const elapsed = timestamp - lastTimestamp

      if (elapsed > 30) {
        // Movemos 0.5px cada 30ms para un movimiento suave
        setPosition((prev) => {
          const newPosition = prev - 0.5

          // Si hemos desplazado el ancho de todos los elementos originales, reseteamos
          const itemWidth = 80 // Ancho aproximado de cada elemento con margen
          const resetPoint = -(clients.length * itemWidth)

          if (newPosition <= resetPoint) {
            return 0
          }

          return newPosition
        })
        lastTimestamp = timestamp
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [animationPaused])

  // Pausar la animación al pasar el mouse
  const handleMouseEnter = () => setAnimationPaused(true)
  const handleMouseLeave = () => setAnimationPaused(false)

  return (
    <section className="py-12 bg-[#B8D8D8]/30 dark:bg-[#004E64]/30">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">
            {language === "en" ? "+ 10 entrepreneurs trusted us" : "+ 10 emprendedores confiaron en nosotros"}
          </h2>

          <div
            className="overflow-hidden mx-auto max-w-6xl"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={carouselRef}
              className="flex"
              style={{
                transform: `translateX(${position}px)`,
                width: "max-content",
              }}
            >
              {allClients.map((client, index) => (
                <div key={`${client.id}-${index}`} className="flex-shrink-0 mx-2 md:mx-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-white dark:bg-gray-800 p-1 shadow-md">
                    <Image
                      src={client.logo || "/placeholder.svg"}
                      alt={client.name}
                      width={80}
                      height={80}
                      className="object-contain w-full h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
