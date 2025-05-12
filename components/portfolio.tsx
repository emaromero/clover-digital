"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "./language-provider"

// Interfaces para los proyectos
interface WebProject {
  id: number;
  title: string;
  category: string;
  url: string;
  image: string;
}

interface DesignProject {
  id: number;
  title: string;
  description: string;
  image: string;
}

// Web projects data
const webProjects: WebProject[] = [
  {
    id: 1,
    title: "Pasión por la Náutica",
    category: "React JS",
    url: "https://pasionporlanautica.com",
    image: "https://i.postimg.cc/25mXZ0Sd/Pasión_por_la_Náutica_-_[www.pasionporlanautica.com].png",
  },
  {
    id: 2,
    title: "Plim Plim",
    category: "Tienda Nube",
    url: "https://plimplimpanalerayartdebeb.mitiendanube.com",
    image:
      "https://i.postimg.cc/bJV648HL/Tienda_Online_de_Plim_Plim_Pañalera_y_Art.de_bebé_-_[plimplimpanalerayartdebeb.mitiendanube.com].png",
  },
  {
    id: 3,
    title: "Looki Bar",
    category: "React JS",
    url: "https://lookibar.vercel.app",
    image:
      "https://i.postimg.cc/G3SN5PXr/Looki_Bar_-Menú_Digital-Bar_y_Restaurante_en_Pilar-_[lookibar.vercel.app].png",
  },
  {
    id: 4,
    title: "Matilda Calzados",
    category: "Tienda Nube",
    url: "https://matildacalzados.mitiendanube.com",
    image: "https://i.postimg.cc/BQrzqSWV/Matilda_Calzados_-_[matildacalzados.mitiendanube.com].png",
  },
  {
    id: 5,
    title: "Estampa",
    category: "Tienda Nube",
    url: "https://estampa15.mitiendanube.com",
    image: "https://i.postimg.cc/J4DgVyFX/Estampa_-_[estampa15.mitiendanube.com].png",
  },
  {
    id: 6,
    title: "Ringo Intimates",
    category: "Tienda Nube",
    url: "https://ringointimates2.mitiendanube.com",
    image: "https://i.postimg.cc/fLR2HkXJ/Ringo_Intimates_-_[ringointimates2.mitiendanube.com].png",
  },
  {
    id: 7,
    title: "SDA",
    category: "HTML/CSS/JS",
    url: "https://www.sda-sa.com.ar",
    image: "https://i.postimg.cc/pdZcYKmw/SERVICIOS_DE_AIRE_ACONDICIONADO_S.A.-[www.sda-sa.com.ar].png",
  },
  {
    id: 8,
    title: "Marine Park",
    category: "HTML/CSS/JS",
    url: "https://www.mpark.com.ar",
    image: "https://i.postimg.cc/QdcyC2hx/MARINE_PARK_-_[www.mpark.com.ar].png",
  },
]

// Graphic design projects data
const designProjects: DesignProject[] = [
  {
    id: 1,
    title: "@remax.teamfernando",
    description: "Fotografía Inmobiliaria",
    image: "https://i.postimg.cc/Njq7CN7F/13-1.png",
  },
  {
    id: 2,
    title: "@pabloromeromotos",
    description: "Branding",
    image: "https://i.postimg.cc/bYZ0bPkp/branding.png",
  },
  {
    id: 3,
    title: "15 años Valentina",
    description: "QR para Eventos",
    image: "https://i.postimg.cc/mgy7RgfN/qr-15-a-os.png",
  },
  {
    id: 4,
    title: "@pabloromeromotos",
    description: "Merch",
    image: "https://i.postimg.cc/gc1VH7HR/merch.png",
  },
  {
    id: 5,
    title: "@guarderia_marinepark",
    description: "Papelería de marca",
    image: "https://i.postimg.cc/hjfm98Jp/TARJETERIA-QR.png",
  },
  {
    id: 6,
    title: "@ringo.lenceria",
    description: "Papelería de marca",
    image: "https://i.postimg.cc/SN8WTGgP/LOYALTY-CARDS.png",
  },
  {
    id: 7,
    title: "@remax.teamfernando",
    description: "Gestión de RRSS y creación de contenido",
    image: "https://i.postimg.cc/65Gf0sZF/merch.png",
  },
  {
    id: 8,
    title: "@florremax",
    description: "Fotografía y material gráfico para RRSS",
    image: "https://i.postimg.cc/pVSBzVmD/PLACA-INMOBILIARIA.png",
  },
]

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState<"web" | "design">("web");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const { t, language } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="portfolio" className="py-16 md:py-24 bg-[#B8D8D8]/30 dark:bg-[#004E64]/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-800 dark:text-white">
            {language === "en" ? "Portfolio" : "Portfolio"}
          </h2>

          <div className="inline-flex rounded-md shadow-sm mt-8">
            <button
              onClick={() => setActiveTab("web")}
              className={`px-6 py-3 text-sm font-medium rounded-l-lg ${
                activeTab === "web"
                  ? "bg-gray-900 text-white"
                  : "bg-white dark:bg-[#001219] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {language === "en" ? "Websites" : "Sitios Web"}
            </button>
            <button
              onClick={() => setActiveTab("design")}
              className={`px-6 py-3 text-sm font-medium rounded-r-lg ${
                activeTab === "design"
                  ? "bg-gray-900 text-white"
                  : "bg-white dark:bg-[#001219] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {language === "en" ? "RRSS & Graphic Design" : "RRSS & Diseño gráfico"}
            </button>
          </div>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${activeTab === "web" ? "3" : "4"} gap-8`}
        >
          {activeTab === "web"
            ? webProjects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="relative h-64 overflow-hidden">
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        width={500}
                        height={500}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                    </a>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <h3 className="text-base font-medium text-gray-800 dark:text-white">{project.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{project.category}</p>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0A9396] hover:text-[#005F73] text-sm mt-2 inline-block"
                    >
                      {language === "en" ? "Visit website" : "Visitar sitio"}
                    </a>
                  </div>
                </motion.div>
              ))
            : designProjects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      width={500}
                      height={500}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 rounded-t-2xl"
                    />
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">{project.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{project.description}</p>
                  </div>
                </motion.div>
              ))}
        </motion.div>
      </div>
    </section>
  );
}