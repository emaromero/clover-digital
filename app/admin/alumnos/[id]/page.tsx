import Link from "next/link"
import {
  notFound,
  redirect,
} from "next/navigation"

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  GraduationCap,
  Mail,
  Phone,
  UserRound,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminAlumnoPage({
  params,
}: PageProps) {
  const { id } =
    await params

  const supabase =
    await createClient()

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const {
    data: roleData,
  } =
    await supabase
      .from("user_roles")
      .select("role")
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle()

  if (
    roleData?.role !==
    "admin"
  ) {
    redirect("/cuenta")
  }

  const {
    data: student,
  } =
    await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        phone,
        created_at
      `)
      .eq(
        "id",
        id
      )
      .maybeSingle()

  if (!student) {
    notFound()
  }

  const {
    data: enrollments,
  } =
    await supabase
      .from("enrollments")
      .select(`
        id,
        user_id,
        course_id,
        status,
        enrolled_at,
        courses (
          id,
          title,
          slug,
          description,
          cover_url
        )
      `)
      .eq(
        "user_id",
        id
      )
      .eq(
        "status",
        "active"
      )
      .order(
        "enrolled_at",
        {
          ascending: false,
        }
      )

  const activeEnrollments =
    enrollments || []

  const getCourse = (
    enrollment: any
  ) =>
    Array.isArray(
      enrollment.courses
    )
      ? enrollment.courses[0]
      : enrollment.courses

  const courses =
    activeEnrollments
      .map(
        (enrollment) => {
          const course =
            getCourse(
              enrollment
            )

          if (!course) {
            return null
          }

          return {
            enrollment_id:
              enrollment.id,

            enrolled_at:
              enrollment.enrolled_at,

            status:
              enrollment.status,

            course,
          }
        }
      )
      .filter(
        Boolean
      ) as Array<{
        enrollment_id: string
        enrolled_at: string | null
        status: string
        course: {
          id: string
          title: string
          slug: string
          description: string | null
          cover_url: string | null
        }
      }>

  const courseIds =
    courses.map(
      (item) =>
        item.course.id
    )

  const {
    data: modules,
  } =
    courseIds.length > 0
      ? await supabase
          .from("modules")
          .select(`
            id,
            course_id,
            title,
            description,
            position,
            lessons (
              id,
              title,
              position,
              duration_seconds,
              is_published
            )
          `)
          .in(
            "course_id",
            courseIds
          )
          .order(
            "position",
            {
              ascending: true,
            }
          )
      : { data: [] }

  const {
    data: progress,
  } =
    await supabase
      .from(
        "lesson_progress"
      )
      .select(`
        lesson_id,
        completed,
        completed_at,
        last_position_seconds,
        updated_at
      `)
      .eq(
        "user_id",
        id
      )

  const progressMap =
    new Map(
      (progress || []).map(
        (item) => [
          item.lesson_id,
          item,
        ]
      )
    )

  const getModulesForCourse = (
    courseId: string
  ) =>
    (modules || [])
      .filter(
        (module) =>
          module.course_id ===
          courseId
      )
      .map(
        (module) => ({
          ...module,

          lessons: [
            ...(module.lessons ||
              []),
          ]
            .filter(
              (lesson) =>
                lesson.is_published ===
                true
            )
            .sort(
              (a, b) =>
                a.position -
                b.position
            ),
        })
      )
      .filter(
        (module) =>
          module.lessons.length >
          0
      )
      .sort(
        (a, b) =>
          a.position -
          b.position
      )

  const getCourseStats = (
    courseId: string
  ) => {
    const courseModules =
      getModulesForCourse(
        courseId
      )

    const lessons =
      courseModules.flatMap(
        (module) =>
          module.lessons
      )

    const completed =
      lessons.filter(
        (lesson) =>
          progressMap.get(
            lesson.id
          )?.completed ===
          true
      ).length

    const total =
      lessons.length

    const percentage =
      total > 0
        ? Math.round(
            (completed /
              total) *
              100
          )
        : 0

    const activityDates =
      lessons
        .map(
          (lesson) =>
            progressMap.get(
              lesson.id
            )?.updated_at
        )
        .filter(Boolean)
        .map(
          (date) =>
            new Date(
              date as string
            ).getTime()
        )

    const lastActivityTimestamp =
      activityDates.length > 0
        ? Math.max(
            ...activityDates
          )
        : null

    const lastActivity =
      lastActivityTimestamp
        ? new Date(
            lastActivityTimestamp
          )
        : null

    return {
      modules:
        courseModules,

      lessons,

      completed,

      total,

      percentage,

      lastActivity,
    }
  }

  const courseStats =
    courses.map(
      (item) => ({
        ...item,

        stats:
          getCourseStats(
            item.course.id
          ),
      })
    )

  const overallCompleted =
    courseStats.reduce(
      (
        total,
        item
      ) =>
        total +
        item.stats.completed,
      0
    )

  const overallLessons =
    courseStats.reduce(
      (
        total,
        item
      ) =>
        total +
        item.stats.total,
      0
    )

  const overallPercentage =
    overallLessons > 0
      ? Math.round(
          (overallCompleted /
            overallLessons) *
            100
        )
      : 0

  const allActivityDates =
    (progress || [])
      .filter(
        (item) =>
          item.updated_at
      )
      .map(
        (item) =>
          new Date(
            item.updated_at
          ).getTime()
      )

  const lastActivityTimestamp =
    allActivityDates.length >
    0
      ? Math.max(
          ...allActivityDates
        )
      : null

  const lastActivity =
    lastActivityTimestamp
      ? new Date(
          lastActivityTimestamp
        )
      : null

  const daysWithoutActivity =
    lastActivity
      ? Math.floor(
          (Date.now() -
            lastActivity.getTime()) /
            (1000 *
              60 *
              60 *
              24)
        )
      : null

  const inactive =
    courses.length > 0 &&
    daysWithoutActivity !==
      null &&
    daysWithoutActivity >=
      10 &&
    overallPercentage < 100

  const formatDate = (
    date?:
      | string
      | Date
      | null
  ) => {
    if (!date) {
      return "Sin actividad"
    }

    return new Intl.DateTimeFormat(
      "es-AR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    ).format(
      new Date(date)
    )
  }

  const formatTime = (
    seconds?:
      | number
      | null
  ) => {
    if (!seconds) {
      return null
    }

    const minutes =
      Math.floor(
        seconds / 60
      )

    const remainingSeconds =
      seconds % 60

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(
        2,
        "0"
      )}`
  }

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">

        <Link
          href="/admin/academy"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Academy
        </Link>

        <section className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-5">

              {student.avatar_url ? (
                <img
                  src={
                    student.avatar_url
                  }
                  alt=""
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396]">
                  <UserRound className="h-7 w-7" />
                </div>
              )}

              <div>

                <p className="text-sm font-semibold text-[#0A9396]">
                  Alumno
                </p>

                <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white md:text-4xl">
                  {student.full_name ||
                    "Sin nombre"}
                </h1>

                <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {student.email}
                  </div>

                  {student.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {
                        student.phone
                      }
                    </div>
                  )}

                </div>

              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              {courses.length ===
              0 ? (
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 dark:bg-white/5 dark:text-gray-400">
                  Sin cursos activos
                </span>
              ) : overallPercentage ===
                100 ? (
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Todos los cursos completados
                </span>
              ) : inactive ? (
                <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  Inactivo hace{" "}
                  {
                    daysWithoutActivity
                  }{" "}
                  días
                </span>
              ) : (
                <span className="rounded-full bg-[#0A9396]/10 px-4 py-2 text-sm font-semibold text-[#0A9396]">
                  {courses.length}{" "}
                  {courses.length ===
                  1
                    ? "curso activo"
                    : "cursos activos"}
                </span>
              )}

            </div>

          </div>

        </section>

        {courses.length ===
        0 ? (
          <section className="mt-6 rounded-3xl border border-gray-200/70 bg-white p-8 dark:border-white/10 dark:bg-[#06222c]">

            <GraduationCap className="h-8 w-8 text-[#0A9396]" />

            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Sin cursos activos
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Este usuario todavía no tiene acceso a ningún curso de Clover Academy.
            </p>

          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-4 md:grid-cols-4">

              <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

                <p className="text-sm text-gray-500">
                  Progreso general
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    overallPercentage
                  }
                  %
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">

                  <div
                    className="h-full rounded-full bg-[#0A9396]"
                    style={{
                      width: `${overallPercentage}%`,
                    }}
                  />

                </div>

              </div>

              <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

                <p className="text-sm text-gray-500">
                  Cursos activos
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    courses.length
                  }
                </p>

              </div>

              <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

                <p className="text-sm text-gray-500">
                  Clases
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {overallCompleted}/
                  {overallLessons}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  completadas
                </p>

              </div>

              <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

                <p className="text-sm text-gray-500">
                  Última actividad
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                  {formatDate(
                    lastActivity
                  )}
                </p>

                {daysWithoutActivity !==
                  null && (
                  <p className="mt-2 text-sm text-gray-500">
                    Hace{" "}
                    {
                      daysWithoutActivity
                    }{" "}
                    {daysWithoutActivity ===
                    1
                      ? "día"
                      : "días"}
                  </p>
                )}

              </div>

            </section>

            <div className="mt-8 space-y-8">

              {courseStats.map(
                ({
                  enrollment_id,
                  enrolled_at,
                  status,
                  course,
                  stats,
                }) => (
                  <section
                    key={
                      enrollment_id
                    }
                    className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]"
                  >

                    <div
                      className={
                        course.cover_url
                          ? "grid border-b border-gray-100 dark:border-white/10 lg:grid-cols-[1fr_280px]"
                          : "border-b border-gray-100 dark:border-white/10"
                      }
                    >

                      <div className="p-6 md:p-8">

                        <p className="text-xs font-semibold uppercase tracking-wider text-[#0A9396]">
                          Curso
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                          {
                            course.title
                          }
                        </h2>

                        {course.description && (
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                            {
                              course.description
                            }
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-500">

                          <span>
                            Inscripto:{" "}
                            {formatDate(
                              enrolled_at
                            )}
                          </span>

                          <span>
                            Estado:{" "}
                            {status}
                          </span>

                        </div>

                      </div>

                      {course.cover_url && (
                        <div className="aspect-[16/7] bg-gray-100 lg:aspect-auto">

                          <img
                            src={
                              course.cover_url
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />

                        </div>
                      )}

                    </div>

                    <div className="grid gap-4 border-b border-gray-100 p-6 dark:border-white/10 md:grid-cols-3 md:p-8">

                      <div>

                        <p className="text-sm text-gray-500">
                          Progreso
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                          {
                            stats.percentage
                          }
                          %
                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-500">
                          Clases
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                          {
                            stats.completed
                          }
                          /
                          {
                            stats.total
                          }
                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-500">
                          Última actividad
                        </p>

                        <p className="mt-1 font-bold text-gray-900 dark:text-white">
                          {formatDate(
                            stats.lastActivity
                          )}
                        </p>

                      </div>

                      <div className="md:col-span-3">

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">

                          <div
                            className="h-full rounded-full bg-[#0A9396]"
                            style={{
                              width: `${stats.percentage}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>

                    {stats.modules.length ===
                    0 ? (
                      <div className="p-8 text-center text-sm text-gray-500">
                        Este curso todavía no tiene clases publicadas.
                      </div>
                    ) : (
                      <div className="space-y-0">

                        {stats.modules.map(
                          (
                            module
                          ) => {
                            const moduleLessons =
                              module.lessons

                            const moduleCompleted =
                              moduleLessons.filter(
                                (
                                  lesson
                                ) =>
                                  progressMap.get(
                                    lesson.id
                                  )?.completed ===
                                  true
                              ).length

                            const modulePercentage =
                              moduleLessons.length >
                              0
                                ? Math.round(
                                    (moduleCompleted /
                                      moduleLessons.length) *
                                      100
                                  )
                                : 0

                            return (
                              <section
                                key={
                                  module.id
                                }
                                className="border-t border-gray-100 first:border-t-0 dark:border-white/10"
                              >

                                <div className="p-6 md:p-8">

                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex items-start gap-4">

                                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                                        <BookOpen className="h-5 w-5" />
                                      </div>

                                      <div>

                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#0A9396]">
                                          Módulo{" "}
                                          {
                                            module.position
                                          }
                                        </p>

                                        <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                                          {
                                            module.title
                                          }
                                        </h3>

                                        <p className="mt-2 text-sm text-gray-500">
                                          {
                                            moduleCompleted
                                          }{" "}
                                          de{" "}
                                          {
                                            moduleLessons.length
                                          }{" "}
                                          clases
                                        </p>

                                      </div>

                                    </div>

                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                      {
                                        modulePercentage
                                      }
                                      %
                                    </p>

                                  </div>

                                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">

                                    <div
                                      className="h-full rounded-full bg-[#0A9396]"
                                      style={{
                                        width: `${modulePercentage}%`,
                                      }}
                                    />

                                  </div>

                                </div>

                                <div className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-white/10 dark:border-white/10">

                                  {moduleLessons.map(
                                    (
                                      lesson
                                    ) => {
                                      const lessonProgress =
                                        progressMap.get(
                                          lesson.id
                                        )

                                      const completed =
                                        lessonProgress?.completed ===
                                        true

                                      return (
                                        <div
                                          key={
                                            lesson.id
                                          }
                                          className="flex items-center gap-4 px-6 py-4 md:px-8"
                                        >

                                          {completed ? (
                                            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0A9396]" />
                                          ) : (
                                            <Circle className="h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600" />
                                          )}

                                          <div className="min-w-0 flex-1">

                                            <p className="font-medium text-gray-800 dark:text-gray-100">
                                              {
                                                lesson.position
                                              }
                                              .{" "}
                                              {
                                                lesson.title
                                              }
                                            </p>

                                            <div className="mt-1 flex flex-wrap gap-4 text-xs text-gray-400">

                                              {lessonProgress?.last_position_seconds >
                                                0 && (
                                                <span className="flex items-center gap-1">

                                                  <Clock3 className="h-3.5 w-3.5" />

                                                  Visto hasta{" "}
                                                  {formatTime(
                                                    lessonProgress.last_position_seconds
                                                  )}

                                                </span>
                                              )}

                                              {completed &&
                                                lessonProgress?.completed_at && (
                                                <span>
                                                  Completada{" "}
                                                  {formatDate(
                                                    lessonProgress.completed_at
                                                  )}
                                                </span>
                                              )}

                                            </div>

                                          </div>

                                          <span
                                            className={`text-xs font-semibold ${
                                              completed
                                                ? "text-[#0A9396]"
                                                : "text-gray-400"
                                            }`}
                                          >
                                            {completed
                                              ? "Completada"
                                              : "Pendiente"}
                                          </span>

                                        </div>
                                      )
                                    }
                                  )}

                                </div>

                              </section>
                            )
                          }
                        )}

                      </div>
                    )}

                  </section>
                )
              )}

            </div>
          </>
        )}

        <p className="mt-10 text-center text-xs text-gray-400">
          Panel privado · Clover Academy
        </p>

      </div>
    </main>
  )
}