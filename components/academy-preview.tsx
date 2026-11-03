"use client"

import { FormEvent, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useLanguage } from "./language-provider"
import { trackEvent } from "@/lib/analytics"

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export default function AcademyPreview() {
  const { language } = useLanguage()
  const reduceMotion = useReducedMotion()

  const [email, setEmail] = useState("")

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "duplicate" | "error"
  >("idle")

  const copy =
    language === "es"
      ? {
          eyebrow: "Clover Academy",
          title: "Fotografía inmobiliaria con celular",
          description:
            "Aprendé a mejorar la presentación de tus propiedades usando tu teléfono: fotografía, video, edición y preparación de ambientes.",
          badge: "Próximamente",
          note: "Estamos puliendo los últimos detalles.",
          item1: "Fotografía inmobiliaria",
          item2: "Video para propiedades",
          item3: "Edición desde el celular",
          item4: "Preparación y presentación de ambientes",
          placeholder: "Tu email",
          button: "Avisarme cuando esté listo",
          loading: "Guardando...",
          privacy:
            "Te avisamos cuando abramos las inscripciones. Sin spam.",
          success:
            "¡Listo! Te avisamos cuando Clover Academy esté disponible.",
          duplicate:
            "Este email ya está anotado. Te avisaremos cuando abramos las inscripciones.",
          error:
            "No pudimos registrar tu email. Probá nuevamente en unos minutos.",
        }
      : {
          eyebrow: "Clover Academy",
          title: "Real estate photography with your phone",
          description:
            "Learn how to improve the presentation of your properties using your phone: photography, video, editing and property preparation.",
          badge: "Coming soon",
          note: "We're putting the finishing touches on it.",
          item1: "Real estate photography",
          item2: "Property video",
          item3: "Mobile editing",
          item4: "Property preparation and presentation",
          placeholder: "Your email",
          button: "Notify me when it's ready",
          loading: "Saving...",
          privacy:
            "We'll let you know when enrollment opens. No spam.",
          success:
            "You're on the list! We'll let you know when Clover Academy is available.",
          duplicate:
            "This email is already on the list. We'll let you know when enrollment opens.",
          error:
            "We couldn't register your email. Please try again in a few minutes.",
        }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setStatus("error")
      return
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      setStatus("error")
      return
    }

    setStatus("loading")

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/academy_waitlist`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            email: cleanEmail,
            source: "clover-academy",
          }),
        }
      )

      if (response.ok) {
        trackEvent("academy_waitlist_signup", {
          source: "homepage",
        })

        setStatus("success")
        setEmail("")
        return
      }

      if (response.status === 409) {
        setStatus("duplicate")
        return
      }

      setStatus("error")
    } catch {
      setStatus("error")
    }
  }

  const items = [
    copy.item1,
    copy.item2,
    copy.item3,
    copy.item4,
  ]

  return (
    <section
      id="academy"
      className="py-20 md:py-28 bg-white dark:bg-[#001219]"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 34,
                  scale: 0.985,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.15,
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-[#001219] text-white p-8 md:p-12"
        >
          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    scale: 0.7,
                  }
            }
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 1,
              delay: 0.15,
            }}
            className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#0e5c6e]/20 blur-3xl"
          />

          <div className="relative grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: -22,
                    }
              }
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.65,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5fb8cc]">
                  {copy.eyebrow}
                </p>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
                  {copy.badge}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {copy.title}
              </h2>

              <p className="text-white/75 max-w-2xl leading-relaxed">
                {copy.description}
              </p>

              <p className="mt-5 text-sm font-medium text-[#5fb8cc]">
                {copy.note}
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-8 max-w-xl"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)

                      if (status !== "idle") {
                        setStatus("idle")
                      }
                    }}
                    placeholder={copy.placeholder}
                    required
                    disabled={status === "loading"}
                    className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-white/45 outline-none transition-all duration-200 focus:border-[#5fb8cc] focus:ring-2 focus:ring-[#5fb8cc]/20 focus:bg-white/15 disabled:opacity-60"
                  />

                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : {
                            y: -2,
                            scale: 1.015,
                          }
                    }
                    whileTap={
                      reduceMotion
                        ? undefined
                        : {
                            scale: 0.98,
                          }
                    }
                    className="shrink-0 rounded-xl bg-white text-[#001219] hover:bg-gray-100 font-semibold px-6 py-3 transition-colors shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "loading"
                      ? copy.loading
                      : copy.button}

                    {status !== "loading" && (
                      <span className="ml-2" aria-hidden="true">
                        →
                      </span>
                    )}
                  </motion.button>
                </div>

                <div
                  className="mt-3 min-h-[24px] text-sm"
                  aria-live="polite"
                >
                  {status === "success" && (
                    <p className="text-emerald-300">
                      {copy.success}
                    </p>
                  )}

                  {status === "duplicate" && (
                    <p className="text-[#5fb8cc]">
                      {copy.duplicate}
                    </p>
                  )}

                  {status === "error" && (
                    <p className="text-red-300">
                      {copy.error}
                    </p>
                  )}

                  {status === "idle" && (
                    <p className="text-white/50">
                      {copy.privacy}
                    </p>
                  )}
                </div>
              </form>
            </motion.div>

            <div className="grid gap-3">
              {items.map((item, index) => (
                <motion.div
                  key={item}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          x: 24,
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.18 + index * 0.09,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          x: 4,
                        }
                  }
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition-colors hover:bg-white/10"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0e5c6e] text-sm font-bold">
                    {index + 1}
                  </span>

                  <span className="font-medium">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
