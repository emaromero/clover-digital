"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  Check,
  Loader2,
  Save,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
}

interface Props {
  courses: Course[]
}

export default function AcademyCourseSettings({
  courses,
}: Props) {
  const router = useRouter()

  const [
    selectedCourseId,
    setSelectedCourseId,
  ] = useState(
    courses[0]?.id || ""
  )

  const selectedCourse =
    courses.find(
      (course) =>
        course.id ===
        selectedCourseId
    ) ||
    courses[0] ||
    null

  const [
    title,
    setTitle,
  ] = useState(
    selectedCourse?.title || ""
  )

  const [
    description,
    setDescription,
  ] = useState(
    selectedCourse?.description || ""
  )

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    saved,
    setSaved,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("")

  useEffect(() => {
    if (!selectedCourse) {
      return
    }

    setTitle(
      selectedCourse.title
    )

    setDescription(
      selectedCourse.description ||
        ""
    )

    setErrorMessage("")
    setSaved(false)
  }, [
    selectedCourseId,
    selectedCourse,
  ])

  const saveCourse =
    async () => {
      if (
        !selectedCourse ||
        !title.trim()
      ) {
        return
      }

      setLoading(true)
      setSaved(false)
      setErrorMessage("")

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from("courses")
          .update({
            title:
              title.trim(),

            description:
              description.trim() ||
              null,
          })
          .eq(
            "id",
            selectedCourse.id
          )

      if (error) {
        console.error(
          "Error guardando curso:",
          error
        )

        setErrorMessage(
          "No pudimos guardar los cambios del curso."
        )

        setLoading(false)

        return
      }

      setLoading(false)
      setSaved(true)

      router.refresh()

      window.setTimeout(
        () => {
          setSaved(false)
        },
        1800
      )
    }

  if (
    courses.length === 0
  ) {
    return (
      <p className="text-sm text-gray-500">
        Todavía no hay cursos disponibles.
      </p>
    )
  }

  return (
    <div>
      <div className="grid gap-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Curso
          </label>

          <select
            value={
              selectedCourse?.id ||
              ""
            }
            onChange={(
              event
            ) =>
              setSelectedCourseId(
                event.target.value
              )
            }
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
          >
            {courses.map(
              (course) => (
                <option
                  key={
                    course.id
                  }
                  value={
                    course.id
                  }
                >
                  {
                    course.title
                  }
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Nombre del curso
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
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
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
            Slug
          </label>

          <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-white/10 dark:bg-white/[0.03]">
            {
              selectedCourse?.slug
            }
          </div>

          <p className="mt-2 text-xs leading-5 text-gray-400">
            El slug identifica internamente al curso. Lo dejamos bloqueado para evitar romper enlaces o relaciones existentes.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        disabled={
          loading ||
          !title.trim()
        }
        onClick={
          saveCourse
        }
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4" />
        ) : (
          <Save className="h-4 w-4" />
        )}

        {loading
          ? "Guardando..."
          : saved
            ? "Guardado"
            : "Guardar información"}
      </button>
    </div>
  )
}