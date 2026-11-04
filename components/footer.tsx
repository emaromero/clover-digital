"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Instagram,
  Facebook,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react"
import { useLanguage } from "./language-provider"

const GOOGLE_MAPS_URL =
  "https://maps.app.goo.gl/r7ia4x83F2eHbJru9"

export default function Footer() {
  const { t, language } = useLanguage()

  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-[#B8D8D8]/30 dark:bg-[#004E64]/30 pt-12">
      <div className="container mx-auto px-5 md:px-6 relative z-10 mb-32">

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">

          {/* LOGO + DESCRIPCIÓN */}
          <div>
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white dark:bg-[#001219] p-2 mb-4 shadow-sm">
                <Image
                  src="https://i.postimg.cc/pLSPM0KB/logo-Clover-Digital.png"
                  alt="Clover Digital"
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed text-center lg:text-left max-w-[280px]">
                {t("footer-about")}
              </p>
            </div>
          </div>

          {/* ENLACES */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center lg:text-left text-gray-800 dark:text-white">
              {language === "en"
                ? "Quick links"
                : "Enlaces rápidos"}
            </h3>

            <ul className="space-y-2.5 text-center lg:text-left">
              <li>
                <Link
                  href="#home"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                >
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
                  href="#cotizador"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                >
                  {t("contactUs")}
                </Link>
              </li>

              <li>
                <Link
                  href="/privacidad"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    lg:justify-start
                    gap-2
                    text-gray-700
                    dark:text-gray-300
                    hover:text-[#0A9396]
                    transition-colors
                  "
                >
                  <ShieldCheck className="w-4 h-4 text-[#0A9396] shrink-0" />

                  <span>
                    {language === "en"
                      ? "Privacy policy"
                      : "Política de privacidad"}
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACTO */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center lg:text-left text-gray-800 dark:text-white">
              {language === "en"
                ? "Contact"
                : "Información de contacto"}
            </h3>

            <ul className="space-y-3">
              <li className="flex items-center justify-center lg:justify-start gap-3">
                <Mail className="w-[18px] h-[18px] text-[#0A9396] shrink-0" />

                <a
                  href="mailto:cloverdigitalarg@gmail.com"
                  className="
                    text-[13px]
                    sm:text-sm
                    text-gray-700
                    dark:text-gray-300
                    hover:text-[#0A9396]
                    transition-colors
                  "
                >
                  cloverdigitalarg@gmail.com
                </a>
              </li>

              <li className="flex items-center justify-center lg:justify-start gap-3">
                <Phone className="w-[18px] h-[18px] text-[#0A9396] shrink-0" />

                <a
                  href="https://wa.me/5491164473603"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                >
                  +54 9 11 6447-3603
                </a>
              </li>

              <li className="flex items-center justify-center lg:justify-start gap-3">
                <Instagram className="w-[18px] h-[18px] text-[#0A9396] shrink-0" />

                <a
                  href="https://www.instagram.com/cloverdigital.arg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                >
                  @cloverdigital.arg
                </a>
              </li>

              <li className="flex items-center justify-center lg:justify-start gap-3">
                <Facebook className="w-[18px] h-[18px] text-[#0A9396] shrink-0" />

                <a
                  href="https://www.facebook.com/people/Clover-Digital/61570512932271/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-[#0A9396] transition-colors"
                >
                  Clover Digital
                </a>
              </li>
            </ul>
          </div>

          {/* REDES */}
          <div>
            <h3 className="text-lg font-semibold mb-5 text-center lg:text-left text-gray-800 dark:text-white">
              {language === "en"
                ? "Follow us"
                : "Seguinos"}
            </h3>

            <div className="flex justify-center lg:justify-start gap-3">

              <Link
                href="https://www.instagram.com/cloverdigital.arg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="
                  flex
                  items-center
                  justify-center
                  w-11
                  h-11
                  rounded-full
                  border
                  border-[#0A9396]/20
                  bg-white/40
                  dark:bg-white/5
                  text-gray-700
                  dark:text-gray-200
                  hover:bg-[#0A9396]
                  hover:text-white
                  hover:border-[#0A9396]
                  transition-all
                  duration-200
                "
              >
                <Instagram className="w-[22px] h-[22px]" />
              </Link>

              <Link
                href="https://www.facebook.com/people/Clover-Digital/61570512932271/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="
                  flex
                  items-center
                  justify-center
                  w-11
                  h-11
                  rounded-full
                  border
                  border-[#0A9396]/20
                  bg-white/40
                  dark:bg-white/5
                  text-gray-700
                  dark:text-gray-200
                  hover:bg-[#0A9396]
                  hover:text-white
                  hover:border-[#0A9396]
                  transition-all
                  duration-200
                "
              >
                <Facebook className="w-[22px] h-[22px]" />
              </Link>

              <Link
                href="mailto:cloverdigitalarg@gmail.com"
                aria-label="Email"
                className="
                  flex
                  items-center
                  justify-center
                  w-11
                  h-11
                  rounded-full
                  border
                  border-[#0A9396]/20
                  bg-white/40
                  dark:bg-white/5
                  text-gray-700
                  dark:text-gray-200
                  hover:bg-[#0A9396]
                  hover:text-white
                  hover:border-[#0A9396]
                  transition-all
                  duration-200
                "
              >
                <Mail className="w-[22px] h-[22px]" />
              </Link>

              <Link
                href="https://wa.me/5491164473603"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="
                  flex
                  items-center
                  justify-center
                  w-11
                  h-11
                  rounded-full
                  border
                  border-[#0A9396]/20
                  bg-white/40
                  dark:bg-white/5
                  text-gray-700
                  dark:text-gray-200
                  hover:bg-[#0A9396]
                  hover:text-white
                  hover:border-[#0A9396]
                  transition-all
                  duration-200
                "
              >
                <Phone className="w-[22px] h-[22px]" />
              </Link>

            </div>
          </div>
        </div>

        {/* LÍNEA INFERIOR */}
        <div className="border-t border-gray-300/60 dark:border-white/10 pt-6">
          <div
            className="
              flex
              flex-col
              lg:flex-row
              items-center
              justify-between
              gap-4
              text-sm
              text-gray-600
              dark:text-gray-400
              text-center
              lg:text-left
            "
          >
            <p>
              © {currentYear} Clover Digital.{" "}
              {language === "en"
                ? "All rights reserved."
                : "Todos los derechos reservados."}
            </p>

            <div className="flex items-center justify-center gap-5">
              <Link
                href="/privacidad"
                className="hover:text-[#0A9396] transition-colors"
              >
                {language === "en"
                  ? "Privacy"
                  : "Privacidad"}
              </Link>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0A9396] transition-colors"
              >
                Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ONDAS */}
      <div className="absolute bottom-0 left-0 right-0 w-full pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="w-full h-auto"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="#B8D8D8"
            fillOpacity="0.5"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />

          <path
            fill="#0A9396"
            fillOpacity="0.3"
            d="M0,256L48,261.3C96,267,192,277,288,266.7C384,256,480,224,576,218.7C672,213,768,235,864,245.3C960,256,1056,256,1152,234.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />

          <path
            fill="#005F73"
            fillOpacity="0.2"
            d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </footer>
  )
}