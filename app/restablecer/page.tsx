"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function RestablecerPage() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    setMessage("")

    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setMessage("No pudimos actualizar la contraseña.")
      setLoading(false)
      return
    }

    setMessage("Contraseña actualizada correctamente.")

    setTimeout(() => {
      router.push("/cuenta")
      router.refresh()
    }, 1200)
  }

  return (
    <main className="min-h-screen bg-[#B8D8D8]/30 dark:bg-[#001219] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-7 md:p-8 shadow-xl">

        <div className="text-center mb-8">
          <p className="text-sm font-medium text-[#0A9396] mb-2">
            Clover Academy
          </p>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nueva contraseña
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
              Nueva contraseña
            </label>

            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-[#001219] px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
              Repetir contraseña
            </label>

            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-[#001219] px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396]"
            />
          </div>

          {message && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0e5c6e] hover:bg-[#001219] text-white font-medium px-4 py-3 transition-colors disabled:opacity-60"
          >
            {loading
              ? "Actualizando..."
              : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </main>
  )
}