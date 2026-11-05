"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function RecuperarPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    setLoading(true)
    setMessage("")

    const supabase = createClient()

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/restablecer`,
      })

    if (error) {
      setMessage("No pudimos enviar el email. Intentá nuevamente.")
      setLoading(false)
      return
    }

    setSuccess(true)
    setMessage(
      "Te enviamos un email con un enlace para crear una nueva contraseña."
    )
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#B8D8D8]/30 dark:bg-[#001219] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-7 md:p-8 shadow-xl">

        <div className="text-center mb-8">
          <p className="text-sm font-medium text-[#0A9396] mb-2">
            Clover Academy
          </p>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Recuperar contraseña
          </h1>

          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Ingresá el email con el que creaste tu cuenta.
          </p>
        </div>

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-[#001219] px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0e5c6e] hover:bg-[#001219] text-white font-medium px-4 py-3 transition-colors disabled:opacity-60"
            >
              {loading
                ? "Enviando..."
                : "Enviar enlace de recuperación"}
            </button>
          </form>
        )}

        {message && (
          <p className="mt-5 text-sm text-center text-gray-600 dark:text-gray-300">
            {message}
          </p>
        )}

        <div className="mt-7 text-center">
          <Link
            href="/ingresar"
            className="text-sm text-[#0A9396] hover:underline"
          >
            ← Volver a ingresar
          </Link>
        </div>
      </div>
    </main>
  )
}