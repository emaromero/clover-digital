
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function getSafeNext() {
  const params = new URLSearchParams(window.location.search)
  const next = params.get("next")

  if (
    next &&
    next.startsWith("/compartida/") &&
    !next.startsWith("//")
  ) {
    return next
  }

  return "/cuenta"
}

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleGoogle = async () => {
    setLoading(true)
    setMessage("")

    const next = getSafeNext()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      setMessage("No se pudo continuar con Google.")
      setLoading(false)
    }
  }

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()

    setLoading(true)
    setMessage("")

    const next = getSafeNext()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo:
          `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage(
      "Cuenta creada. Revisá tu email para confirmar el registro."
    )

    setLoading(false)

    window.setTimeout(() => {
      router.push(
        `/ingresar?next=${encodeURIComponent(next)}`
      )
    }, 2500)
  }

  return (
    <main className="min-h-screen bg-[#B8D8D8]/30 flex items-center justify-center px-4 py-16 dark:bg-[#001219]">
      <div className="w-full max-w-md rounded-3xl border border-gray-200/70 bg-white p-7 shadow-xl dark:border-white/10 dark:bg-[#06222c] md:p-8">

        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium text-[#0A9396]">
            Clover Digital
          </p>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Crear cuenta
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            Registrate para acceder a tus producciones, entregas y Clover Academy.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M21.6 12.227c0-.71-.064-1.391-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.509h3.227c1.89-1.741 2.986-4.305 2.986-7.35Z"
            />
            <path
              fill="#34A853"
              d="M12 22c2.7 0 4.964-.895 6.614-2.423l-3.227-2.509c-.895.6-2.041.955-3.387.955-2.605 0-4.81-1.76-5.6-4.123H3.064v2.586A9.997 9.997 0 0 0 12 22Z"
            />
            <path
              fill="#FBBC05"
              d="M6.4 13.9A6.01 6.01 0 0 1 6.086 12c0-.66.114-1.3.314-1.9V7.514H3.064A10.001 10.001 0 0 0 2 12c0 1.614.386 3.141 1.064 4.486L6.4 13.9Z"
            />
            <path
              fill="#EA4335"
              d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.864-2.864C16.96 2.995 14.7 2 12 2a9.997 9.997 0 0 0-8.936 5.514L6.4 10.1c.79-2.364 2.995-4.123 5.6-4.123Z"
            />
          </svg>

          Registrarme con Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
          <span className="text-xs text-gray-500">o</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Nombre y apellido
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
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
            className="w-full rounded-xl bg-[#0e5c6e] px-4 py-3 font-medium text-white transition-colors hover:bg-[#001219] disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          ¿Ya tenés cuenta?{" "}
          <Link
  href="/ingresar"
  onClick={(event) => {
    event.preventDefault()
    router.push(
      `/ingresar?next=${encodeURIComponent(getSafeNext())}`
    )
  }}
  className="font-medium text-[#0A9396] hover:underline"
>
  Ingresar
</Link>        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 transition-colors hover:text-[#0A9396]"
          >
            ← Volver a Clover Digital
          </Link>
        </div>
      </div>
    </main>
  )
}
