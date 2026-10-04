"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "es" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  es: {
    home: "Inicio",
    services: "Servicios",
    portfolio: "Portfolio",
    contactUs: "Cotizar",
    location: "Buenos Aires, Argentina",
    slogan: "Fotografía y video para vender propiedades",
    "hero-description":
      "Fotografía inmobiliaria HDR, video recorrido, reels y drone para inmobiliarias, agentes y desarrollos en Zona Norte y CABA. Entrega en 48–72 hs.",
    "hero-cta": "Cotizá tu producción",
    "about-title": "¡Conócenos!",
    "about-p1": "Somos Clover Digital, un equipo de producción audiovisual especializado en propiedades y arquitectura.",
    "about-p2": "Trabajamos con inmobiliarias, agentes y desarrollistas para que cada propiedad se vea como lo que es.",
    "about-p3": "Cada producción se piensa según el tipo de propiedad y el canal donde se va a publicar: portales, redes o ambos.",
    "services-title": "Nuestros Servicios",
    "service-1-title": "Fotografía HDR",
    "service-1-desc": "Fotos de interiores y exteriores con luz y color cuidados.",
    "service-2-title": "Video recorrido",
    "service-2-desc": "Video horizontal para portales inmobiliarios.",
    "service-3-title": "Video vertical para redes",
    "service-3-desc": "Piezas de hasta 60 segundos listas para Instagram y TikTok.",
    "service-4-title": "Reel hablado",
    "service-4-desc": "Grabación con micrófono, edición y subtítulos.",
    "service-5-title": "Drone",
    "service-5-desc": "Fotografía y video aéreo para mostrar el entorno y los amenities.",
    "service-6-title": "Desarrollos inmobiliarios",
    "service-6-desc": "Foto, video y drone para proyectos en pozo y de gran escala.",
    "portfolio-title": "Nuestro trabajo",
    "portfolio-more": "Ver más en Instagram",
    "portfolio-behance": "Ver todo en Behance",
    "clients-title": "Confían en nuestro equipo",
    "footer-about": "Fotografía y video para propiedades, arquitectura y desarrollos inmobiliarios en Buenos Aires.",
    "footer-links": "Enlaces Rápidos",
    "footer-contact": "Información de Contacto",
    "footer-follow": "Síguenos",
    "footer-subscribe": "Suscríbete",
    "footer-subscribe-text": "Mantente actualizado con nuestras últimas noticias y ofertas.",
    "footer-subscribe-button": "Suscribirse",
    "footer-subscribe-placeholder": "Tu email",
    "footer-subscribe-thanks": "¡Gracias por suscribirte!",
    "whatsapp-title": "Clover Digital",
    "whatsapp-message": "¡Hola! ¿Cómo podemos ayudarte hoy?",
    "whatsapp-button": "Iniciar Chat",
    "whatsapp-float": "Chatea con nosotros",
    copyright: "© 2026 Clover Digital, Buenos Aires, Argentina. Todos los derechos reservados.",
  },
  en: {
    home: "Home",
    services: "Services",
    portfolio: "Portfolio",
    contactUs: "Get a quote",
    location: "Buenos Aires, Argentina",
    slogan: "Photo and video to sell properties",
    "hero-description":
      "HDR real estate photography, walkthrough video, reels and drone for agencies, agents and developments in Buenos Aires (North Zone and CABA). Delivery in 48–72 hours.",
    "hero-cta": "Get your quote",
    "about-title": "About us!",
    "about-p1": "We are Clover Digital, an audiovisual production team specialized in properties and architecture.",
    "about-p2": "We work with agencies, agents and developers so every property looks like what it is.",
    "about-p3": "Each production is planned around the type of property and where it will be published: portals, social media or both.",
    "services-title": "Our Services",
    "service-1-title": "HDR photography",
    "service-1-desc": "Interior and exterior photos with careful light and color.",
    "service-2-title": "Walkthrough video",
    "service-2-desc": "Horizontal video for real estate portals.",
    "service-3-title": "Vertical video for social media",
    "service-3-desc": "Pieces up to 60 seconds, ready for Instagram and TikTok.",
    "service-4-title": "Talking reel",
    "service-4-desc": "Microphone recording, editing and subtitles.",
    "service-5-title": "Drone",
    "service-5-desc": "Aerial photo and video to show the surroundings and amenities.",
    "service-6-title": "Real estate developments",
    "service-6-desc": "Photo, video and drone for off-plan and large-scale projects.",
    "portfolio-title": "Our work",
    "portfolio-more": "See more on Instagram",
    "portfolio-behance": "See everything on Behance",
    "clients-title": "Trusted by",
    "footer-about": "Photo and video for properties, architecture and real estate developments in Buenos Aires.",
    "footer-links": "Quick Links",
    "footer-contact": "Contact Information",
    "footer-follow": "Follow Us",
    "footer-subscribe": "Subscribe",
    "footer-subscribe-text": "Stay updated with our latest news and offers.",
    "footer-subscribe-button": "Subscribe",
    "footer-subscribe-placeholder": "Your email",
    "footer-subscribe-thanks": "Thank you for subscribing!",
    "whatsapp-title": "Clover Digital",
    "whatsapp-message": "Hello! How can we help you today?",
    "whatsapp-button": "Start Chat",
    "whatsapp-float": "Chat with us",
    copyright: "© 2026 Clover Digital, Buenos Aires, Argentina. All rights reserved.",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es")

  // Load language preference from localStorage on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
