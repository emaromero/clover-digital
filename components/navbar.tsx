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

  const sectionIds = [
    "home",
    "services",
    "portfolio",
    "cotizador",
  ]

  const activeIndex = Math.max(
    0,
    sectionIds.indexOf(activeSection)
  )

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      const detectionPoint =
        window.scrollY + 180

      let current = "home"

      for (const id of sectionIds) {
        const element =
          document.getElementById(id)

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

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    )

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      )
    }
  }, [])

  const toggleTheme = () => {
    setTheme(
      theme === "dark"
        ? "light"
        : "dark"
    )
  }

  const toggleLanguage = () => {
    setLanguage(
      language === "es"
        ? "en"
        : "es"
    )
  }

  const scrollToSection = (
    id: string
  ) => {
    setActiveSection(id)

    const element =
      document.getElementById(id)

    if (!element) return

    if (id === "home") {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion
          ? "auto"
          : "smooth",
      })

      return
    }

    const headerOffset =
      window.innerWidth < 768
        ? 112
        : 92

    const elementTop =
      element.getBoundingClientRect().top +
      window.scrollY

    window.scrollTo({
      top:
        elementTop -
        headerOffset,
      behavior: reduceMotion
        ? "auto"
        : "smooth",
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
      {/* HEADER SUPERIOR */}
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
                {language === "es"
                  ? "EN"
                  : "ES"}
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
              {language === "es"
                ? "EN"
                : "ES"}
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

      {/* NAV MOBILE LIQUID */}
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
            rounded-[32px]
            border
            border-white/60
            dark:border-white/10
            bg-white/60
            dark:bg-[#06222c]/72
            backdrop-blur-2xl
            shadow-[0_14px_40px_rgba(0,0,0,0.18)]
            p-1.5
            overflow-hidden
          "
        >

          {/* CÁPSULA LIQUID */}
          <motion.div
            className="
              absolute
              top-1.5
              bottom-1.5
              left-1.5
              rounded-[27px]
              border
              border-white/75
              dark:border-white/15
              bg-white/72
              dark:bg-white/12
              backdrop-blur-2xl
              shadow-[0_7px_22px_rgba(0,0,0,0.13),inset_0_1px_1px_rgba(255,255,255,0.9)]
              pointer-events-none
              overflow-hidden
            "
            style={{
              width:
                "calc((100% - 12px) / 4)",
            }}
            animate={{
              x: `${activeIndex * 100}%`,
            }}
            transition={
              reduceMotion
                ? {
                    duration: 0,
                  }
                : {
                    type: "spring",
                    stiffness: 230,
                    damping: 27,
                    mass: 0.78,
                  }
            }
          >

            {/* REFLEJO SUPERIOR */}
            <div
              className="
                absolute
                top-[1px]
                left-[16%]
                right-[16%]
                h-[1px]
                rounded-full
                bg-white/95
              "
            />

            {/* DEGRADADO DE VIDRIO */}
            <div
              className="
                absolute
                inset-0
                rounded-[27px]
                bg-gradient-to-b
                from-white/30
                via-white/8
                to-transparent
              "
            />

            {/* REFLEJO LATERAL */}
            <div
              className="
                absolute
                left-[2px]
                top-[18%]
                bottom-[18%]
                w-[1px]
                rounded-full
                bg-white/60
              "
            />

          </motion.div>

          {/* BOTONES */}
          {mobileLinks.map(
            (item, index) => {
              const Icon = item.icon

              const active =
                activeIndex === index

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault()

                    scrollToSection(
                      item.id
                    )
                  }}
                  className="
                    relative
                    z-10
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

                  <motion.div
                    animate={{
                      y: active
                        ? -1
                        : 0,
                      scale: active
                        ? 1.04
                        : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 360,
                      damping: 26,
                    }}
                    className="relative"
                  >
                    <Icon
                      className={`
                        h-5
                        w-5
                        transition-colors
                        duration-200
                        ${
                          active
                            ? "text-[#0e5c6e] dark:text-[#62c8df]"
                            : "text-gray-500 dark:text-gray-300"
                        }
                      `}
                    />
                  </motion.div>

                  <span
                    className={`
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
            }
          )}

        </div>
      </div>
    </>
  )
}