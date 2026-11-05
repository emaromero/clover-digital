import Link from "next/link"
import { redirect } from "next/navigation"
import {
  BookOpen,
  GraduationCap,
  Users,
  UserRound,
  ArrowRight,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  if (roleData?.role !== "admin") {
    redirect("/cuenta")
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      avatar_url,
      phone,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    })

  const { data: enrollments } = await supabase
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
        slug
      )
    `)
    .order("enrolled_at", {
      ascending: false,
    })

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select(`
      user_id,
      lesson_id,
      completed,
      updated_at
    `)

  const { data: lessons } = await supabase
    .from("lessons")
    .select(`
      id,
      module_id,
      modules (
        course_id
      )
    `)

  const students = profiles || []
  const allEnrollments = enrollments || []
  const allProgress = progress || []
  const allLessons = lessons || []

  const totalStudents = students.length

  const activeEnrollments = allEnrollments.filter(
    (item) => item.status === "active"
  ).length

  const completedProgress = allProgress.filter(
    (item) => item.completed
  ).length

  const getCourse = (enrollment: any) => {
    if (Array.isArray(enrollment.courses)) {
      return enrollment.courses[0]
    }

    return enrollment.courses
  }

  const getModules = (lesson: any) => {
    if (Array.isArray(lesson.modules)) {
      return lesson.modules[0]
    }

    return lesson.modules
  }

  const calculateProgress = (
    userId: string,
    courseId: string
  ) => {
    const courseLessonIds = allLessons
      .filter((lesson) => {
        const module = getModules(lesson)

        return module?.course_id === courseId
      })
      .map((lesson) => lesson.id)

    if (courseLessonIds.length === 0) {
      return 0
    }

    const completed = allProgress.filter(
      (item) =>
        item.user_id === userId &&
        item.completed === true &&
        courseLessonIds.includes(item.lesson_id)
    ).length

    return Math.round(
      (completed / courseLessonIds.length) * 100
    )
  }

  const getLastActivity = (userId: string) => {
    const userProgress = allProgress
      .filter(
        (item) =>
          item.user_id === userId &&
          item.updated_at
      )
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() -
          new Date(a.updated_at).getTime()
      )

    if (userProgress.length === 0) {
      return null
    }

    return userProgress[0].updated_at
  }

  const formatDate = (date?: string | null) => {
    if (!date) {
      return "Sin actividad"
    }

    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">

        {/* HEADER */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-[#0A9396]">
              Clover Academy
            </p>

            <h1 className="mt-2 text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Administración
            </h1>

            <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
              Gestioná alumnos, inscripciones y progreso
              de los cursos.
            </p>
          </div>

          <Link
            href="/cuenta"
            className="text-sm text-[#0A9396] hover:underline"
          >
            ← Mi cuenta
          </Link>
        </div>

        {/* MÉTRICAS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <div className="rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                <Users className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Usuarios
                </p>

                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalStudents}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Inscripciones activas
                </p>

                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {activeEnrollments}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                <BookOpen className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Clases completadas
                </p>

                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {completedProgress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ALUMNOS */}
        <div className="rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Alumnos
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Seguimiento general de Clover Academy.
            </p>
          </div>

          {students.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Todavía no hay usuarios registrados.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {students.map((student) => {
                const enrollment =
                  allEnrollments.find(
                    (item) =>
                      item.user_id === student.id &&
                      item.status === "active"
                  )

                const course = enrollment
                  ? getCourse(enrollment)
                  : null

                const percentage =
                  enrollment && course
                    ? calculateProgress(
                        student.id,
                        course.id
                      )
                    : 0

                const lastActivity =
                  getLastActivity(student.id)

                return (
                  <div
                    key={student.id}
                    className="p-5 md:px-8 md:py-6 flex flex-col gap-5 lg:flex-row lg:items-center"
                  >
                    {/* ALUMNO */}
                    <div className="flex items-center gap-4 lg:w-[28%]">
                      {student.avatar_url ? (
                        <img
                          src={student.avatar_url}
                          alt=""
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396]">
                          <UserRound className="h-5 w-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {student.full_name ||
                            "Sin nombre"}
                        </p>

                        <p className="text-sm text-gray-500 truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>

                    {/* CURSO */}
                    <div className="lg:w-[25%]">
                      <p className="text-xs text-gray-400 mb-1">
                        Curso
                      </p>

                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {course?.title ||
                          "Sin inscripción"}
                      </p>
                    </div>

                    {/* PROGRESO */}
                    <div className="lg:w-[25%]">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-500">
                          Progreso
                        </span>

                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                          {percentage}%
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-[#0A9396] rounded-full"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* ACTIVIDAD */}
                    <div className="lg:w-[15%]">
                      <p className="text-xs text-gray-400">
                        Última actividad
                      </p>

                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(lastActivity)}
                      </p>
                    </div>

                    {/* DETALLE */}
                    <div className="lg:flex-1 flex lg:justify-end">
                      <Link
                        href={`/admin/alumnos/${student.id}`}
                        className="flex items-center gap-1 text-sm font-medium text-[#0A9396] hover:underline"
                      >
                        Ver alumno
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}