"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion"
import {
  Home,
  Camera,
  Images,
  Calculator,
  Moon,
  Sun,
} from "lucide-react"
import { useLanguage } from "./language-provider"
import AuthNav from "./auth-nav"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")

  const navigatingRef = useRef(false)
  const navigationTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const clamp = (
    value: number,
    min: number,
    max: number
  ) => {
    return Math.min(
      Math.max(value, min),
      max
    )
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      if (navigatingRef.current) {
        return
      }

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

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(
          navigationTimeoutRef.current
        )
      }
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

  const goToSection = (
    id: string
  ) => {
    setActiveSection(id)

    navigatingRef.current = true

    if (navigationTimeoutRef.current) {
      clearTimeout(
        navigationTimeoutRef.current
      )
    }

    const element =
      document.getElementById(id)

    if (!element) {
      navigatingRef.current = false
      return
    }

    if (id === "home") {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion
          ? "auto"
          : "smooth",
      })
    } else {
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

    navigationTimeoutRef.current =
      setTimeout(() => {
        navigatingRef.current = false
      }, reduceMotion ? 50 : 900)
  }

  const handleNavbarSwipe = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const distanceThreshold = 38
    const velocityThreshold = 300

    const horizontalDistance =
      Math.abs(info.offset.x)

    const horizontalVelocity =
      Math.abs(info.velocity.x)

    if (
      horizontalDistance <
        distanceThreshold &&
      horizontalVelocity <
        velocityThreshold
    ) {
      return
    }

    const direction =
      info.offset.x < 0
        ? 1
        : -1

    const nextIndex = clamp(
      activeIndex + direction,
      0,
      sectionIds.length - 1
    )

    if (
      nextIndex === activeIndex
    ) {
      return
    }

    goToSection(
      sectionIds[nextIndex]
    )
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
      label:
        language === "es"
          ? "Inicio"
          : "Home",
      icon: Home,
    },
    {
      id: "services",
      label:
        language === "es"
          ? "Servicios"
          : "Services",
      icon: Camera,
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: Images,
    },
    {
      id: "cotizador",
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
              goToSection("home")
            }}
            className="relative h-12 w-12 shrink-0"
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
          <div className="hidden md:flex items-center gap-6">

            <div className="flex items-center space-x-6">
              {desktopLinks.map(
                (link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(event) => {
                      event.preventDefault()

                      goToSection(
                        link.id
                      )
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
                )
              )}
            </div>

            {/* CUENTA / LOGIN */}
            <AuthNav />

            {/* IDIOMA + TEMA */}
            <div className="flex items-center space-x-2">

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

            {/* CUENTA */}
            <AuthNav mobile />

            {/* IDIOMA */}
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

            {/* TEMA */}
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

      {/* NAVBAR INFERIOR MOBILE */}
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
        <motion.div
          onPanEnd={handleNavbarSwipe}
          style={{
            touchAction: "pan-y",
          }}
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

          {/* CÁPSULA ACTIVA */}
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
                    stiffness: 520,
                    damping: 34,
                    mass: 0.45,
                  }
            }
          >

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

          </motion.div>

          {/* BOTONES */}
          {mobileLinks.map(
            (item, index) => {
              const Icon =
                item.icon

              const active =
                index === activeIndex

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    goToSection(
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
                    [-webkit-touch-callout:none]
                  "
                  aria-label={item.label}
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
                      stiffness: 500,
                      damping: 30,
                    }}
                    className="
                      pointer-events-none
                    "
                  >
                    <Icon
                      className={`
                        h-5
                        w-5
                        transition-colors
                        duration-150
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
                      pointer-events-none
                      transition-colors
                      duration-150
                      ${
                        active
                          ? "text-[#001219] dark:text-white"
                          : "text-gray-500 dark:text-gray-300"
                      }
                    `}
                  >
                    {item.label}
                  </span>

                </button>
              )
            }
          )}

        </motion.div>
      </div>
    </>
  )
}