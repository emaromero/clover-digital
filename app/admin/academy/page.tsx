import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Settings2,
  UserRound,
  Users,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import AcademyEnrollmentManager from "@/components/academy-enrollment-manager"

export default async function AdminAcademyPage() {
  const supabase =
    await createClient()

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const { data: roleData } =
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

  const { data: profiles } =
    await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        created_at
      `)
      .order(
        "full_name",
        {
          ascending: true,
        }
      )

  const { data: courses } =
    await supabase
      .from("courses")
      .select(`
        id,
        title,
        slug,
        description
      `)
      .order(
        "title",
        {
          ascending: true,
        }
      )

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
          title
        )
      `)
      .order(
        "enrolled_at",
        {
          ascending: false,
        }
      )

  const {
    data: progress,
  } =
    await supabase
      .from(
        "lesson_progress"
      )
      .select(`
        user_id,
        lesson_id,
        completed,
        updated_at
      `)

  const {
    data: lessons,
  } =
    await supabase
      .from("lessons")
      .select(`
        id,
        is_published,
        module_id,
        modules (
          course_id
        )
      `)

  const students =
    profiles || []

  const allCourses =
    courses || []

  const allEnrollments =
    enrollments || []

  const allProgress =
    progress || []

  const allLessons =
    (lessons || []).filter(
      (lesson) =>
        lesson.is_published ===
        true
    )

  const activeEnrollments =
    allEnrollments.filter(
      (enrollment) =>
        enrollment.status ===
        "active"
    )

  const getCourse = (
    enrollment: any
  ) =>
    Array.isArray(
      enrollment.courses
    )
      ? enrollment.courses[0]
      : enrollment.courses

  const getModule = (
    lesson: any
  ) =>
    Array.isArray(
      lesson.modules
    )
      ? lesson.modules[0]
      : lesson.modules

  const getActiveEnrollment = (
    userId: string
  ) => {
    const enrollment =
      activeEnrollments.find(
        (item) =>
          item.user_id ===
          userId
      )

    if (!enrollment) {
      return null
    }

    const course =
      getCourse(
        enrollment
      )

    return {
      id:
        enrollment.id,

      course_id:
        enrollment.course_id,

      course_title:
        course?.title ||
        "Curso",
    }
  }

  const calculateProgress = (
    userId: string,
    courseId?: string | null
  ) => {
    if (!courseId) {
      return {
        completed: 0,
        total: 0,
        percentage: 0,
      }
    }

    const ids =
      allLessons
        .filter(
          (lesson) =>
            getModule(
              lesson
            )?.course_id ===
            courseId
        )
        .map(
          (lesson) =>
            lesson.id
        )

    const completed =
      allProgress.filter(
        (item) =>
          item.user_id ===
            userId &&
          item.completed ===
            true &&
          ids.includes(
            item.lesson_id
          )
      ).length

    const total =
      ids.length

    return {
      completed,
      total,

      percentage:
        total > 0
          ? Math.round(
              (completed /
                total) *
                100
            )
          : 0,
    }
  }

  const usersWithoutCourse =
    students.filter(
      (student) =>
        !activeEnrollments.some(
          (enrollment) =>
            enrollment.user_id ===
            student.id
        )
    ).length

  const completedStudents =
    students.filter(
      (student) => {
        const enrollment =
          getActiveEnrollment(
            student.id
          )

        if (!enrollment) {
          return false
        }

        const result =
          calculateProgress(
            student.id,
            enrollment.course_id
          )

        return (
          result.total > 0 &&
          result.percentage ===
            100
        )
      }
    ).length

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a administración
        </Link>

        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0A9396]">
              Clover Academy
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
              Alumnos y accesos
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
              Administrá alumnos, accesos y contenido desde un solo lugar.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/academy/contenido"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Settings2 className="h-4 w-4" />
              Gestionar contenido
            </Link>

            <Link
              href="/academy"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold"
            >
              Ver campus

              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            icon={
              <Users className="h-6 w-6 text-[#0A9396]" />
            }
            label="Usuarios"
            value={
              students.length
            }
          />

          <Metric
            icon={
              <GraduationCap className="h-6 w-6 text-[#0A9396]" />
            }
            label="Accesos activos"
            value={
              activeEnrollments.length
            }
          />

          <Metric
            icon={
              <BookOpen className="h-6 w-6 text-amber-600" />
            }
            label="Sin curso"
            value={
              usersWithoutCourse
            }
          />

          <Metric
            icon={
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            }
            label="Completados"
            value={
              completedStudents
            }
          />
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">
          <div className="border-b border-gray-100 p-6 dark:border-white/10 md:p-8">
            <h2 className="text-xl font-bold">
              Usuarios
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Administrá el acceso y revisá el progreso sobre las clases publicadas.
            </p>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/10">
            {students.map(
              (student) => {
                const enrollment =
                  getActiveEnrollment(
                    student.id
                  )

                const studentProgress =
                  calculateProgress(
                    student.id,
                    enrollment?.course_id
                  )

                return (
                  <article
                    key={
                      student.id
                    }
                    className="grid gap-6 p-6 md:px-8 lg:grid-cols-[1.2fr_1fr_280px] lg:items-center"
                  >
                    <div className="flex items-center gap-4">
                      {student.avatar_url ? (
                        <img
                          src={
                            student.avatar_url
                          }
                          alt=""
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396]">
                          <UserRound className="h-5 w-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {student.full_name ||
                            "Sin nombre"}
                        </p>

                        <p className="truncate text-sm text-gray-500">
                          {
                            student.email
                          }
                        </p>
                      </div>
                    </div>

                    <div>
                      {enrollment ? (
                        <>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">
                              Progreso
                            </span>

                            <strong>
                              {studentProgress.percentage}%
                            </strong>
                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                            <div
                              className="h-full bg-[#0A9396]"
                              style={{
                                width: `${studentProgress.percentage}%`,
                              }}
                            />
                          </div>

                          <p className="mt-2 text-xs text-gray-500">
                            {studentProgress.completed} de{" "}
                            {studentProgress.total} clases publicadas
                          </p>

                          <Link
                            href={`/admin/alumnos/${student.id}`}
                            className="mt-3 inline-flex text-xs font-semibold text-[#0A9396]"
                          >
                            Ver detalle
                          </Link>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400">
                          Sin curso activo.
                        </p>
                      )}
                    </div>

                    <AcademyEnrollmentManager
                      userId={
                        student.id
                      }
                      courses={
                        allCourses.map(
                          (course) => ({
                            id:
                              course.id,

                            title:
                              course.title,
                          })
                        )
                      }
                      activeEnrollment={
                        enrollment
                      }
                    />
                  </article>
                )
              }
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">
      {icon}

      <p className="mt-4 text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold">
        {value}
      </p>
    </div>
  )
}