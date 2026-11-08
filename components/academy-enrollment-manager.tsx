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
  Power,
  PowerOff,
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
  status: string
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
    loadingKey,
    setLoadingKey,
  ] =
    useState<string | null>(
      null
    )

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

  const activeEnrollments =
    useMemo(
      () =>
        localEnrollments.filter(
          (enrollment) =>
            enrollment.status ===
            "active"
        ),
      [
        localEnrollments,
      ]
    )

  const inactiveEnrollments =
    useMemo(
      () =>
        localEnrollments.filter(
          (enrollment) =>
            enrollment.status !==
            "active"
        ),
      [
        localEnrollments,
      ]
    )

  /*
   * Solo aparecen para "agregar"
   * los cursos que nunca tuvo.
   *
   * Los cursos inactivos se muestran
   * aparte con botón Reactivar.
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

      const key =
        `assign-${selectedCourse}`

      setLoadingKey(key)
      setMessage("")
      setErrorMessage("")

      const supabase =
        createClient()

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

        setLoadingKey(null)

        return
      }

      setLocalEnrollments(
        (
          current
        ) => [
          ...current,
          {
            id:
              data.id,

            course_id:
              data.course_id,

            course_title:
              selected.title,

            status:
              data.status,
          },
        ]
      )

      setMessage(
        "Curso asignado correctamente."
      )

      setLoadingKey(null)

      router.refresh()
    }

  const removeCourse =
    async (
      enrollment: Enrollment
    ) => {
      const confirmed =
        window.confirm(
          `¿Querés quitar el acceso a "${enrollment.course_title}"? El alumno dejará de poder entrar, pero su progreso y su historial se conservarán.`
        )

      if (!confirmed) {
        return
      }

      const key =
        `remove-${enrollment.id}`

      setLoadingKey(key)
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
          .update({
            status:
              "inactive",
          })
          .eq(
            "id",
            enrollment.id
          )

      if (error) {
        console.error(
          "Error quitando curso:",
          error
        )

        setErrorMessage(
          "No pudimos quitar el acceso."
        )

        setLoadingKey(null)

        return
      }

      setLocalEnrollments(
        (
          current
        ) =>
          current.map(
            (item) =>
              item.id ===
              enrollment.id
                ? {
                    ...item,

                    status:
                      "inactive",
                  }
                : item
          )
      )

      setMessage(
        "Acceso quitado. El historial y el progreso se conservaron."
      )

      setLoadingKey(null)

      router.refresh()
    }

  const reactivateCourse =
    async (
      enrollment: Enrollment
    ) => {
      const key =
        `reactivate-${enrollment.id}`

      setLoadingKey(key)
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
          .update({
            status:
              "active",

            enrolled_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            enrollment.id
          )

      if (error) {
        console.error(
          "Error reactivando curso:",
          error
        )

        setErrorMessage(
          "No pudimos reactivar el curso."
        )

        setLoadingKey(null)

        return
      }

      setLocalEnrollments(
        (
          current
        ) =>
          current.map(
            (item) =>
              item.id ===
              enrollment.id
                ? {
                    ...item,

                    status:
                      "active",
                  }
                : item
          )
      )

      setMessage(
        "Acceso reactivado correctamente."
      )

      setLoadingKey(null)

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

      {/* ACTIVOS */}
      {activeEnrollments.length >
        0 && (
        <div className="space-y-2">

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Cursos activos
          </p>

          {activeEnrollments.map(
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

                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {
                    enrollment.course_title
                  }
                </p>

                <button
                  type="button"
                  disabled={
                    Boolean(
                      loadingKey
                    )
                  }
                  onClick={() =>
                    removeCourse(
                      enrollment
                    )
                  }
                  title="Quitar acceso"
                  aria-label={`Quitar acceso a ${enrollment.course_title}`}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-amber-600 transition hover:bg-amber-100 disabled:opacity-50 dark:text-amber-300 dark:hover:bg-amber-500/10"
                >

                  {loadingKey ===
                  `remove-${enrollment.id}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PowerOff className="h-4 w-4" />
                  )}

                </button>

              </div>
            )
          )}

        </div>
      )}

      {/* INACTIVOS */}
      {inactiveEnrollments.length >
        0 && (
        <div
          className={
            activeEnrollments.length >
            0
              ? "mt-4 border-t border-gray-100 pt-4 dark:border-white/10"
              : ""
          }
        >

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Historial
          </p>

          <div className="mt-2 space-y-2">

            {inactiveEnrollments.map(
              (
                enrollment
              ) => (
                <div
                  key={
                    enrollment.id
                  }
                  className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/[0.03]"
                >

                  <div className="flex items-center gap-3">

                    <PowerOff className="h-4 w-4 shrink-0 text-gray-400" />

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {
                          enrollment.course_title
                        }
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Acceso retirado
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    disabled={
                      Boolean(
                        loadingKey
                      )
                    }
                    onClick={() =>
                      reactivateCourse(
                        enrollment
                      )
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#0A9396]/30 bg-white px-3 py-2 text-xs font-semibold text-[#0A9396] transition hover:bg-[#0A9396]/5 disabled:opacity-50 dark:bg-[#001219]"
                  >

                    {loadingKey ===
                    `reactivate-${enrollment.id}` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Power className="h-3.5 w-3.5" />
                    )}

                    Reactivar acceso

                  </button>

                </div>
              )
            )}

          </div>

        </div>
      )}

      {/* NUEVO CURSO */}
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
              Boolean(
                loadingKey
              ) ||
              !selectedCourse
            }
            onClick={
              assignCourse
            }
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50"
          >

            {loadingKey ===
            `assign-${selectedCourse}` ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            Agregar acceso

          </button>

        </div>
      ) : (
        activeEnrollments.length ===
          courses.length && (
          <div className="mt-4">

            <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400">
              <GraduationCap className="h-4 w-4" />

              Tiene acceso a todos los cursos
            </div>

          </div>
        )
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