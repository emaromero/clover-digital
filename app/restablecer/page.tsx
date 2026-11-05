"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function RestablecerPage() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const passwordHasMinLength = password.length >= 8
  const passwordHasNumber = /\d/.test(password)
  const passwordHasSpecial = /[^A-Za-z0-9]/.test(password)

  const passwordIsValid =
    passwordHasMinLength &&
    passwordHasNumber &&
    passwordHasSpecial

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!passwordIsValid) {
      setMessage(
        "La contraseña debe tener al menos 8 caracteres, 1 número y 1 carácter especial."
      )
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
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200"
            >
              Nueva contraseña
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-[#001219] px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#0A9396]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-[#0A9396]"
                aria-label={
                  showPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <p
                className={
                  passwordHasMinLength
                    ? "text-[#0A9396]"
                    : "text-gray-500 dark:text-gray-400"
                }
              >
                • Mínimo 8 caracteres
              </p>

              <p
                className={
                  passwordHasNumber
                    ? "text-[#0A9396]"
                    : "text-gray-500 dark:text-gray-400"
                }
              >
                • Al menos 1 número
              </p>

              <p
                className={
                  passwordHasSpecial
                    ? "text-[#0A9396]"
                    : "text-gray-500 dark:text-gray-400"
                }
              >
                • Al menos 1 carácter especial
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200"
            >
              Repetir contraseña
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-[#001219] px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#0A9396]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-[#0A9396]"
                aria-label={
                  showConfirmPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes("correctamente")
                  ? "text-[#0A9396]"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
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