"use client"

import {
  useState,
} from "react"

import {
  CheckCircle2,
  Loader2,
} from "lucide-react"

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
  const router =
    useRouter()

  const [
    fullName,
    setFullName,
  ] =
    useState(
      initialName
    )

  const [
    phone,
    setPhone,
  ] =
    useState(
      initialPhone
    )

  const [
    saving,
    setSaving,
  ] =
    useState(false)

  const [
    success,
    setSuccess,
  ] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("")

  const handleSave =
    async (
      event: React.FormEvent
    ) => {
      event.preventDefault()

      if (
        !fullName.trim()
      ) {
        setErrorMessage(
          "Ingresá tu nombre y apellido."
        )

        return
      }

      setSaving(true)
      setSuccess(false)
      setErrorMessage("")

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from("profiles")
          .upsert({
            id:
              userId,

            full_name:
              fullName.trim(),

            email,

            avatar_url:
              initialAvatar,

            phone:
              phone.trim() ||
              null,

            updated_at:
              new Date().toISOString(),
          })

      if (error) {
        console.error(
          "Error guardando perfil:",
          error
        )

        setErrorMessage(
          "No pudimos guardar los cambios."
        )

        setSaving(false)

        return
      }

      setSaving(false)
      setSuccess(true)

      router.refresh()

      window.setTimeout(
        () => {
          setSuccess(false)
        },
        2000
      )
    }

  return (
    <form
      onSubmit={
        handleSave
      }
      className="mt-8 space-y-5"
    >

      <div>

        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Nombre y apellido
        </label>

        <input
          id="fullName"
          type="text"
          value={
            fullName
          }
          onChange={(
            event
          ) =>
            setFullName(
              event.target.value
            )
          }
          autoComplete="name"
          className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#0A9396] focus:ring-2 focus:ring-[#0A9396]/20 dark:border-white/15 dark:bg-[#001219]"
        />

      </div>

      <div>

        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={
            email
          }
          disabled
          className="mt-2 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
        />

        <p className="mt-2 text-xs text-gray-400">
          El email de acceso no se puede modificar desde acá.
        </p>

      </div>

      <div>

        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Teléfono
        </label>

        <input
          id="phone"
          type="tel"
          value={
            phone
          }
          onChange={(
            event
          ) =>
            setPhone(
              event.target.value
            )
          }
          placeholder="+54 9 11 ..."
          autoComplete="tel"
          className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#0A9396] focus:ring-2 focus:ring-[#0A9396]/20 dark:border-white/15 dark:bg-[#001219]"
        />

      </div>

      {errorMessage && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {
            errorMessage
          }
        </p>
      )}

      {success && (
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">

          <CheckCircle2 className="h-4 w-4" />

          Cambios guardados correctamente.

        </div>
      )}

      <button
        type="submit"
        disabled={
          saving ||
          !fullName.trim()
        }
        className="inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50"
      >

        {saving && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}

        {saving
          ? "Guardando..."
          : "Guardar cambios"}

      </button>

    </form>
  )
}