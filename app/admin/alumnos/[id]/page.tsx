import Link from "next/link"
import { notFound, redirect } from "next/navigation"
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
  const { id } = await params

  const supabase = await createClient()

  // USUARIO ACTUAL
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  // VERIFICAR ADMIN
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  if (roleData?.role !== "admin") {
    redirect("/cuenta")
  }

  // PERFIL DEL ALUMNO
  const { data: student } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      avatar_url,
      phone,
      created_at
    `)
    .eq("id", id)
    .maybeSingle()

  if (!student) {
    notFound()
  }

  // INSCRIPCIÓN ACTIVA
  const { data: enrollment } = await supabase
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
        description
      )
    `)
    .eq("user_id", id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  const course = enrollment
    ? Array.isArray(enrollment.courses)
      ? enrollment.courses[0]
      : enrollment.courses
    : null

  // MÓDULOS + CLASES
  const { data: modules } = course
    ? await supabase
        .from("modules")
        .select(`
          id,
          title,
          description,
          position,
          lessons (
            id,
            title,
            position,
            duration_seconds
          )
        `)
        .eq("course_id", course.id)
        .order("position", {
          ascending: true,
        })
    : { data: [] }

  // PROGRESO DEL ALUMNO
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select(`
      lesson_id,
      completed,
      completed_at,
      last_position_seconds,
      updated_at
    `)
    .eq("user_id", id)

  const orderedModules = (modules || []).map((module) => ({
    ...module,
    lessons: [...(module.lessons || [])].sort(
      (a, b) => a.position - b.position
    ),
  }))

  const progressMap = new Map(
    (progress || []).map((item) => [
      item.lesson_id,
      item,
    ])
  )

  const allLessons = orderedModules.flatMap(
    (module) => module.lessons
  )

  const totalLessons = allLessons.length

  const completedLessons = allLessons.filter(
    (lesson) =>
      progressMap.get(lesson.id)?.completed === true
  ).length

  const percentage =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100
        )
      : 0

  // ÚLTIMA ACTIVIDAD
  const activityDates = (progress || [])
    .filter((item) => item.updated_at)
    .map((item) =>
      new Date(item.updated_at).getTime()
    )

  const lastActivityTimestamp =
    activityDates.length > 0
      ? Math.max(...activityDates)
      : null

  const lastActivity = lastActivityTimestamp
    ? new Date(lastActivityTimestamp)
    : null

  const daysWithoutActivity = lastActivity
    ? Math.floor(
        (Date.now() - lastActivity.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  const inactive =
    daysWithoutActivity !== null &&
    daysWithoutActivity >= 10 &&
    percentage < 100

  const formatDate = (
    date?: string | Date | null
  ) => {
    if (!date) {
      return "Sin actividad"
    }

    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  const formatTime = (seconds?: number | null) => {
    if (!seconds) {
      return null
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`
  }

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">

        {/* VOLVER */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a alumnos
        </Link>

        {/* PERFIL */}
        <section className="mt-8 rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-5">
              {student.avatar_url ? (
                <img
                  src={student.avatar_url}
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

                <h1 className="mt-1 text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
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
                      {student.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {percentage === 100 ? (
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Curso completado
                </span>
              ) : inactive ? (
                <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  Inactivo hace {daysWithoutActivity} días
                </span>
              ) : enrollment ? (
                <span className="rounded-full bg-[#0A9396]/10 px-4 py-2 text-sm font-semibold text-[#0A9396]">
                  Cursando
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 dark:bg-white/5 dark:text-gray-400">
                  Sin inscripción
                </span>
              )}
            </div>
          </div>
        </section>

        {/* SIN CURSO */}
        {!course || !enrollment ? (
          <section className="mt-6 rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-8">
            <GraduationCap className="h-8 w-8 text-[#0A9396]" />

            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Sin cursos activos
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Este usuario todavía no está inscripto en
              ningún curso de Clover Academy.
            </p>
          </section>
        ) : (
          <>
            {/* RESUMEN */}
            <section className="mt-6 grid gap-4 md:grid-cols-3">

              <div className="rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-6">
                <p className="text-sm text-gray-500">
                  Progreso
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {percentage}%
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#0A9396]"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-6">
                <p className="text-sm text-gray-500">
                  Clases
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {completedLessons}/{totalLessons}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  clases completadas
                </p>
              </div>

              <div className="rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-6">
                <p className="text-sm text-gray-500">
                  Última actividad
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                  {formatDate(lastActivity)}
                </p>

                {daysWithoutActivity !== null && (
                  <p className="mt-2 text-sm text-gray-500">
                    Hace {daysWithoutActivity}{" "}
                    {daysWithoutActivity === 1
                      ? "día"
                      : "días"}
                  </p>
                )}
              </div>

            </section>

            {/* CURSO */}
            <section className="mt-6 rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0A9396]">
                Curso
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {course.title}
              </h2>

              {course.description && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {course.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-6 text-sm text-gray-500">
                <span>
                  Inscripto:{" "}
                  {formatDate(
                    enrollment.enrolled_at
                  )}
                </span>

                <span>
                  Estado: {enrollment.status}
                </span>
              </div>
            </section>

            {/* MÓDULOS */}
            <div className="mt-6 space-y-5">
              {orderedModules.map((module) => {
                const moduleLessons =
                  module.lessons

                const moduleCompleted =
                  moduleLessons.filter(
                    (lesson) =>
                      progressMap.get(lesson.id)
                        ?.completed === true
                  ).length

                const modulePercentage =
                  moduleLessons.length > 0
                    ? Math.round(
                        (moduleCompleted /
                          moduleLessons.length) *
                          100
                      )
                    : 0

                return (
                  <section
                    key={module.id}
                    className="overflow-hidden rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c]"
                  >
                    {/* CABECERA MÓDULO */}
                    <div className="border-b border-gray-100 dark:border-white/10 p-6 md:p-8">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                            <BookOpen className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#0A9396]">
                              Módulo {module.position}
                            </p>

                            <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                              {module.title}
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                              {moduleCompleted} de{" "}
                              {moduleLessons.length} clases
                            </p>
                          </div>
                        </div>

                        <div className="min-w-[100px] text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {modulePercentage}%
                          </p>
                        </div>
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

                    {/* CLASES */}
                    <div className="divide-y divide-gray-100 dark:divide-white/10">
                      {moduleLessons.map(
                        (lesson) => {
                          const lessonProgress =
                            progressMap.get(
                              lesson.id
                            )

                          const completed =
                            lessonProgress
                              ?.completed === true

                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-4 px-6 py-4 md:px-8"
                            >
                              {completed ? (
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0A9396]" />
                              ) : (
                                <Circle className="h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600" />
                              )}

                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                  {lesson.position}.{" "}
                                  {lesson.title}
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
              })}
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