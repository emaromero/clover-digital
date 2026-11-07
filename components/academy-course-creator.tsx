"use client"

import {
  useMemo,
  useState,
} from "react"

import { useRouter } from "next/navigation"

import {
  Check,
  GraduationCap,
  Loader2,
  Plus,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Props {
  existingSlugs: string[]
}

function createSlug(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
}

function getUniqueSlug(
  title: string,
  existingSlugs: string[]
) {
  const base =
    createSlug(title) ||
    "curso"

  if (
    !existingSlugs.includes(
      base
    )
  ) {
    return base
  }

  let number = 2

  while (
    existingSlugs.includes(
      `${base}-${number}`
    )
  ) {
    number += 1
  }

  return `${base}-${number}`
}

export default function AcademyCourseCreator({
  existingSlugs,
}: Props) {
  const router =
    useRouter()

  const [
    open,
    setOpen,
  ] =
    useState(false)

  const [
    title,
    setTitle,
  ] =
    useState("")

  const [
    description,
    setDescription,
  ] =
    useState("")

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    created,
    setCreated,
  ] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("")

  const slug =
    useMemo(
      () =>
        getUniqueSlug(
          title,
          existingSlugs
        ),
      [
        title,
        existingSlugs,
      ]
    )

  const createCourse =
    async () => {
      if (
        !title.trim()
      ) {
        return
      }

      setLoading(true)
      setCreated(false)
      setErrorMessage("")

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from("courses")
          .insert({
            title:
              title.trim(),

            description:
              description.trim() ||
              null,

            slug,

            cover_url:
              null,
          })

      if (error) {
        console.error(
          "Error creando curso:",
          error
        )

        if (
          error.code ===
          "23505"
        ) {
          setErrorMessage(
            "Ya existe un curso con ese identificador."
          )
        } else {
          setErrorMessage(
            "No pudimos crear el curso."
          )
        }

        setLoading(false)

        return
      }

      setLoading(false)
      setCreated(true)

      setTitle("")
      setDescription("")

      router.refresh()

      window.setTimeout(
        () => {
          setCreated(false)
          setOpen(false)
        },
        1400
      )
    }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001219]"
      >
        <Plus className="h-4 w-4" />
        Crear nuevo curso
      </button>
    )
  }

  return (
    <div className="rounded-3xl border border-[#0A9396]/20 bg-[#0A9396]/5 p-5 dark:bg-[#0A9396]/10 md:p-6">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396]">
          <GraduationCap className="h-5 w-5" />
        </div>

        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">
            Nuevo curso
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Después vas a poder agregar portada, módulos y clases desde Gestionar contenido.
          </p>
        </div>

      </div>

      <div className="mt-5 grid gap-4">

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Nombre
          </label>

          <input
            value={title}
            onChange={(
              event
            ) =>
              setTitle(
                event.target.value
              )
            }
            placeholder="Ej: Video inmobiliario con celular"
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Descripción
          </label>

          <textarea
            rows={4}
            value={
              description
            }
            onChange={(
              event
            ) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="Descripción general del curso"
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 leading-6 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Slug generado automáticamente
          </label>

          <div className="mt-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 dark:border-white/10 dark:bg-[#001219]">
            {slug}
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Se genera a partir del nombre y no hace falta editarlo.
          </p>
        </div>

      </div>

      {errorMessage && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">

        <button
          type="button"
          disabled={
            loading ||
            !title.trim()
          }
          onClick={
            createCourse
          }
          className="inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : created ? (
            <Check className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}

          {loading
            ? "Creando..."
            : created
              ? "Curso creado"
              : "Crear curso"}
        </button>

        <button
          type="button"
          disabled={
            loading
          }
          onClick={() => {
            setOpen(false)
            setTitle("")
            setDescription("")
            setErrorMessage("")
          }}
          className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5"
        >
          Cancelar
        </button>

      </div>

    </div>
  )
}