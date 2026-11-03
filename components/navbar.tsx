"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [itemWidth, setItemWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const trackRef = useRef<HTMLDivElement>(null)

  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  const reduceMotion = useReducedMotion()

  const capsuleX = useMotionValue(0)

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

  /*
   * Medimos automáticamente el ancho de cada
   * posición de la barra.
   */
  useEffect(() => {
    const track = trackRef.current

    if (!track) return

    const updateSize = () => {
      /*
       * La barra tiene p-1.5:
       * 6px a la izquierda + 6px a la derecha.
       */
      const usableWidth =
        track.clientWidth - 12

      setItemWidth(
        usableWidth / 4
      )
    }

    updateSize()

    const observer =
      new ResizeObserver(updateSize)

    observer.observe(track)

    return () => {
      observer.disconnect()
    }
  }, [])

  /*
   * Detecta qué sección está visible mientras
   * el usuario hace scroll normalmente.
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 50
      )

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

        if (
          elementTop <=
          detectionPoint
        ) {
          current = id
        }
      }

      if (!isDragging) {
        setActiveSection(current)
      }
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
  }, [isDragging])

  /*
   * Cuando cambia la sección activa,
   * movemos suavemente la cápsula.
   */
  useEffect(() => {
    if (
      !itemWidth ||
      isDragging
    ) {
      return
    }

    const destination =
      activeIndex * itemWidth

    const controls = animate(
      capsuleX,
      destination,
      reduceMotion
        ? {
            duration: 0,
          }
        : {
            type: "spring",
            stiffness: 260,
            damping: 28,
            mass: 0.75,
          }
    )

    return () => {
      controls.stop()
    }
  }, [
    activeIndex,
    itemWidth,
    isDragging,
    reduceMotion,
    capsuleX,
  ])

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

  /*
   * Scroll hacia una sección dejando
   * visible el título debajo del header.
   */
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

  /*
   * Al soltar la cápsula,
   * calculamos cuál de los 4 botones
   * está más cerca y la ajustamos ahí.
   */
  const snapCapsule = () => {
    if (!itemWidth) return

    const maxX =
      itemWidth * 3

    const currentX =
      clamp(
        capsuleX.get(),
        0,
        maxX
      )

    const nearestIndex =
      clamp(
        Math.round(
          currentX / itemWidth
        ),
        0,
        3
      )

    const destination =
      nearestIndex *
      itemWidth

    setIsDragging(false)

    animate(
      capsuleX,
      destination,
      reduceMotion
        ? {
            duration: 0,
          }
        : {
            type: "spring",
            stiffness: 320,
            damping: 26,
            mass: 0.7,
          }
    )

    const id =
      sectionIds[nearestIndex]

    scrollToSection(id)
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
      <nav
        className={navbarClasses}
      >
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
              {desktopLinks.map(
                (link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(
                      event
                    ) => {
                      event.preventDefault()

                      scrollToSection(
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

            <div className="flex items-center space-x-4">

              <button
                type="button"
                onClick={
                  toggleLanguage
                }
                className="
                  px-2
                  py-1
                  rounded-md
                  hover:bg-gray-100/50
                  dark:hover:bg-gray-800/50
                  transition-colors
                "
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
              onClick={
                toggleLanguage
              }
              className="
                px-3
                py-2
                rounded-full
                bg-white/25
                dark:bg-black/10
                backdrop-blur-md
              "
            >
              {language === "es"
                ? "EN"
                : "ES"}
            </button>

            <button
              type="button"
              onClick={
                toggleTheme
              }
              className="
                p-2.5
                rounded-full
                bg-white/25
                dark:bg-black/10
                backdrop-blur-md
              "
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

      {/* NAV MOBILE */}
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
          ref={trackRef}
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

          {/* CÁPSULA ARRASTRABLE */}
          {itemWidth > 0 && (
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
                overflow-hidden
                z-20
                cursor-grab
                active:cursor-grabbing
              "
              style={{
                width: itemWidth,
                x: capsuleX,
                touchAction: "none",
              }}
              animate={{
                scale:
                  isDragging
                    ? 1.045
                    : 1,
              }}
              transition={{
                scale: {
                  type: "spring",
                  stiffness: 350,
                  damping: 24,
                },
              }}
              onPanStart={() => {
                setIsDragging(true)
              }}
              onPan={(
                _event,
                info
              ) => {
                const maxX =
                  itemWidth * 3

                const nextX =
                  clamp(
                    capsuleX.get() +
                      info.delta.x,
                    0,
                    maxX
                  )

                capsuleX.set(
                  nextX
                )
              }}
              onPanEnd={() => {
                snapCapsule()
              }}
            >

              {/* VIDRIO */}
              <div
                className="
                  absolute
                  inset-0
                  rounded-[27px]
                  bg-gradient-to-b
                  from-white/30
                  via-white/8
                  to-transparent
                  pointer-events-none
                "
              />

              {/* BRILLO SUPERIOR */}
              <div
                className="
                  absolute
                  top-[1px]
                  left-[16%]
                  right-[16%]
                  h-[1px]
                  bg-white/95
                  rounded-full
                  pointer-events-none
                "
              />

              {/* REFLEJO IZQUIERDO */}
              <div
                className="
                  absolute
                  left-[2px]
                  top-[18%]
                  bottom-[18%]
                  w-[1px]
                  bg-white/60
                  rounded-full
                  pointer-events-none
                "
              />

            </motion.div>
          )}

          {/* BOTONES MOBILE */}
          {mobileLinks.map(
            (item, index) => {
              const Icon =
                item.icon

              const active =
                activeIndex ===
                index

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    scrollToSection(
                      item.id
                    )
                  }}
                  className="
                    relative
                    z-30
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
                  aria-label={
                    item.label
                  }
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
                    className="
                      relative
                      pointer-events-none
                    "
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
                      pointer-events-none
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

                </button>
              )
            }
          )}

        </div>
      </div>
    </>
  )
}