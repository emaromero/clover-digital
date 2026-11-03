"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { motion, useReducedMotion } from "framer-motion"
import {
  Home,
  Camera,
  Images,
  Calculator,
  Moon,
  Sun,
} from "lucide-react"
import { useLanguage } from "./language-provider"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")

  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      const sectionIds = [
        "home",
        "services",
        "portfolio",
        "cotizador",
      ]

      const detectionPoint = window.scrollY + 180

      let current = "home"

      for (const id of sectionIds) {
        const element = document.getElementById(id)

        if (!element) continue

        const elementTop =
          element.getBoundingClientRect().top +
          window.scrollY

        if (elementTop <= detectionPoint) {
          current = id
        }
      }

      setActiveSection(current)
    }

    handleScroll()

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es")
  }

  const scrollToSection = (id: string) => {
    setActiveSection(id)

    const element = document.getElementById(id)

    if (!element) return

    if (id === "home") {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      })

      return
    }

    const headerOffset =
      window.innerWidth < 768 ? 112 : 92

    const elementTop =
      element.getBoundingClientRect().top +
      window.scrollY

    const finalPosition =
      elementTop - headerOffset

    window.scrollTo({
      top: finalPosition,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }

  const logoUrl =
    "https://i.postimg.cc/pLSPM0KB/logo-Clover-Digital.png"

  const desktopLinks = [
    {
      id: "home",
      href: "#home",
      label: t("home"),
    },
    {
      id: "services",
      href: "#services",
      label: t("services"),
    },
    {
      id: "portfolio",
      href: "#portfolio",
      label: t("portfolio"),
    },
    {
      id: "cotizador",
      href: "#cotizador",
      label: t("contactUs"),
    },
  ]

  const mobileLinks = [
    {
      id: "home",
      href: "#home",
      label:
        language === "es"
          ? "Inicio"
          : "Home",
      icon: Home,
    },
    {
      id: "services",
      href: "#services",
      label:
        language === "es"
          ? "Servicios"
          : "Services",
      icon: Camera,
    },
    {
      id: "portfolio",
      href: "#portfolio",
      label: "Portfolio",
      icon: Images,
    },
    {
      id: "cotizador",
      href: "#cotizador",
      label:
        language === "es"
          ? "Cotizar"
          : "Quote",
      icon: Calculator,
    },
  ]

  const navbarClasses = `
    fixed
    top-0
    left-0
    right-0
    z-[90]
    transition-all
    duration-300
    ${
      scrolled
        ? "bg-[#B8D8D8]/85 dark:bg-[#004E64]/85 backdrop-blur-xl shadow-sm"
        : "bg-transparent"
    }
  `

  return (
    <>
      {/* NAVBAR SUPERIOR */}
      <nav className={navbarClasses}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="#home"
            onClick={(event) => {
              event.preventDefault()
              scrollToSection("home")
            }}
            className="relative h-12 w-12"
            aria-label="Clover Digital"
          >
            <Image
              src={logoUrl}
              alt="Clover Digital"
              width={48}
              height={48}
              priority
              className="object-contain"
            />
          </Link>

          {/* DESKTOP */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {desktopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(event) => {
                    event.preventDefault()
                    scrollToSection(link.id)
                  }}
                  className="
                    text-gray-700
                    dark:text-gray-200
                    hover:text-[#0A9396]
                    dark:hover:text-[#0A9396]
                    transition-colors
                  "
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={toggleLanguage}
                className="
                  px-2
                  py-1
                  rounded-md
                  hover:bg-gray-100/50
                  dark:hover:bg-gray-800/50
                  transition-colors
                "
                aria-label={
                  language === "es"
                    ? "Switch to English"
                    : "Cambiar a Español"
                }
              >
                {language === "es" ? "EN" : "ES"}
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="
                  p-2
                  rounded-full
                  hover:bg-gray-100/50
                  dark:hover:bg-gray-800/50
                  transition-colors
                "
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* MOBILE SUPERIOR */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="
                px-3
                py-2
                rounded-full
                bg-white/25
                dark:bg-black/10
                backdrop-blur-md
                transition-colors
              "
              aria-label={
                language === "es"
                  ? "Switch to English"
                  : "Cambiar a Español"
              }
            >
              {language === "es" ? "EN" : "ES"}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="
                p-2.5
                rounded-full
                bg-white/25
                dark:bg-black/10
                backdrop-blur-md
                transition-colors
              "
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* BARRA INFERIOR MOBILE */}
      <div
        className="
          fixed
          left-1/2
          -translate-x-1/2
          z-[100]
          md:hidden
          w-[calc(100%_-_24px)]
          max-w-[430px]
          px-1
        "
        style={{
          bottom:
            "calc(env(safe-area-inset-bottom) + 2px)",
        }}
      >
        <div
          className="
            relative
            grid
            grid-cols-4
            items-center
            rounded-[30px]
            border
            border-white/60
            dark:border-white/10
            bg-white/65
            dark:bg-[#06222c]/72
            backdrop-blur-2xl
            shadow-[0_12px_40px_rgba(0,0,0,0.18)]
            p-1.5
            overflow-hidden
          "
        >
          {mobileLinks.map((item) => {
            const Icon = item.icon
            const active =
              activeSection === item.id

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(event) => {
                  event.preventDefault()
                  scrollToSection(item.id)
                }}
                className="
                  relative
                  flex
                  min-h-[58px]
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  rounded-[24px]
                  text-[10px]
                  font-semibold
                  select-none
                  touch-manipulation
                "
              >
                {/* CÁPSULA LIQUID ACTIVA */}
                {active && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    transition={
                      reduceMotion
                        ? {
                            duration: 0,
                          }
                        : {
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            mass: 0.75,
                          }
                    }
                    className="
                      absolute
                      inset-0
                      rounded-[24px]
                      bg-white/92
                      dark:bg-white/14
                      border
                      border-white/80
                      dark:border-white/10
                      shadow-[0_6px_18px_rgba(0,0,0,0.10)]
                      backdrop-blur-xl
                    "
                  >
                    <span
                      className="
                        absolute
                        inset-x-3
                        top-1
                        h-[1px]
                        rounded-full
                        bg-white/90
                        dark:bg-white/20
                      "
                    />

                    <span
                      className="
                        absolute
                        inset-0
                        rounded-[24px]
                        bg-gradient-to-b
                        from-white/20
                        to-transparent
                        pointer-events-none
                      "
                    />
                  </motion.span>
                )}

                {/* ICONO */}
                <motion.div
                  animate={
                    active && !reduceMotion
                      ? {
                          y: -1,
                          scale: 1.04,
                        }
                      : {
                          y: 0,
                          scale: 1,
                        }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="relative z-10"
                >
                  <Icon
                    className={`
                      h-5
                      w-5
                      transition-colors
                      duration-200
                      ${
                        active
                          ? "text-[#0e5c6e] dark:text-[#5fb8cc]"
                          : "text-gray-500 dark:text-gray-300"
                      }
                    `}
                  />
                </motion.div>

                {/* TEXTO */}
                <span
                  className={`
                    relative
                    z-10
                    transition-colors
                    duration-200
                    ${
                      active
                        ? "text-[#001219] dark:text-white"
                        : "text-gray-500 dark:text-gray-300"
                    }
                  `}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}