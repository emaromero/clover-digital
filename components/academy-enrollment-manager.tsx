"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  CheckCircle2,
  GraduationCap,
  Loader2,
  Trash2,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Course {
  id: string
  title: string
}

interface ActiveEnrollment {
  id: string
  course_id: string
  course_title: string
}

interface Props {
  userId: string
  courses: Course[]
  activeEnrollment?: ActiveEnrollment | null
}

export default function AcademyEnrollmentManager({
  userId,
  courses,
  activeEnrollment,
}: Props) {
  const router =
    useRouter()

  const [
    selectedCourse,
    setSelectedCourse,
  ] =
    useState(
      activeEnrollment?.course_id ||
        courses[0]?.id ||
        ""
    )

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    message,
    setMessage,
  ] =
    useState("")

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("")

  const assignCourse =
    async () => {
      if (
        !selectedCourse ||
        activeEnrollment
      ) {
        return
      }

      setLoading(true)
      setMessage("")
      setErrorMessage("")

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from(
            "enrollments"
          )
          .insert({
            user_id:
              userId,
            course_id:
              selectedCourse,
            status:
              "active",
            enrolled_at:
              new Date().toISOString(),
          })

      if (error) {
        console.error(
          "Error asignando curso:",
          error
        )

        setErrorMessage(
          "No pudimos asignar el curso."
        )

        setLoading(
          false
        )

        return
      }

      setMessage(
        "Curso asignado correctamente."
      )

      setLoading(
        false
      )

      router.refresh()
    }

  const removeCourse =
    async () => {
      if (
        !activeEnrollment
      ) {
        return
      }

      const confirmed =
        window.confirm(
          `¿Querés quitar el acceso a "${activeEnrollment.course_title}"? El progreso del alumno no se eliminará.`
        )

      if (!confirmed) {
        return
      }

      setLoading(true)
      setMessage("")
      setErrorMessage("")

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from(
            "enrollments"
          )
          .delete()
          .eq(
            "id",
            activeEnrollment.id
          )

      if (error) {
        console.error(
          "Error quitando curso:",
          error
        )

        setErrorMessage(
          "No pudimos quitar el acceso."
        )

        setLoading(
          false
        )

        return
      }

      setMessage(
        "Acceso quitado correctamente."
      )

      setLoading(
        false
      )

      router.refresh()
    }

  if (
    courses.length ===
    0
  ) {
    return (
      <p className="text-sm text-gray-400">
        Todavía no hay cursos disponibles.
      </p>
    )
  }

  return (
    <div>

      {activeEnrollment ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">

          <div className="flex items-start gap-3">

            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" />

            <div className="min-w-0 flex-1">

              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                Acceso activo
              </p>

              <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                {
                  activeEnrollment.course_title
                }
              </p>

            </div>

          </div>

          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              removeCourse
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-500/20 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10"
          >

            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}

            Quitar acceso

          </button>

        </div>
      ) : (
        <div>

          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Asignar curso
          </label>

          <select
            value={
              selectedCourse
            }
            onChange={(
              event
            ) =>
              setSelectedCourse(
                event.target.value
              )
            }
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
          >

            {courses.map(
              (
                course
              ) => (
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

          <button
            type="button"
            disabled={
              loading ||
              !selectedCourse
            }
            onClick={
              assignCourse
            }
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50"
          >

            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GraduationCap className="h-4 w-4" />
            )}

            Dar acceso

          </button>

        </div>
      )}

      {message && (
        <p className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-300">
          {
            message
          }
        </p>
      )}

      {errorMessage && (
        <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">
          {
            errorMessage
          }
        </p>
      )}

    </div>
  )
}