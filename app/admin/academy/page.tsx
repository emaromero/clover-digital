import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Settings2,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

import AcademyEnrollmentManager from "@/components/academy-enrollment-manager"
import AcademyCourseCreator from "@/components/academy-course-creator"

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

  /*
   * PERFILES
   */
  const {
    data: profiles,
  } =
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

  /*
   * CURSOS
   */
  const {
    data: courses,
  } =
    await supabase
      .from("courses")
      .select(`
        id,
        title,
        slug,
        description,
        cover_url,
        modules (
          id,
          lessons (
            id,
            is_published
          )
        )
      `)
      .order(
        "title",
        {
          ascending: true,
        }
      )

  /*
   * INSCRIPCIONES
   *
   * Una inscripción representa acceso
   * permanente al curso.
   */
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

  /*
   * PROGRESO
   */
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

  /*
   * CLASES PUBLICADAS
   */
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

  const allProfiles =
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

  /*
   * ALUMNO =
   * persona con al menos un curso asignado.
   */
  const studentIds =
    new Set(
      allEnrollments.map(
        (enrollment) =>
          enrollment.user_id
      )
    )

  const students =
    allProfiles.filter(
      (profile) =>
        studentIds.has(
          profile.id
        )
    )

  /*
   * Usuarios que todavía nunca recibieron
   * un curso.
   */
  const usersWithoutEnrollment =
    allProfiles.filter(
      (profile) =>
        !studentIds.has(
          profile.id
        )
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

  const getUserEnrollments = (
    userId: string
  ) =>
    allEnrollments
      .filter(
        (item) =>
          item.user_id ===
          userId
      )
      .map(
        (enrollment) => {
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

            status:
              enrollment.status,
          }
        }
      )

  const calculateCourseProgress = (
    userId: string,
    courseId: string
  ) => {
    const lessonIds =
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
          lessonIds.includes(
            item.lesson_id
          )
      ).length

    return {
      completed,

      total:
        lessonIds.length,
    }
  }

  const calculateOverallProgress = (
    userId: string,
    userEnrollments: Array<{
      course_id: string
    }>
  ) => {
    let completed =
      0

    let total =
      0

    userEnrollments.forEach(
      (
        enrollment
      ) => {
        const result =
          calculateCourseProgress(
            userId,
            enrollment.course_id
          )

        completed +=
          result.completed

        total +=
          result.total
      }
    )

    return {
      completed,
      total,

      percentage:
        total > 0
          ? Math.round(
              (
                completed /
                total
              ) *
                100
            )
          : 0,
    }
  }

  const completedStudents =
    students.filter(
      (student) => {
        const studentEnrollments =
          getUserEnrollments(
            student.id
          )

        const result =
          calculateOverallProgress(
            student.id,
            studentEnrollments
          )

        return (
          result.total >
            0 &&
          result.percentage ===
            100
        )
      }
    ).length

  const existingSlugs =
    allCourses.map(
      (course) =>
        course.slug
    )

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

        {/* HEADER */}
        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-sm font-semibold text-[#0A9396]">
              Clover Academy
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
              Administración
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
              Administrá cursos, alumnos, accesos y contenido desde un solo lugar.
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            <AcademyCourseCreator
              existingSlugs={
                existingSlugs
              }
            />

            <Link
              href="/admin/academy/contenido"
              className="inline-flex items-center gap-2 rounded-xl border border-[#0A9396]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#0A9396] transition hover:bg-[#0A9396]/5 dark:bg-[#06222c]"
            >
              <Settings2 className="h-4 w-4" />

              Gestionar contenido
            </Link>

            <Link
              href="/academy"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 dark:border-white/10 dark:bg-[#06222c] dark:text-gray-300"
            >
              Ver campus

              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>

        </div>

        {/* MÉTRICAS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Metric
            icon={
              <GraduationCap className="h-6 w-6 text-[#0A9396]" />
            }
            label="Cursos"
            value={
              allCourses.length
            }
          />

          <Metric
            icon={
              <Users className="h-6 w-6 text-[#0A9396]" />
            }
            label="Alumnos"
            value={
              students.length
            }
          />

          <Metric
            icon={
              <BookOpen className="h-6 w-6 text-amber-600" />
            }
            label="Accesos asignados"
            value={
              allEnrollments.length
            }
          />

          <Metric
            icon={
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            }
            label="Alumnos al 100%"
            value={
              completedStudents
            }
          />

        </div>

        {/* CURSOS */}
        <section className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold text-[#0A9396]">
                Cursos
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                Cursos disponibles
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Creá cursos y completá su contenido desde el editor.
              </p>

            </div>

            <span className="text-sm font-semibold text-gray-500">

              {
                allCourses.length
              }{" "}

              {allCourses.length ===
              1
                ? "curso"
                : "cursos"}

            </span>

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {allCourses.map(
              (
                course
              ) => {
                const modules =
                  course.modules ||
                  []

                const courseLessons =
                  modules.flatMap(
                    (
                      module
                    ) =>
                      module.lessons ||
                      []
                  )

                const publishedLessons =
                  courseLessons.filter(
                    (
                      lesson
                    ) =>
                      lesson.is_published ===
                      true
                  ).length

                const assignedStudents =
                  allEnrollments.filter(
                    (
                      enrollment
                    ) =>
                      enrollment.course_id ===
                      course.id
                  ).length

                return (
                  <article
                    key={
                      course.id
                    }
                    className="overflow-hidden rounded-2xl border border-gray-200/70 bg-gray-50/50 dark:border-white/10 dark:bg-white/[0.02]"
                  >

                    {course.cover_url ? (
                      <div className="aspect-[16/7] bg-gray-100">

                        <img
                          src={
                            course.cover_url
                          }
                          alt={`Portada de ${course.title}`}
                          className="h-full w-full object-cover"
                        />

                      </div>
                    ) : (
                      <div className="flex aspect-[16/7] items-center justify-center bg-[#0A9396]/5">

                        <GraduationCap className="h-9 w-9 text-[#0A9396]/40" />

                      </div>
                    )}

                    <div className="p-5">

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {
                          course.title
                        }
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">

                        <span className="rounded-full bg-[#0A9396]/10 px-2.5 py-1 text-[#0A9396]">
                          {modules.length} módulos
                        </span>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          {publishedLessons} publicadas
                        </span>

                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-white/5 dark:text-gray-300">
                          {assignedStudents}{" "}
                          {assignedStudents ===
                          1
                            ? "alumno"
                            : "alumnos"}
                        </span>

                      </div>

                      <Link
                        href={`/admin/academy/contenido?course=${course.id}`}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0A9396] hover:underline"
                      >
                        Gestionar contenido

                        <ArrowRight className="h-4 w-4" />
                      </Link>

                    </div>

                  </article>
                )
              }
            )}

          </div>

        </section>

        {/* ALUMNOS */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10 md:p-8">

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Alumnos y accesos
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Personas que tienen al menos un curso asignado en Clover Academy.
            </p>

          </div>

          {students.length ===
          0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Todavía no hay alumnos en Clover Academy.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">

              {students.map(
                (
                  student
                ) => {
                  const studentEnrollments =
                    getUserEnrollments(
                      student.id
                    )

                  const studentProgress =
                    calculateOverallProgress(
                      student.id,
                      studentEnrollments
                    )

                  return (
                    <article
                      key={
                        student.id
                      }
                      className="grid gap-6 p-6 md:px-8 lg:grid-cols-[1.1fr_0.9fr_340px] lg:items-start"
                    >

                      {/* ALUMNO */}
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

                          <p className="truncate font-semibold text-gray-900 dark:text-white">
                            {student.full_name ||
                              "Sin nombre"}
                          </p>

                          <p className="truncate text-sm text-gray-500">
                            {
                              student.email
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-400">

                            {
                              studentEnrollments.length
                            }{" "}

                            {studentEnrollments.length ===
                            1
                              ? "curso asignado"
                              : "cursos asignados"}

                          </p>

                        </div>

                      </div>

                      {/* PROGRESO */}
                      <div>

                        <div className="flex justify-between text-xs">

                          <span className="text-gray-400">
                            Progreso general
                          </span>

                          <strong>
                            {
                              studentProgress.percentage
                            }
                            %
                          </strong>

                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">

                          <div
                            className="h-full rounded-full bg-[#0A9396]"
                            style={{
                              width: `${studentProgress.percentage}%`,
                            }}
                          />

                        </div>

                        <p className="mt-2 text-xs text-gray-500">

                          {
                            studentProgress.completed
                          }{" "}

                          de{" "}

                          {
                            studentProgress.total
                          }{" "}

                          clases publicadas

                        </p>

                        <Link
                          href={`/admin/alumnos/${student.id}`}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#0A9396] hover:underline"
                        >
                          Ver detalle

                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>

                      </div>

                      {/* ACCESOS */}
                      <AcademyEnrollmentManager
                        userId={
                          student.id
                        }
                        courses={
                          allCourses.map(
                            (
                              course
                            ) => ({
                              id:
                                course.id,

                              title:
                                course.title,
                            })
                          )
                        }
                        enrollments={
                          studentEnrollments
                        }
                      />

                    </article>
                  )
                }
              )}

            </div>
          )}

        </section>

        {/* ASIGNAR PRIMER CURSO */}
        {usersWithoutEnrollment.length >
          0 && (
          <details className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

            <summary className="cursor-pointer list-none p-6 md:p-8">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                    <UserPlus className="h-5 w-5" />
                  </div>

                  <div>

                    <h2 className="font-bold text-gray-900 dark:text-white">
                      Asignar primer curso
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Usuarios registrados que todavía no tienen ningún curso de Academy.
                    </p>

                  </div>

                </div>

                <span className="text-sm font-semibold text-gray-400">
                  {
                    usersWithoutEnrollment.length
                  }
                </span>

              </div>

            </summary>

            <div className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-white/10 dark:border-white/10">

              {usersWithoutEnrollment.map(
                (
                  profile
                ) => (
                  <article
                    key={
                      profile.id
                    }
                    className="grid gap-6 p-6 md:px-8 lg:grid-cols-[1fr_340px] lg:items-start"
                  >

                    <div className="flex items-center gap-4">

                      {profile.avatar_url ? (
                        <img
                          src={
                            profile.avatar_url
                          }
                          alt=""
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-300">
                          <UserRound className="h-5 w-5" />
                        </div>
                      )}

                      <div className="min-w-0">

                        <p className="truncate font-semibold text-gray-900 dark:text-white">
                          {profile.full_name ||
                            "Sin nombre"}
                        </p>

                        <p className="truncate text-sm text-gray-500">
                          {
                            profile.email
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Sin cursos asignados
                        </p>

                      </div>

                    </div>

                    <AcademyEnrollmentManager
                      userId={
                        profile.id
                      }
                      courses={
                        allCourses.map(
                          (
                            course
                          ) => ({
                            id:
                              course.id,

                            title:
                              course.title,
                          })
                        )
                      }
                      enrollments={
                        []
                      }
                    />

                  </article>
                )
              )}

            </div>

          </details>
        )}

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

      {
        icon
      }

      <p className="mt-4 text-sm text-gray-500">
        {
          label
        }
      </p>

      <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
        {
          value
        }
      </p>

    </div>
  )
}