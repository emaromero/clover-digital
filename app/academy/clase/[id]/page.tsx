import Link from "next/link"
import {
  notFound,
  redirect,
} from "next/navigation"

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
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
    data: lesson,
  } =
    await supabase
      .from("lessons")
      .select(`
        id,
        title,
        description,
        video_url,
        duration_seconds,
        position,
        module_id,
        is_published,
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
      .eq(
        "id",
        id
      )
      .maybeSingle()

  if (
    !lesson ||
    lesson.is_published !==
      true
  ) {
    notFound()
  }

  const moduleData =
    Array.isArray(
      lesson.modules
    )
      ? lesson.modules[0]
      : lesson.modules

  if (!moduleData) {
    notFound()
  }

  const courseData =
    Array.isArray(
      moduleData.courses
    )
      ? moduleData.courses[0]
      : moduleData.courses

  if (!courseData) {
    notFound()
  }

  const courseUrl =
    `/academy?course=${courseData.id}`

  const {
    data: enrollment,
  } =
    await supabase
      .from("enrollments")
      .select(
        "id, status"
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "course_id",
        courseData.id
      )
      .eq(
        "status",
        "active"
      )
      .maybeSingle()

  if (!enrollment) {
    redirect("/academy")
  }

  const {
    data: modules,
  } =
    await supabase
      .from("modules")
      .select(`
        id,
        title,
        position,
        lessons (
          id,
          title,
          position,
          is_published
        )
      `)
      .eq(
        "course_id",
        courseData.id
      )
      .order(
        "position",
        {
          ascending: true,
        }
      )

  const orderedModules =
    (modules || [])
      .map(
        (module) => ({
          ...module,

          lessons: [
            ...(module.lessons ||
              []),
          ]
            .filter(
              (item) =>
                item.is_published ===
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

  const allLessons =
    orderedModules.flatMap(
      (module) =>
        module.lessons
    )

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
        updated_at
      `)
      .eq(
        "user_id",
        user.id
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

  const currentModuleIndex =
    orderedModules.findIndex(
      (module) =>
        module.id ===
        moduleData.id
    )

  if (
    currentModuleIndex <
    0
  ) {
    notFound()
  }

  const previousModules =
    currentModuleIndex > 0
      ? orderedModules.slice(
          0,
          currentModuleIndex
        )
      : []

  const previousModulesCompleted =
    previousModules.every(
      (module) =>
        module.lessons.every(
          (moduleLesson) =>
            progressMap.get(
              moduleLesson.id
            )?.completed ===
            true
        )
    )

  if (
    currentModuleIndex >
      0 &&
    !previousModulesCompleted
  ) {
    redirect(
      courseUrl
    )
  }

  const existingProgress =
    progressMap.get(
      lesson.id
    )

  const now =
    new Date().toISOString()

  if (
    !existingProgress
  ) {
    await supabase
      .from(
        "lesson_progress"
      )
      .insert({
        user_id:
          user.id,

        lesson_id:
          lesson.id,

        completed:
          false,

        last_position_seconds:
          0,

        updated_at:
          now,
      })
  } else {
    await supabase
      .from(
        "lesson_progress"
      )
      .update({
        updated_at:
          now,
      })
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "lesson_id",
        lesson.id
      )
  }

  const currentLessonIndex =
    allLessons.findIndex(
      (item) =>
        item.id ===
        lesson.id
    )

  const previousLesson =
    currentLessonIndex > 0
      ? allLessons[
          currentLessonIndex -
            1
        ]
      : null

  const nextLesson =
    currentLessonIndex >=
      0 &&
    currentLessonIndex <
      allLessons.length - 1
      ? allLessons[
          currentLessonIndex +
            1
        ]
      : null

  const completed =
    existingProgress?.completed ===
    true

  const totalLessons =
    allLessons.length

  const completedLessons =
    allLessons.filter(
      (item) =>
        progressMap.get(
          item.id
        )?.completed ===
        true
    ).length

  const percentage =
    totalLessons > 0
      ? Math.round(
          (completedLessons /
            totalLessons) *
            100
        )
      : 0

  const currentNumber =
    currentLessonIndex >=
    0
      ? currentLessonIndex +
        1
      : lesson.position

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <Link
            href={
              courseUrl
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al curso
          </Link>

          <span className="rounded-full bg-[#0A9396]/10 px-3 py-1 text-xs font-semibold text-[#0A9396]">
            Clover Academy
          </span>

        </div>

        <section className="mt-6 rounded-2xl border border-gray-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#06222c] lg:hidden">

          <div className="flex justify-between">

            <div>

              <p className="text-xs text-gray-400">
                Tu progreso
              </p>

              <p className="mt-1 text-2xl font-bold">
                {percentage}%
              </p>

            </div>

            <p className="text-sm font-semibold">
              {completedLessons}/{totalLessons}
            </p>

          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">

            <div
              className="h-full rounded-full bg-[#0A9396]"
              style={{
                width: `${percentage}%`,
              }}
            />

          </div>

        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

          <div className="space-y-6">

            <section className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

              {lesson.video_url ? (
                <div className="aspect-video bg-black">

                  <iframe
                    src={
                      lesson.video_url
                    }
                    title={
                      lesson.title
                    }
                    className="h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />

                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center bg-[#001219] text-white">

                  <PlayCircle className="h-14 w-14 text-[#94D2BD]" />

                  <p className="mt-4 font-semibold">
                    Video próximamente
                  </p>

                </div>
              )}

              <div className="p-6 md:p-8">

                <div className="flex flex-wrap gap-2 text-xs font-semibold">

                  <span className="rounded-full bg-[#0A9396]/10 px-2.5 py-1 text-[#0A9396]">
                    Módulo{" "}
                    {moduleData.position}
                  </span>

                  <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/5">
                    Clase{" "}
                    {lesson.position}
                  </span>

                  {lesson.duration_seconds && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/5">

                      <Clock3 className="h-3.5 w-3.5" />

                      {Math.ceil(
                        lesson.duration_seconds /
                          60
                      )}{" "}
                      min

                    </span>
                  )}

                  {completed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">

                      <CheckCircle2 className="h-3.5 w-3.5" />

                      Completada

                    </span>
                  )}

                </div>

                <p className="mt-5 text-sm font-semibold text-[#0A9396]">
                  {courseData.title}
                </p>

                <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                  {lesson.title}
                </h1>

                {lesson.description && (
                  <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
                    {
                      lesson.description
                    }
                  </p>
                )}

              </div>

            </section>

            <section className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

              <LessonActions
                userId={
                  user.id
                }
                lessonId={
                  lesson.id
                }
                completed={
                  completed
                }
                previousLessonId={
                  previousLesson?.id ||
                  null
                }
                nextLessonId={
                  nextLesson?.id ||
                  null
                }
              />

            </section>

          </div>

          <aside className="hidden lg:block">

            <section className="sticky top-24 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

              <p className="text-xs font-semibold uppercase text-[#0A9396]">
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
                {completedLessons} de{" "}
                {totalLessons} clases
              </p>

              <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/10">

                <GraduationCap className="h-5 w-5 text-[#0A9396]" />

                <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                  {courseData.title}
                </p>

              </div>

              <div className="mt-5 border-t border-gray-100 pt-5 dark:border-white/10">

                <BookOpen className="h-5 w-5 text-[#0A9396]" />

                <p className="mt-2 font-medium text-gray-800 dark:text-gray-200">
                  {moduleData.title}
                </p>

              </div>

              <p className="mt-5 text-sm text-gray-500">
                Clase {currentNumber} de{" "}
                {totalLessons}
              </p>

            </section>

          </aside>

        </div>

      </div>

    </main>
  )
}