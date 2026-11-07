import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
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
   * USUARIOS
   */
  const {
    data: profiles,
    error: profilesError,
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
    error: coursesError,
  } =
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

  /*
   * INSCRIPCIONES
   */
  const {
    data: enrollments,
    error: enrollmentsError,
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
   * CLASES
   */
  const {
    data: lessons,
  } =
    await supabase
      .from("lessons")
      .select(`
        id,
        module_id,
        modules (
          course_id
        )
      `)

  if (
    profilesError
  ) {
    console.error(
      "Error cargando usuarios:",
      profilesError
    )
  }

  if (
    coursesError
  ) {
    console.error(
      "Error cargando cursos:",
      coursesError
    )
  }

  if (
    enrollmentsError
  ) {
    console.error(
      "Error cargando inscripciones:",
      enrollmentsError
    )
  }

  const students =
    profiles || []

  const allCourses =
    courses || []

  const allEnrollments =
    enrollments || []

  const allProgress =
    progress || []

  const allLessons =
    lessons || []

  const activeEnrollments =
    allEnrollments.filter(
      (
        enrollment
      ) =>
        enrollment.status ===
        "active"
    )

  const getCourseFromEnrollment =
    (
      enrollment: any
    ) => {
      if (
        Array.isArray(
          enrollment.courses
        )
      ) {
        return enrollment
          .courses[0]
      }

      return enrollment.courses
    }

  const getModuleFromLesson =
    (
      lesson: any
    ) => {
      if (
        Array.isArray(
          lesson.modules
        )
      ) {
        return lesson
          .modules[0]
      }

      return lesson.modules
    }

  const getActiveEnrollment =
    (
      userId: string
    ) => {
      const enrollment =
        activeEnrollments.find(
          (
            item
          ) =>
            item.user_id ===
            userId
        )

      if (!enrollment) {
        return null
      }

      const course =
        getCourseFromEnrollment(
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

  const calculateProgress =
    (
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

      const courseLessonIds =
        allLessons
          .filter(
            (
              lesson
            ) => {
              const module =
                getModuleFromLesson(
                  lesson
                )

              return (
                module?.course_id ===
                courseId
              )
            }
          )
          .map(
            (
              lesson
            ) =>
              lesson.id
          )

      const completed =
        allProgress.filter(
          (
            item
          ) =>
            item.user_id ===
              userId &&
            item.completed ===
              true &&
            courseLessonIds.includes(
              item.lesson_id
            )
        ).length

      const total =
        courseLessonIds.length

      const percentage =
        total >
        0
          ? Math.round(
              (
                completed /
                total
              ) *
                100
            )
          : 0

      return {
        completed,
        total,
        percentage,
      }
    }

  const totalActive =
    activeEnrollments.length

  const usersWithoutCourse =
    students.filter(
      (
        student
      ) =>
        !activeEnrollments.some(
          (
            enrollment
          ) =>
            enrollment.user_id ===
            student.id
        )
    ).length

  const completedStudents =
    students.filter(
      (
        student
      ) => {
        const enrollment =
          getActiveEnrollment(
            student.id
          )

        if (
          !enrollment
        ) {
          return false
        }

        const result =
          calculateProgress(
            student.id,
            enrollment.course_id
          )

        return (
          result.total >
            0 &&
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

        {/* HEADER */}
        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-sm font-semibold text-[#0A9396]">
              Clover Academy
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
              Alumnos y accesos
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
              Asigná cursos, quitá accesos y revisá el progreso de cada alumno.
            </p>

          </div>

          <Link
            href="/academy"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A9396] hover:underline"
          >
            Ver campus

            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>

        {/* MÉTRICAS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <Users className="h-6 w-6 text-[#0A9396]" />

            <p className="mt-4 text-sm text-gray-500">
              Usuarios
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {
                students.length
              }
            </p>

          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <GraduationCap className="h-6 w-6 text-[#0A9396]" />

            <p className="mt-4 text-sm text-gray-500">
              Accesos activos
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {
                totalActive
              }
            </p>

          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <BookOpen className="h-6 w-6 text-amber-600" />

            <p className="mt-4 text-sm text-gray-500">
              Sin curso
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {
                usersWithoutCourse
              }
            </p>

          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <CheckCircle2 className="h-6 w-6 text-emerald-600" />

            <p className="mt-4 text-sm text-gray-500">
              Completados
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {
                completedStudents
              }
            </p>

          </div>

        </div>

        {/* CURSOS */}
        <section className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex items-center gap-3">

            <GraduationCap className="h-5 w-5 text-[#0A9396]" />

            <div>

              <h2 className="font-bold text-gray-900 dark:text-white">
                Cursos disponibles
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {
                  allCourses.length
                }{" "}
                {allCourses.length ===
                1
                  ? "curso cargado"
                  : "cursos cargados"}
                .
              </p>

            </div>

          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">

            {allCourses.length ===
            0 ? (
              <p className="text-sm text-gray-500">
                Todavía no hay cursos creados.
              </p>
            ) : (
              allCourses.map(
                (
                  course
                ) => (
                  <div
                    key={
                      course.id
                    }
                    className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]"
                  >

                    <p className="font-semibold text-gray-900 dark:text-white">
                      {
                        course.title
                      }
                    </p>

                    {course.description && (
                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {
                          course.description
                        }
                      </p>
                    )}

                  </div>
                )
              )
            )}

          </div>

        </section>

        {/* ALUMNOS */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10 md:p-8">

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Usuarios
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Administrá el acceso a Clover Academy de cada cuenta.
            </p>

          </div>

          {students.length ===
          0 ? (
            <div className="p-10 text-center text-gray-500">
              Todavía no hay usuarios registrados.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">

              {students.map(
                (
                  student
                ) => {
                  const enrollment =
                    getActiveEnrollment(
                      student.id
                    )

                  const progress =
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

                      {/* USUARIO */}
                      <div className="flex min-w-0 items-center gap-4">

                        {student.avatar_url ? (
                          <img
                            src={
                              student.avatar_url
                            }
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396]">

                            <UserRound className="h-5 w-5" />

                          </div>
                        )}

                        <div className="min-w-0">

                          <p className="truncate font-semibold text-gray-900 dark:text-white">
                            {student.full_name ||
                              "Sin nombre"}
                          </p>

                          <p className="mt-1 truncate text-sm text-gray-500">
                            {
                              student.email
                            }
                          </p>

                        </div>

                      </div>

                      {/* PROGRESO */}
                      <div>

                        {enrollment ? (
                          <>

                            <div className="flex items-center justify-between gap-3">

                              <p className="text-xs text-gray-400">
                                Progreso
                              </p>

                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                {
                                  progress.percentage
                                }
                                %
                              </p>

                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">

                              <div
                                className="h-full rounded-full bg-[#0A9396]"
                                style={{
                                  width: `${progress.percentage}%`,
                                }}
                              />

                            </div>

                            <p className="mt-2 text-xs text-gray-500">
                              {
                                progress.completed
                              }{" "}
                              de{" "}
                              {
                                progress.total
                              }{" "}
                              clases completadas
                            </p>

                            <Link
                              href={`/admin/alumnos/${student.id}`}
                              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#0A9396] hover:underline"
                            >
                              Ver detalle

                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>

                          </>
                        ) : (
                          <p className="text-sm text-gray-400">
                            Sin curso activo.
                          </p>
                        )}

                      </div>

                      {/* ACCESO */}
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
                        activeEnrollment={
                          enrollment
                        }
                      />

                    </article>
                  )
                }
              )}

            </div>
          )}

        </section>

      </div>

    </main>
  )
}