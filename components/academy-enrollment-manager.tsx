"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { useRouter } from "next/navigation"

import {
  CheckCircle2,
  GraduationCap,
  Loader2,
  Plus,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Course {
  id: string
  title: string
}

interface Enrollment {
  id: string
  course_id: string
  course_title: string
  status?: string
}

interface Props {
  userId: string
  courses: Course[]
  enrollments: Enrollment[]
}

export default function AcademyEnrollmentManager({
  userId,
  courses,
  enrollments,
}: Props) {
  const router =
    useRouter()

  const [
    localEnrollments,
    setLocalEnrollments,
  ] =
    useState<Enrollment[]>(
      enrollments
    )

  const [
    selectedCourse,
    setSelectedCourse,
  ] =
    useState("")

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

  useEffect(
    () => {
      setLocalEnrollments(
        enrollments
      )
    },
    [
      enrollments,
    ]
  )

  /*
   * Un curso ya asignado no vuelve
   * a aparecer entre las opciones.
   *
   * El acceso es permanente.
   */
  const availableCourses =
    useMemo(
      () =>
        courses.filter(
          (course) =>
            !localEnrollments.some(
              (enrollment) =>
                enrollment.course_id ===
                course.id
            )
        ),
      [
        courses,
        localEnrollments,
      ]
    )

  useEffect(
    () => {
      const stillAvailable =
        availableCourses.some(
          (course) =>
            course.id ===
            selectedCourse
        )

      if (
        !stillAvailable
      ) {
        setSelectedCourse(
          availableCourses[0]?.id ||
            ""
        )
      }
    },
    [
      availableCourses,
      selectedCourse,
    ]
  )

  const assignCourse =
    async () => {
      if (
        !selectedCourse
      ) {
        return
      }

      const selected =
        courses.find(
          (course) =>
            course.id ===
            selectedCourse
        )

      if (!selected) {
        return
      }

      setLoading(true)
      setMessage("")
      setErrorMessage("")

      const supabase =
        createClient()

      /*
       * Primero verificamos que no exista
       * ya una inscripción histórica.
       *
       * Si existiera por algún dato viejo,
       * la dejamos activa nuevamente.
       */
      const {
        data: existingEnrollment,
        error: existingError,
      } =
        await supabase
          .from(
            "enrollments"
          )
          .select(
            "id, course_id, status"
          )
          .eq(
            "user_id",
            userId
          )
          .eq(
            "course_id",
            selectedCourse
          )
          .maybeSingle()

      if (existingError) {
        console.error(
          "Error verificando inscripción:",
          existingError
        )

        setErrorMessage(
          "No pudimos verificar el acceso al curso."
        )

        setLoading(false)

        return
      }

      if (
        existingEnrollment
      ) {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              "enrollments"
            )
            .update({
              status:
                "active",
            })
            .eq(
              "id",
              existingEnrollment.id
            )
            .select(
              "id, course_id, status"
            )
            .single()

        if (
          error ||
          !data
        ) {
          console.error(
            "Error restaurando inscripción:",
            error
          )

          setErrorMessage(
            "No pudimos asignar el curso."
          )

          setLoading(false)

          return
        }

        setLocalEnrollments(
          (current) => [
            ...current.filter(
              (item) =>
                item.id !==
                data.id
            ),
            {
              id:
                data.id,

              course_id:
                data.course_id,

              course_title:
                selected.title,

              status:
                "active",
            },
          ]
        )
      } else {
        const {
          data,
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
            .select(
              "id, course_id, status"
            )
            .single()

        if (
          error ||
          !data
        ) {
          console.error(
            "Error asignando curso:",
            error
          )

          setErrorMessage(
            "No pudimos asignar el curso."
          )

          setLoading(false)

          return
        }

        setLocalEnrollments(
          (current) => [
            ...current,
            {
              id:
                data.id,

              course_id:
                data.course_id,

              course_title:
                selected.title,

              status:
                "active",
            },
          ]
        )
      }

      setMessage(
        "Curso asignado correctamente. El acceso es permanente."
      )

      setLoading(false)

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

      {/* CURSOS ASIGNADOS */}
      {localEnrollments.length >
        0 && (
        <div className="space-y-2">

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Cursos asignados
          </p>

          {localEnrollments.map(
            (
              enrollment
            ) => (
              <div
                key={
                  enrollment.id
                }
                className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10"
              >

                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {
                      enrollment.course_title
                    }
                  </p>

                  <p className="mt-0.5 text-xs text-emerald-700/70 dark:text-emerald-300/70">
                    Acceso permanente
                  </p>

                </div>

              </div>
            )
          )}

        </div>
      )}

      {/* AGREGAR CURSO */}
      {availableCourses.length >
      0 ? (
        <div
          className={
            localEnrollments.length >
            0
              ? "mt-4 border-t border-gray-100 pt-4 dark:border-white/10"
              : ""
          }
        >

          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Agregar curso
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

            {availableCourses.map(
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
              <Plus className="h-4 w-4" />
            )}

            Agregar acceso

          </button>

        </div>
      ) : (
        <div className="mt-4">

          <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <GraduationCap className="h-4 w-4" />

            Tiene todos los cursos disponibles
          </div>

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