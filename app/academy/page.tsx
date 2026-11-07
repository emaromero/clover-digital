import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  GraduationCap,
  Lock,
  PlayCircle,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

export default async function AcademyPage() {
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
    data: enrollment,
  } =
    await supabase
      .from("enrollments")
      .select(`
        id,
        status,
        course_id,
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
        user.id
      )
      .eq(
        "status",
        "active"
      )
      .limit(1)
      .maybeSingle()

  if (!enrollment) {
    return (
      <main className="min-h-screen bg-[#f5fafa] px-4 py-12 dark:bg-[#001219] md:py-16">

        <div className="mx-auto max-w-3xl">

          <div className="rounded-3xl border border-gray-200/70 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#06222c] md:p-10">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
              <GraduationCap className="h-7 w-7" />
            </div>

            <p className="mt-6 text-sm font-semibold text-[#0A9396]">
              Clover Academy
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Todavía no tenés cursos
            </h1>

            <p className="mt-3 max-w-xl leading-7 text-gray-600 dark:text-gray-300">
              Cuando te inscribas en un curso de Clover Academy, vas a poder acceder a tus clases, progreso y material desde acá.
            </p>

            <Link
              href="/cuenta"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0A9396] hover:underline"
            >
              ← Volver a mi cuenta
            </Link>

          </div>

        </div>

      </main>
    )
  }

  const course =
    Array.isArray(
      enrollment.courses
    )
      ? enrollment
          .courses[0]
      : enrollment.courses

  if (!course) {
    redirect("/cuenta")
  }

  const {
    data: modules,
  } =
    await supabase
      .from("modules")
      .select(`
        id,
        title,
        description,
        position,
        lessons (
          id,
          title,
          description,
          video_url,
          duration_seconds,
          position,
          is_published
        )
      `)
      .eq(
        "course_id",
        course.id
      )
      .order(
        "position",
        {
          ascending: true,
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
        lesson_id,
        completed,
        last_position_seconds
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

  const allLessons =
    orderedModules.flatMap(
      (module) =>
        module.lessons
    )

  const totalLessons =
    allLessons.length

  const completedLessons =
    allLessons.filter(
      (lesson) =>
        progressMap.get(
          lesson.id
        )?.completed ===
        true
    ).length

  const remainingLessons =
    Math.max(
      totalLessons -
        completedLessons,
      0
    )

  const percentage =
    totalLessons > 0
      ? Math.round(
          (completedLessons /
            totalLessons) *
            100
        )
      : 0

  const firstIncompleteLesson =
    allLessons.find(
      (lesson) =>
        progressMap.get(
          lesson.id
        )?.completed !==
        true
    )

  const completedModules =
    orderedModules.filter(
      (module) =>
        module.lessons.length >
          0 &&
        module.lessons.every(
          (lesson) =>
            progressMap.get(
              lesson.id
            )?.completed ===
            true
        )
    ).length

  const totalModules =
    orderedModules.length

  let previousModulesCompleted =
    true

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <Link
            href="/cuenta"
            className="text-sm font-medium text-[#0A9396] hover:underline"
          >
            ← Mi cuenta
          </Link>

          <span className="rounded-full bg-[#0A9396]/10 px-3 py-1 text-xs font-semibold text-[#0A9396]">
            Clover Academy
          </span>

        </div>

        {/* CABECERA DEL CURSO */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#06222c]">

          <div
            className={
              course.cover_url
                ? "grid lg:grid-cols-[1.1fr_0.9fr]"
                : ""
            }
          >

            <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">

              <p className="text-sm font-semibold text-[#0A9396]">
                Tu curso
              </p>

              <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
                {course.title}
              </h1>

              {course.description && (
                <p className="mt-4 max-w-2xl leading-7 text-gray-600 dark:text-gray-300">
                  {
                    course.description
                  }
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3 text-sm">

                <span className="rounded-full bg-[#0A9396]/10 px-3 py-1.5 font-semibold text-[#0A9396]">
                  {totalModules}{" "}
                  {totalModules ===
                  1
                    ? "módulo"
                    : "módulos"}
                </span>

                <span className="rounded-full bg-gray-100 px-3 py-1.5 font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                  {totalLessons}{" "}
                  {totalLessons ===
                  1
                    ? "clase"
                    : "clases"}
                </span>

              </div>

            </div>

            {course.cover_url && (
              <div className="aspect-[16/9] bg-gray-100 lg:aspect-auto lg:min-h-[340px]">

                <img
                  src={
                    course.cover_url
                  }
                  alt={`Portada de ${course.title}`}
                  className="h-full w-full object-cover"
                />

              </div>
            )}

          </div>

        </section>

        {/* PROGRESO */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#06222c]">

          <div className="grid lg:grid-cols-[1fr_320px]">

            <div className="p-6 md:p-8">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Tu progreso
                  </p>

                  <p className="mt-1 text-4xl font-bold text-gray-900 dark:text-white">
                    {percentage}%
                  </p>

                </div>

                <div className="grid grid-cols-2 gap-5 text-sm sm:text-right">

                  <div>

                    <p className="text-gray-400">
                      Clases
                    </p>

                    <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                      {completedLessons}/{totalLessons}
                    </p>

                  </div>

                  <div>

                    <p className="text-gray-400">
                      Módulos
                    </p>

                    <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                      {completedModules}/{totalModules}
                    </p>

                  </div>

                </div>

              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">

                <div
                  className="h-full rounded-full bg-[#0A9396]"
                  style={{
                    width: `${percentage}%`,
                  }}
                />

              </div>

              <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-500">

                <span>
                  {completedLessons} completadas
                </span>

                <span>
                  {remainingLessons} por completar
                </span>

              </div>

            </div>

            <div className="border-t border-gray-100 bg-[#0A9396]/5 p-6 dark:border-white/10 dark:bg-[#0A9396]/10 md:p-8 lg:border-l lg:border-t-0">

              {firstIncompleteLesson ? (
                <>

                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0A9396]">
                    Próxima clase
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                    {
                      firstIncompleteLesson.title
                    }
                  </h2>

                  {firstIncompleteLesson.duration_seconds && (
                    <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">

                      <Clock3 className="h-4 w-4" />

                      {Math.ceil(
                        firstIncompleteLesson.duration_seconds /
                          60
                      )}{" "}
                      min

                    </div>
                  )}

                  {firstIncompleteLesson.video_url ? (
                    <Link
                      href={`/academy/clase/${firstIncompleteLesson.id}`}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219]"
                    >
                      Continuar curso

                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <p className="mt-5 text-sm text-gray-400">
                      Video próximamente
                    </p>
                  )}

                </>
              ) : totalLessons > 0 ? (
                <>

                  <CheckCircle2 className="h-8 w-8 text-[#0A9396]" />

                  <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                    ¡Completaste todas las clases!
                  </h2>

                </>
              ) : (
                <>

                  <BookOpen className="h-8 w-8 text-[#0A9396]" />

                  <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                    Contenido próximamente
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Todavía no hay clases publicadas.
                  </p>

                </>
              )}

            </div>

          </div>

        </section>

        {/* MÓDULOS */}
        <section className="mt-10">

          <div>

            <p className="text-sm font-semibold text-[#0A9396]">
              Contenido
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              Módulos y clases
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Completá cada módulo para desbloquear el siguiente.
            </p>

          </div>

          {orderedModules.length ===
          0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#06222c]">

              <BookOpen className="mx-auto h-8 w-8 text-gray-300" />

              <p className="mt-3 text-gray-500">
                Todavía no hay clases publicadas.
              </p>

            </div>
          ) : (
            <div className="mt-5 space-y-5">

              {orderedModules.map(
                (
                  module,
                  moduleIndex
                ) => {
                  const moduleLessons =
                    module.lessons

                  const completedInModule =
                    moduleLessons.filter(
                      (lesson) =>
                        progressMap.get(
                          lesson.id
                        )?.completed ===
                        true
                    ).length

                  const moduleCompleted =
                    completedInModule ===
                    moduleLessons.length

                  const moduleLocked =
                    moduleIndex >
                      0 &&
                    !previousModulesCompleted

                  previousModulesCompleted =
                    previousModulesCompleted &&
                    moduleCompleted

                  const modulePercentage =
                    Math.round(
                      (completedInModule /
                        moduleLessons.length) *
                        100
                    )

                  return (
                    <article
                      key={
                        module.id
                      }
                      className={`overflow-hidden rounded-3xl border bg-white dark:bg-[#06222c] ${
                        moduleLocked
                          ? "border-gray-200/60 opacity-70 dark:border-white/5"
                          : moduleCompleted
                            ? "border-[#0A9396]/30 dark:border-[#0A9396]/30"
                            : "border-gray-200/70 dark:border-white/10"
                      }`}
                    >

                      <div className="p-6 md:p-8">

                        <div className="flex items-start gap-4">

                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                              moduleCompleted
                                ? "bg-[#0A9396] text-white"
                                : moduleLocked
                                  ? "bg-gray-100 text-gray-400 dark:bg-white/5"
                                  : "bg-[#0A9396]/10 text-[#0A9396]"
                            }`}
                          >

                            {moduleLocked ? (
                              <Lock className="h-5 w-5" />
                            ) : moduleCompleted ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <BookOpen className="h-5 w-5" />
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center justify-between gap-3">

                              <div>

                                <p className="text-xs font-semibold uppercase text-[#0A9396]">
                                  Módulo{" "}
                                  {module.position}
                                </p>

                                <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                                  {module.title}
                                </h3>

                              </div>

                              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                {modulePercentage}%
                              </p>

                            </div>

                            {module.description && (
                              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                {
                                  module.description
                                }
                              </p>
                            )}

                            <p className="mt-3 text-sm text-gray-500">
                              {completedInModule} de{" "}
                              {moduleLessons.length} clases
                            </p>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">

                              <div
                                className="h-full rounded-full bg-[#0A9396]"
                                style={{
                                  width: `${modulePercentage}%`,
                                }}
                              />

                            </div>

                          </div>

                        </div>

                      </div>

                      <div className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-white/10 dark:border-white/10">

                        {moduleLessons.map(
                          (lesson) => {
                            const completed =
                              progressMap.get(
                                lesson.id
                              )?.completed ===
                              true

                            const canOpen =
                              !moduleLocked &&
                              Boolean(
                                lesson.video_url
                              )

                            const content = (
                              <>

                                <div className="shrink-0">

                                  {moduleLocked ? (
                                    <Lock className="h-5 w-5 text-gray-400" />
                                  ) : completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-[#0A9396]" />
                                  ) : lesson.video_url ? (
                                    <PlayCircle className="h-5 w-5 text-[#0A9396]" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                                  )}

                                </div>

                                <div className="min-w-0 flex-1">

                                  <p className="font-medium text-gray-800 dark:text-gray-100">
                                    {lesson.position}.{" "}
                                    {lesson.title}
                                  </p>

                                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">

                                    {lesson.duration_seconds && (
                                      <span className="inline-flex items-center gap-1">

                                        <Clock3 className="h-3.5 w-3.5" />

                                        {Math.ceil(
                                          lesson.duration_seconds /
                                            60
                                        )}{" "}
                                        min

                                      </span>
                                    )}

                                    {!lesson.video_url && (
                                      <span>
                                        Video próximamente
                                      </span>
                                    )}

                                  </div>

                                </div>

                                {!moduleLocked && (
                                  <span className="text-xs font-semibold text-[#0A9396]">

                                    {completed
                                      ? "Completada"
                                      : lesson.video_url
                                        ? "Abrir"
                                        : "Pendiente"}

                                  </span>
                                )}

                              </>
                            )

                            return canOpen ? (
                              <Link
                                key={
                                  lesson.id
                                }
                                href={`/academy/clase/${lesson.id}`}
                                className="flex items-center gap-4 px-6 py-4 transition hover:bg-[#0A9396]/5 md:px-8"
                              >
                                {content}
                              </Link>
                            ) : (
                              <div
                                key={
                                  lesson.id
                                }
                                className="flex items-center gap-4 px-6 py-4 md:px-8"
                              >
                                {content}
                              </div>
                            )
                          }
                        )}

                      </div>

                    </article>
                  )
                }
              )}

            </div>
          )}

        </section>

        <p className="mt-10 text-center text-xs text-gray-400">
          Campus privado · Clover Academy
        </p>

      </div>

    </main>
  )
}