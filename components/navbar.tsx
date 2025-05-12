"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Moon, Sun } from "lucide-react"
import { useLanguage } from "./language-provider"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es")
  }

  const navbarClasses = `fixed w-full z-40 transition-all duration-300 ${
    scrolled ? "bg-[#B8D8D8]/90 dark:bg-[#004E64]/90 backdrop-blur-sm shadow-sm" : "bg-transparent"
  }`

  const navLinks = [
    { href: "#home", label: t("home") },
    { href: "#services", label: t("services") },
    { href: "#portfolio", label: t("portfolio") },
    { href: "#contact-us", label: t("contactUs") },
  ]

  const logoUrl = "https://i.postimg.cc/pLSPM0KB/logo-Clover-Digital.png"

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="#home" className="relative h-12 w-12 z-50">
          <Image
            src={logoUrl || "/placeholder.svg"}
            alt="Clover Digital"
            width={48}
            height={48}
            className="object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-200 hover:text-[#0A9396] dark:hover:text-[#0A9396] transition-colors"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={language === "es" ? "Switch to English" : "Cambiar a Español"}
            >
              {language === "es" ? "EN" : "ES"}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-4 md:hidden">
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={language === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            {language === "es" ? "EN" : "ES"}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-50"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[#B8D8D8] dark:bg-[#004E64] z-40 flex flex-col items-center justify-center"
            >
              <div className="flex flex-col items-center space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xl font-medium text-gray-700 dark:text-gray-200 hover:text-[#0A9396] dark:hover:text-[#0A9396] transition-colors"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
