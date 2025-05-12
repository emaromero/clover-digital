"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Globe, FileImage, Instagram, Camera, BarChart, Palette, QrCode, Home, Wallpaper} from "lucide-react"
import { useLanguage } from "./language-provider"

const services = [
  {
    id: 1,
    icon: <Globe className="h-8 w-8" />,
    titleKey: "service-1-title",
    descKey: "service-1-desc",
  },
  {
    id: 2,
    icon: <Wallpaper className="h-8 w-8" />,
    titleKey: "service-2-title",
    descKey: "service-2-desc",
  },
  {
    id: 3,
    icon: <Instagram className="h-8 w-8" />,
    titleKey: "service-3-title",
    descKey: "service-3-desc",
  },
  {
    id: 4,
    icon: <Camera className="h-8 w-8" />,
    titleKey: "service-4-title",
    descKey: "service-4-desc",
  },
  {
    id: 5,
    icon: <BarChart className="h-8 w-8" />,
    titleKey: "service-5-title",
    descKey: "service-5-desc",
  },
  {
    id: 6,
    icon: <FileImage className="h-8 w-8" />,
    titleKey: "service-6-title",
    descKey: "service-6-desc",
  },
  {
    id: 7,
    icon: <Palette className="h-8 w-8" />,
    titleKey: "service-7-title",
    descKey: "service-7-desc",
  },
  {
    id: 8,
    icon: <QrCode className="h-8 w-8" />,
    titleKey: "service-8-title",
    descKey: "service-8-desc",
  },
]

export default function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const { t, language } = useLanguage()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="services" className="py-16 md:py-24 bg-white dark:bg-[#001219]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-800 dark:text-white">{t("services-title")}</h2>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="bg-white dark:bg-[#001219] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col border border-gray-100 dark:border-gray-800"
            >
              <div className="text-[#0A9396] mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{t(service.titleKey)}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t(service.descKey)}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}