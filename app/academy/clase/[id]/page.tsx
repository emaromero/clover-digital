import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  PlayCircle,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import LessonActions from "@/components/lesson-actions"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LessonPage({
  params,
}: PageProps) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  // CLASE
  const { data: lesson } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      description,
      video_url,
      duration_seconds,
      position,
      module_id,
      modules (
        id,
        title,
        position,
        course_id,
        courses (
          id,
          title,
          slug
        )
      )
    `)
    .eq("id", id)
    .maybeSingle()

  if (!lesson) {
    notFound()
  }

  const moduleData = Array.isArray(lesson.modules)
    ? lesson.modules[0]
    : lesson.modules

  if (!moduleData) {
    notFound()
  }

  const courseData = Array.isArray(moduleData.courses)
    ? moduleData.courses[0]
    : moduleData.courses

  if (!courseData) {
    notFound()
  }

  // VERIFICAR INSCRIPCIÓN
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("course_id", courseData.id)
    .eq("status", "active")
    .maybeSingle()

  if (!enrollment) {
    redirect("/academy")
  }

  // TODOS LOS MÓDULOS DEL CURSO
  const { data: modules } = await supabase
    .from("modules")
    .select(`
      id,
      title,
      position,
      lessons (
        id,
        title,
        position
      )
    `)
    .eq("course_id", courseData.id)
    .order("position", {
      ascending: true,
    })

  const orderedModules = (modules || [])
    .map((module) => ({
      ...module,
      lessons: [...(module.lessons || [])].sort(
        (a, b) => a.position - b.position
      ),
    }))
    .sort((a, b) => a.position - b.position)

  const allLessons = orderedModules.flatMap(
    (module) => module.lessons
  )

  // PROGRESO
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select(`
      lesson_id,
      completed,
      completed_at,
      updated_at
    `)
    .eq("user_id", user.id)

  const progressMap = new Map(
    (progress || []).map((item) => [
      item.lesson_id,
      item,
    ])
  )

  // BLOQUEO POR MÓDULO
  const currentModuleIndex =
    orderedModules.findIndex(
      (module) => module.id === moduleData.id
    )

  const previousModules =
    currentModuleIndex > 0
      ? orderedModules.slice(0, currentModuleIndex)
      : []

  const previousModulesCompleted =
    previousModules.every((module) =>
      module.lessons.every(
        (moduleLesson) =>
          progressMap.get(moduleLesson.id)?.completed === true
      )
    )

  if (
    currentModuleIndex > 0 &&
    !previousModulesCompleted
  ) {
    redirect("/academy")
  }

  // REGISTRAR ACTIVIDAD
  const existingProgress =
    progressMap.get(lesson.id)

  const now = new Date().toISOString()

  if (!existingProgress) {
    await supabase
      .from("lesson_progress")
      .insert({
        user_id: user.id,
        lesson_id: lesson.id,
        completed: false,
        last_position_seconds: 0,
        updated_at: now,
      })
  } else {
    await supabase
      .from("lesson_progress")
      .update({
        updated_at: now,
      })
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id)
  }

  const currentLessonIndex =
    allLessons.findIndex(
      (item) => item.id === lesson.id
    )

  const previousLesson =
    currentLessonIndex > 0
      ? allLessons[currentLessonIndex - 1]
      : null

  const nextLesson =
    currentLessonIndex >= 0 &&
    currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null

  const completed =
    existingProgress?.completed === true

  const totalLessons = allLessons.length

  const completedLessons = allLessons.filter(
    (item) =>
      progressMap.get(item.id)?.completed === true
  ).length

  const percentage =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100
        )
      : 0

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">

        <Link
          href="/academy"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al curso
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* CONTENIDO */}
          <div className="space-y-6">

            {/* VIDEO */}
            <section className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#06222c]">
              {lesson.video_url ? (
                <div className="aspect-video bg-black">
                  <iframe
                    src={lesson.video_url}
                    title={lesson.title}
                    className="h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center bg-[#001219] px-6 text-center text-white">
                  <PlayCircle className="h-14 w-14 text-[#94D2BD]" />

                  <p className="mt-4 text-lg font-semibold">
                    Video próximamente
                  </p>

                  <p className="mt-2 max-w-md text-sm text-white/60">
                    Esta clase ya forma parte del campus,
                    pero todavía no tiene un video cargado.
                  </p>
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#0A9396]">
                  <span>
                    Módulo {moduleData.position}
                  </span>

                  <span>·</span>

                  <span>
                    Clase {lesson.position}
                  </span>

                  {lesson.duration_seconds && (
                    <>
                      <span>·</span>

                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {Math.ceil(
                          lesson.duration_seconds / 60
                        )}{" "}
                        min
                      </span>
                    </>
                  )}
                </div>

                <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                  {lesson.title}
                </h1>

                {lesson.description && (
                  <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-300">
                    {lesson.description}
                  </p>
                )}
              </div>
            </section>

            {/* ACCIONES */}
            <section className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#06222c] md:p-8">
              <LessonActions
                userId={user.id}
                lessonId={lesson.id}
                completed={completed}
                previousLessonId={
                  previousLesson?.id || null
                }
                nextLessonId={
                  nextLesson?.id || null
                }
              />
            </section>
          </div>

          {/* LATERAL */}
          <aside className="space-y-5">

            <section className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0A9396]">
                Tu progreso
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
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

              <p className="mt-3 text-sm text-gray-500">
                {completedLessons} de {totalLessons} clases
                completadas
              </p>
            </section>

            <section className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396]">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Curso
                  </p>

                  <p className="font-semibold text-gray-900 dark:text-white">
                    {courseData.title}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-5 dark:border-white/10">
                <p className="text-xs text-gray-500">
                  Módulo actual
                </p>

                <p className="mt-1 font-medium text-gray-800 dark:text-gray-200">
                  {moduleData.title}
                </p>
              </div>
            </section>

            {completed && (
              <div className="flex items-center gap-2 rounded-2xl bg-[#0A9396]/10 p-4 text-sm font-semibold text-[#0A9396]">
                <CheckCircle2 className="h-5 w-5" />
                Clase completada
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}