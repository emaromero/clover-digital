import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowLeft,
  BookOpen,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import AcademyContentManager from "@/components/academy-content-manager"

export default async function AdminAcademyContentPage() {
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
            position
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
      (
        course
      ) => ({
        ...course,

        modules: [
          ...(
            course.modules ||
            []
          ),
        ]
          .sort(
            (
              a,
              b
            ) =>
              a.position -
              b.position
          )
          .map(
            (
              module
            ) => ({
              ...module,

              lessons: [
                ...(
                  module.lessons ||
                  []
                ),
              ].sort(
                (
                  a,
                  b
                ) =>
                  a.position -
                  b.position
              ),
            })
          ),
      })
    )

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

          <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
            Creá y editá módulos, clases, duraciones y enlaces de video desde el panel.
          </p>

        </div>

        <div className="mt-8">

          <AcademyContentManager
            courses={
              preparedCourses
            }
          />

        </div>

      </div>

    </main>
  )
}