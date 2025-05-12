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
    contactUs: "Contacto",
    location: "Buenos Aires, Argentina",
    slogan: "Donde lo digital conecta con tu esencia",
    "hero-description":
      "Diseñamos experiencias digitales que conectan con tu audiencia. Desde sitios web hasta branding completo, creamos soluciones personalizadas que reflejan la esencia de tu marca.",
    "hero-cta": "Contáctanos",
    "about-title": "¡Conócenos!",
    "about-p1":
      "Somos emprendedores como vos, movidos por la pasión de contar historias en imágenes, diseño y estrategias que vibran online.",
    "about-p2":
      "No trabajamos con moldes ni fórmulas mágicas: escuchamos tus necesidades y creamos soluciones para potenciar tu negocio.",
    "about-p3":
      "Cada proyecto lo tomamos en serio, con cabeza estratégica y ojo en los detalles. Nada de copiar y pegar: acá se diseña a medida.",
    "services-title": "Nuestros Servicios",
    "service-1-title": "Páginas web y tiendas online",
    "service-1-desc": "Diseño personalizado, responsive y moderno.",
    "service-2-title": "Flyers y materiales gráficos",
    "service-2-desc": "Diseños atractivos para reforzar tu marca.",
    "service-3-title": "Gestión de RRSS",
    "service-3-desc": "Planificación, creación y programación estratégica del contenido.",
    "service-4-title": "Fotografía",
    "service-4-desc": "Fotos que destacan tus productos o espacios. ",
    "service-5-title": "Campañas publicitarias",
    "service-5-desc": "Meta Ads para maximizar tu alcance.",
    "service-6-title": "Papelería de marca",
    "service-6-desc": "Plasmamos tus ideas en papel. Envíos a todo el país",
    "service-7-title": "Branding",
    "service-7-desc": "Identidad visual para brillar.",
    "service-8-title": "QR para eventos",
    "service-8-desc": "Códigos personalizados para guardar momentos mágicos.",
    "clients-title": "+ 10 emprendedores confiaron en nosotros",
    "contact-title": "Contacto",
    "contact-description": "¿Tienes un proyecto en mente? Contáctanos y hagámoslo realidad juntos.",
    "contact-name": "Nombre",
    "contact-email": "Email",
    "contact-message": "Mensaje",
    "contact-submit": "Enviar mensaje",
    "contact-success": "¡Mensaje enviado con éxito!",
    "contact-error": "Error al enviar el mensaje. Por favor, intenta nuevamente.",
    "footer-about":
      "Soluciones digitales que conectan con tu esencia. Creamos sitios web, gestionamos redes sociales y diseñamos tu identidad de marca.",
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
    "portfolio-web": "Sitios Web",
    "portfolio-design": "Diseño Gráfico & Branding",
    "portfolio-visit": "Visitar sitio",
    copyright: "© 2025 Clover Digital, Buenos Aires, Argentina. Todos los derechos reservados.",
  },
en: {
  home: "Home",
  services: "Services",
  portfolio: "Portfolio",
  contactUs: "Contact",
  location: "Buenos Aires, Argentina",
  slogan: "Where digital connects with your essence",
  "hero-description":
    "We design digital experiences that connect with your audience. From websites to complete branding, we create customized solutions that reflect the essence of your brand.",
  "hero-cta": "Contact us",
  "about-title": "About us!",
  "about-p1":
    "We are entrepreneurs like you, driven by the passion of telling stories through images, design, and strategies that vibrate online.",
  "about-p2":
    "We don’t work with templates or magic formulas: we listen to your needs and create solutions to boost your business.",
  "about-p3":
    "We take every project seriously, with a strategic mindset and an eye for detail. No copy-paste here: we design tailor-made solutions.",
  "services-title": "Our Services",
  "service-1-title": "Websites and online stores",
  "service-1-desc": "Customized, responsive, and modern design.",
  "service-2-title": "Flyers and graphic materials",
  "service-2-desc": "Attractive designs to strengthen your brand.",
  "service-3-title": "Social media management",
  "service-3-desc": "Strategic planning, creation, and scheduling of content.",
  "service-4-title": "Photography",
  "service-4-desc": "Photos that highlight your products or spaces.",
  "service-5-title": "Advertising campaigns",
  "service-5-desc": "Meta Ads to maximize your reach.",
  "service-6-title": "Brand stationery",
  "service-6-desc": "We bring your ideas to paper. Nationwide shipping.",
  "service-7-title": "Branding",
  "service-7-desc": "Visual identity to make you shine.",
  "service-8-title": "Event QR codes",
  "service-8-desc": "Customized codes to capture magical moments.",
  "clients-title": "+10 entrepreneurs trusted us",
  "contact-title": "Contact",
  "contact-description": "Have a project in mind? Contact us and let’s make it happen together.",
  "contact-name": "Name",
  "contact-email": "Email",
  "contact-message": "Message",
  "contact-submit": "Send message",
  "contact-success": "Message sent successfully!",
  "contact-error": "Error sending message. Please try again.",
  "footer-about":
    "Digital solutions that connect with your essence. We create websites, manage social media, and design your brand identity.",
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
  "portfolio-web": "Websites",
  "portfolio-design": "Graphic Design & Branding",
  "portfolio-visit": "Visit site",
  copyright: "© 2025 Clover Digital, Buenos Aires, Argentina. All rights reserved.",
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
