"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface ProfileFormProps {
  userId: string
  initialName: string
  email: string
  initialAvatar: string | null
  initialPhone: string
}

export default function ProfileForm({
  userId,
  initialName,
  email,
  initialAvatar,
  initialPhone,
}: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()

    setSaving(true)
    setMessage("")

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName,
        email,
        avatar_url: initialAvatar,
        phone,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      setMessage("No se pudo guardar el perfil.")
      setSaving(false)
      return
    }

    setMessage("Perfil guardado correctamente.")
    setSaving(false)
    router.refresh()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-white/10 pt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Tus datos
      </h2>

      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Completá tu perfil para usar Clover Academy.
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200"
          >
            Nombre y apellido
          </label>

          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              dark:border-white/15
              bg-white
              dark:bg-[#001219]
              px-4
              py-3
              outline-none
              focus:ring-2
              focus:ring-[#0A9396]
            "
          />
        </div>

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
            value={email}
            disabled
            className="
              w-full
              rounded-xl
              border
              border-gray-200
              dark:border-white/10
              bg-gray-100
              dark:bg-white/5
              px-4
              py-3
              text-gray-500
              cursor-not-allowed
            "
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200"
          >
            Teléfono
          </label>

          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+54 9 11 ..."
            autoComplete="tel"
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              dark:border-white/15
              bg-white
              dark:bg-[#001219]
              px-4
              py-3
              outline-none
              focus:ring-2
              focus:ring-[#0A9396]
            "
          />
        </div>

        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="
              rounded-xl
              bg-[#0e5c6e]
              hover:bg-[#001219]
              text-white
              font-medium
              px-5
              py-3
              transition-colors
              disabled:opacity-60
            "
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="
              rounded-xl
              border
              border-gray-300
              dark:border-white/15
              px-5
              py-3
              font-medium
              text-gray-700
              dark:text-gray-200
              hover:bg-gray-50
              dark:hover:bg-white/5
              transition-colors
            "
          >
            Cerrar sesión
          </button>
        </div>
      </form>
    </div>
  )
}