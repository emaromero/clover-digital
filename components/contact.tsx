"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useLanguage } from "./language-provider"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(null)

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { t, language } = useLanguage()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Log the form data (in a real app, this would be sent to an email service)
      console.log("Form submitted:", formData)

      // Reset form
      setFormData({ name: "", email: "", message: "" })
      setSubmitStatus("success")

      // Reset status after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null)
      }, 3000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitStatus("error")

      // Reset status after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null)
      }, 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact-us" className="py-16 md:py-24 bg-contact-bg dark:bg-[#001219]">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-800 dark:text-white">
              {language === "en" ? "Contact Us" : "Contáctanos"}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {language === "en"
                ? "Do you have a project in mind? Contact us and let's make it happen together."
                : "¿Tienes un proyecto en mente? Contáctanos y hagámoslo realidad juntos."}
            </p>
          </div>

          <form
            action="https://formsubmit.co/cloverdigitalarg@gmail.com"
            method="POST"
            className="bg-white dark:bg-[#001219] rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-8"
          >
            {/* FormSubmit configuration */}
            <input type="hidden" name="_subject" value="Nuevo contacto desde la web" />
            <input type="hidden" name="_captcha" value="true" />
            <input type="hidden" name="_next" value="https://cloverdigital.vercel.app/gracias" />
            <input type="text" name="_honey" style={{ display: "none" }} />

            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                {t("contact-name")}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A9396] dark:bg-gray-800 dark:text-white"
                aria-label={t("contact-name")}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                {t("contact-email")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A9396] dark:bg-gray-800 dark:text-white"
                aria-label={t("contact-email")}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="phone" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                {language === "en" ? "Phone" : "Teléfono"}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A9396] dark:bg-gray-800 dark:text-white"
                aria-label={language === "en" ? "Phone" : "Teléfono"}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                {t("contact-message")}
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A9396] dark:bg-gray-800 dark:text-white"
                aria-label={t("contact-message")}
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-[#0A9396] hover:bg-[#005F73] text-white font-medium py-3 px-8 rounded-md transition-colors"
              >
                {t("contact-submit")}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  )
}