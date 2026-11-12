"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"

type Language =
  | "es"
  | "en"

interface LanguageContextType {
  language: Language

  setLanguage:
    (
      lang: Language
    ) => void

  t:
    (
      key: string
    ) => string
}

const translations = {
  es: {
    home:
      "Inicio",

    services:
      "Servicios",

    portfolio:
      "Portfolio",

    contactUs:
      "Cotizar",

    location:
      "Buenos Aires, Argentina",

    slogan:
      "Fotografía inmobiliaria y video para propiedades en Buenos Aires",

    "hero-description":
      "Producción visual profesional para inmobiliarias, agentes y desarrolladores: fotografía HDR, video recorrido, reels y drone en CABA y Zona Norte.",

    "hero-image-alt":
      "Fotografía inmobiliaria profesional de una propiedad en Buenos Aires realizada por Clover Digital",

    "hero-cta":
      "Cotizá tu producción",

    "about-title":
      "Fotografía inmobiliaria pensada para cada propiedad",

    "about-p1":
      "Somos Clover Digital, un equipo de producción audiovisual especializado en propiedades, arquitectura y desarrollos inmobiliarios.",

    "about-p2":
      "Trabajamos con inmobiliarias, agentes y desarrolladores para presentar cada propiedad de forma profesional, atractiva y fiel al espacio real.",

    "about-p3":
      "Cada producción se piensa según el tipo de propiedad y el canal donde se va a publicar: portales inmobiliarios, redes sociales o ambos.",

    "services-title":
      "Servicios de fotografía y video inmobiliario",

    "service-1-title":
      "Fotografía HDR",

    "service-1-desc":
      "Fotografía inmobiliaria profesional de interiores, exteriores y amenities con luz, color y perspectiva cuidados.",

    "service-2-title":
      "Video recorrido",

    "service-2-desc":
      "Video horizontal para presentar propiedades en portales inmobiliarios y otros canales digitales.",

    "service-3-title":
      "Video vertical para redes",

    "service-3-desc":
      "Contenido vertical de hasta 60 segundos listo para Instagram, TikTok y redes sociales.",

    "service-4-title":
      "Reel hablado",

    "service-4-desc":
      "Grabación con micrófono, edición y subtítulos para que agentes inmobiliarios presenten propiedades a cámara.",

    "service-5-title":
      "Drone",

    "service-5-desc":
      "Fotografía y video aéreo para mostrar propiedades, terrenos, amenities, accesos y entorno.",

    "service-6-title":
      "Desarrollos inmobiliarios",

    "service-6-desc":
      "Fotografía, video y drone para desarrollos, proyectos en pozo, arquitectura y producciones de mayor escala.",

    "portfolio-title":
      "Producciones inmobiliarias en CABA y Zona Norte",

    "portfolio-more":
      "Ver más en Instagram",

    "portfolio-behance":
      "Ver todo en Behance",

    "clients-title":
      "Confían en nuestro equipo",

    "footer-about":
      "Fotografía inmobiliaria, video, reels y drone para propiedades, arquitectura y desarrollos en Buenos Aires.",

    "footer-links":
      "Enlaces Rápidos",

    "footer-contact":
      "Información de Contacto",

    "footer-follow":
      "Síguenos",

    "footer-subscribe":
      "Suscríbete",

    "footer-subscribe-text":
      "Mantente actualizado con nuestras últimas noticias y ofertas.",

    "footer-subscribe-button":
      "Suscribirse",

    "footer-subscribe-placeholder":
      "Tu email",

    "footer-subscribe-thanks":
      "¡Gracias por suscribirte!",

    "whatsapp-title":
      "Clover Digital",

    "whatsapp-message":
      "¡Hola! ¿Cómo podemos ayudarte hoy?",

    "whatsapp-button":
      "Iniciar Chat",

    "whatsapp-float":
      "Chatea con nosotros",

    copyright:
      "© 2026 Clover Digital, Buenos Aires, Argentina. Todos los derechos reservados.",
  },

  en: {
    home:
      "Home",

    services:
      "Services",

    portfolio:
      "Portfolio",

    contactUs:
      "Get a quote",

    location:
      "Buenos Aires, Argentina",

    slogan:
      "Real estate photography and video in Buenos Aires",

    "hero-description":
      "Professional visual production for real estate agencies, agents and developers: HDR photography, walkthrough video, reels and drone in Buenos Aires.",

    "hero-image-alt":
      "Professional real estate photography in Buenos Aires by Clover Digital",

    "hero-cta":
      "Get your quote",

    "about-title":
      "Real estate photography designed for every property",

    "about-p1":
      "We are Clover Digital, an audiovisual production team specialized in properties, architecture and real estate developments.",

    "about-p2":
      "We work with real estate agencies, agents and developers to present every property professionally while remaining faithful to the real space.",

    "about-p3":
      "Each production is planned around the property and where it will be published: real estate portals, social media or both.",

    "services-title":
      "Real estate photography and video services",

    "service-1-title":
      "HDR photography",

    "service-1-desc":
      "Professional interior, exterior and amenity photography with carefully balanced light, color and perspective.",

    "service-2-title":
      "Walkthrough video",

    "service-2-desc":
      "Horizontal walkthrough videos for real estate portals and other digital channels.",

    "service-3-title":
      "Vertical video for social media",

    "service-3-desc":
      "Vertical content up to 60 seconds, ready for Instagram, TikTok and social media.",

    "service-4-title":
      "Talking reel",

    "service-4-desc":
      "Microphone recording, editing and subtitles for real estate agents presenting properties on camera.",

    "service-5-title":
      "Drone",

    "service-5-desc":
      "Aerial photography and video for properties, lots, amenities, access points and surroundings.",

    "service-6-title":
      "Real estate developments",

    "service-6-desc":
      "Photography, video and drone for developments, off-plan projects, architecture and large-scale productions.",

    "portfolio-title":
      "Real estate productions in Buenos Aires",

    "portfolio-more":
      "See more on Instagram",

    "portfolio-behance":
      "See everything on Behance",

    "clients-title":
      "Trusted by",

    "footer-about":
      "Real estate photography, video, reels and drone for properties, architecture and developments in Buenos Aires.",

    "footer-links":
      "Quick Links",

    "footer-contact":
      "Contact Information",

    "footer-follow":
      "Follow Us",

    "footer-subscribe":
      "Subscribe",

    "footer-subscribe-text":
      "Stay updated with our latest news and offers.",

    "footer-subscribe-button":
      "Subscribe",

    "footer-subscribe-placeholder":
      "Your email",

    "footer-subscribe-thanks":
      "Thank you for subscribing!",

    "whatsapp-title":
      "Clover Digital",

    "whatsapp-message":
      "Hello! How can we help you today?",

    "whatsapp-button":
      "Start Chat",

    "whatsapp-float":
      "Chat with us",

    copyright:
      "© 2026 Clover Digital, Buenos Aires, Argentina. All rights reserved.",
  },
}

const LanguageContext =
  createContext<
    LanguageContextType |
    undefined
  >(
    undefined
  )

export function LanguageProvider({
  children,
}: {
  children:
    ReactNode
}) {
  const [
    language,
    setLanguage,
  ] =
    useState<Language>(
      "es"
    )

  useEffect(
    () => {
      const savedLanguage =
        localStorage.getItem(
          "language"
        ) as Language

      if (
        savedLanguage &&
        (
          savedLanguage ===
            "es" ||
          savedLanguage ===
            "en"
        )
      ) {
        setLanguage(
          savedLanguage
        )
      }
    },
    []
  )

  useEffect(
    () => {
      localStorage.setItem(
        "language",
        language
      )
    },
    [
      language,
    ]
  )

  const t =
    (
      key: string
    ): string => {
      return (
        translations[
          language
        ][
          key as keyof (
            typeof translations
          )[
            typeof language
          ]
        ] ||
        key
      )
    }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context =
    useContext(
      LanguageContext
    )

  if (
    context ===
    undefined
  ) {
    throw new Error(
      "useLanguage must be used within a LanguageProvider"
    )
  }

  return context
}