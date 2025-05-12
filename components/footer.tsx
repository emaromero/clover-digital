"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Instagram, Facebook, Mail, Phone } from "lucide-react"
import { useLanguage } from "./language-provider"
import ParticleAnimation from "./particle-animation"
import { useMobile } from "@/hooks/use-mobile"

export default function Footer() {
  const { t, language } = useLanguage()
  const footerRef = useRef<HTMLElement>(null)
  const isMobile = useMobile()

  return (
    <footer ref={footerRef} className="relative overflow-hidden bg-[#B8D8D8]/30 dark:bg-[#004E64]/30 pt-12">
      <div className="container mx-auto px-4 relative z-10 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white dark:bg-[#001219] p-2 mb-4">
                {isMobile ? (
                  <Image
                    src="https://i.postimg.cc/pLSPM0KB/logo-Clover-Digital.png"
                    alt="Clover Digital"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                ) : (
                  <>
                    <Image
                      src="https://i.postimg.cc/pLSPM0KB/logo-Clover-Digital.png"
                      alt="Clover Digital"
                      width={96}
                      height={96}
                      className="object-contain"
                    />
                    <ParticleAnimation containerId="footer-particles" />
                  </>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-4 text-center md:text-left">
                {language === "en"
                  ? "Digital solutions that connect with your essence. We create websites, manage social media, and design your brand identity."
                  : "Soluciones digitales que conectan con tu esencia. Creamos sitios web, gestionamos redes sociales y diseñamos tu identidad de marca."}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-center md:text-left text-gray-800 dark:text-white">
              {language === "en" ? "Quick Links" : "Enlaces Rápidos"}
            </h3>
            <ul className="space-y-2 text-center md:text-left">
              <li>
                <Link href="#home" className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                >
                  {t("services")}
                </Link>
              </li>
              <li>
                <Link
                  href="#portfolio"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                >
                  {t("portfolio")}
                </Link>
              </li>
              <li>
                <Link
                  href="#contact-us"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                >
                  {t("contactUs")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-center md:text-left text-gray-800 dark:text-white">
              {language === "en" ? "Contact Info" : "Información de Contacto"}
            </h3>
            <ul className="space-y-2 text-center md:text-left">
              <li className="flex items-center justify-center md:justify-start">
                <Mail className="w-4 h-4 mr-2 text-[#0A9396]" />
                <a
                  href="mailto:cloverdigitalarg@gmail.com"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                >
                  cloverdigitalarg@gmail.com
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Phone className="w-4 h-4 mr-2 text-[#0A9396]" />
                <a
                  href="https://wa.me/5491164473603"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                >
                  +54 9 11 6447-3603
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Instagram className="w-4 h-4 mr-2 text-[#0A9396]" />
                <a
                  href="https://www.instagram.com/cloverdigital.arg"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                >
                  @cloverdigital.arg
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Facebook className="w-4 h-4 mr-2 text-[#0A9396]" />
                <a
                  href="https://www.facebook.com/people/Clover-Digital/61570512932271/"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                >
                  Clover Digital
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-center md:text-left text-gray-800 dark:text-white">
              {language === "en" ? "Follow Us" : "Síguenos"}
            </h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link
                href="https://www.instagram.com/cloverdigital.arg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </Link>
              <Link
                href="https://www.facebook.com/people/Clover-Digital/61570512932271/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </Link>
              <Link
                href="mailto:cloverdigitalarg@gmail.com"
                className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                aria-label="Email"
              >
                <Mail size={24} />
              </Link>
              <Link
                href="https://wa.me/5491164473603"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                aria-label="WhatsApp"
              >
                <Phone size={24} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ondas del footer */}
      <div className="absolute bottom-0 left-0 right-0 w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            fill="#B8D8D8"
            fillOpacity="0.5"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
          <path
            fill="#0A9396"
            fillOpacity="0.3"
            d="M0,256L48,261.3C96,267,192,277,288,266.7C384,256,480,224,576,218.7C672,213,768,235,864,245.3C960,256,1056,256,1152,234.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
          <path
            fill="#005F73"
            fillOpacity="0.2"
            d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </footer>
  )
}
