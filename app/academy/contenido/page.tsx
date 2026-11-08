import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowLeft,
  BookOpen,
  Settings2,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

import AcademyContentManager from "@/components/academy-content-manager"
import AcademyCourseSettings from "@/components/academy-course-settings"

interface PageProps {
  searchParams: Promise<{
    course?: string
  }>
}

export default async function AdminAcademyContentPage({
  searchParams,
}: PageProps) {
  const params =
    await searchParams

  const requestedCourseId =
    params.course || ""

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
    data: courses,
    error,
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
          course_id,
          title,
          description,
          position,
          lessons (
            id,
            module_id,
            title,
            description,
            video_url,
            duration_seconds,
            position,
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

  if (error) {
    console.error(
      "Error cargando contenido Academy:",
      error
    )
  }

  const preparedCourses =
    (courses || []).map(
      (course) => ({
        ...course,

        modules: [
          ...(course.modules ||
            []),
        ]
          .sort(
            (a, b) =>
              a.position -
              b.position
          )
          .map(
            (module) => ({
              ...module,

              lessons: [
                ...(module.lessons ||
                  []),
              ].sort(
                (a, b) =>
                  a.position -
                  b.position
              ),
            })
          ),
      })
    )

  /*
   * Si llegamos desde:
   * /admin/academy/contenido?course=<id>
   *
   * ponemos ese curso primero.
   *
   * Los componentes de edición ya seleccionan
   * courses[0] por defecto, así que de esta forma
   * abren directamente el curso correcto sin
   * duplicar estado ni lógica.
   */
  const orderedCourses =
    requestedCourseId &&
    preparedCourses.some(
      (course) =>
        course.id ===
        requestedCourseId
    )
      ? [
          ...preparedCourses.filter(
            (course) =>
              course.id ===
              requestedCourseId
          ),

          ...preparedCourses.filter(
            (course) =>
              course.id !==
              requestedCourseId
          ),
        ]
      : preparedCourses

  const basicCourses =
    orderedCourses.map(
      (course) => ({
        id:
          course.id,

        title:
          course.title,

        slug:
          course.slug,

        description:
          course.description,

        cover_url:
          course.cover_url,
      })
    )

  const selectedCourse =
    orderedCourses[0] ||
    null

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

        <div className="mt-8">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
            <BookOpen className="h-6 w-6" />
          </div>

          <p className="mt-6 text-sm font-semibold text-[#0A9396]">
            Clover Academy
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Contenido del curso
          </h1>

          {selectedCourse ? (
            <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
              Estás administrando{" "}
              <strong className="font-semibold text-gray-700 dark:text-gray-200">
                {selectedCourse.title}
              </strong>
              . Desde acá podés editar su portada, información general, módulos, clases, videos y publicación.
            </p>
          ) : (
            <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
              Administrá la portada, información general, módulos, clases, videos y publicación del curso.
            </p>
          )}

        </div>

        {/* INFORMACIÓN GENERAL */}
        <section className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
              <Settings2 className="h-5 w-5" />
            </div>

            <div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Información general
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Editá la portada, el nombre y la descripción que ven los alumnos.
              </p>

            </div>

          </div>

          <div className="mt-6">

            <AcademyCourseSettings
              courses={
                basicCourses
              }
            />

          </div>

        </section>

        {/* ESTRUCTURA */}
        <div className="mt-8">

          <div className="mb-5">

            <p className="text-sm font-semibold text-[#0A9396]">
              Estructura
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              Módulos y clases
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Prepará las clases como borrador y publicalas cuando estén listas.
            </p>

          </div>

          <AcademyContentManager
            courses={
              orderedCourses
            }
          />

        </div>

      </div>

    </main>
  )
}