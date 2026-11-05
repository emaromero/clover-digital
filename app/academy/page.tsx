import Link from "next/link"
import { redirect } from "next/navigation"
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  Lock,
  PlayCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function AcademyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select(`
      id,
      status,
      course_id,
      courses (
        id,
        title,
        slug,
        description
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (!enrollment) {
    return (
      <main className="min-h-screen bg-[#B8D8D8]/30 dark:bg-[#001219] px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-8 shadow-xl">
            <p className="text-sm font-medium text-[#0A9396] mb-2">
              Clover Academy
            </p>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Todavía no tenés cursos
            </h1>

            <p className="mt-3 text-gray-600 dark:text-gray-300">
              Cuando te inscribas a un curso, vas a poder acceder desde acá.
            </p>

            <Link
              href="/cuenta"
              className="inline-block mt-8 text-sm text-[#0A9396] hover:underline"
            >
              ← Volver a mi cuenta
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const course = Array.isArray(enrollment.courses)
    ? enrollment.courses[0]
    : enrollment.courses

  if (!course) {
    redirect("/cuenta")
  }

  const { data: modules } = await supabase
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
        position
      )
    `)
    .eq("course_id", course.id)
    .order("position", { ascending: true })

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed, last_position_seconds")
    .eq("user_id", user.id)

  const progressMap = new Map(
    (progress || []).map((item) => [
      item.lesson_id,
      item,
    ])
  )

  const orderedModules = (modules || []).map((module) => ({
    ...module,
    lessons: [...(module.lessons || [])].sort(
      (a, b) => a.position - b.position
    ),
  }))

  const allLessons = orderedModules.flatMap(
    (module) => module.lessons
  )

  const completedLessons = allLessons.filter(
    (lesson) =>
      progressMap.get(lesson.id)?.completed === true
  ).length

  const totalLessons = allLessons.length

  const percentage =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100
        )
      : 0

  const firstIncompleteLesson = allLessons.find(
    (lesson) =>
      !progressMap.get(lesson.id)?.completed
  )

  let previousModulesCompleted = true

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">

        {/* CABECERA */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/cuenta"
              className="text-sm text-[#0A9396] hover:underline"
            >
              ← Mi cuenta
            </Link>

            <span className="rounded-full bg-[#0A9396]/10 px-3 py-1 text-xs font-semibold text-[#0A9396]">
              Clover Academy
            </span>
          </div>

          <div className="mt-8 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {course.title}
            </h1>

            {course.description && (
              <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                {course.description}
              </p>
            )}
          </div>
        </div>

        {/* PROGRESO */}
        <div className="rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-6 md:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tu progreso
              </p>

              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {percentage}%
              </p>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              {completedLessons} de {totalLessons} clases completadas
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-[#0A9396] transition-all"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>

          {firstIncompleteLesson && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Próxima clase:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {firstIncompleteLesson.title}
              </span>
            </p>
          )}
        </div>

        {/* MÓDULOS */}
        <div className="space-y-6">
          {orderedModules.map((module, moduleIndex) => {
            const moduleLessons = module.lessons

            const completedInModule =
              moduleLessons.filter(
                (lesson) =>
                  progressMap.get(lesson.id)?.completed
              ).length

            const moduleCompleted =
              moduleLessons.length > 0 &&
              completedInModule === moduleLessons.length

            const moduleLocked =
              moduleIndex > 0 &&
              !previousModulesCompleted

            const currentPreviousState =
              previousModulesCompleted

            previousModulesCompleted =
              currentPreviousState &&
              moduleCompleted

            return (
              <section
                key={module.id}
                className={`
                  rounded-3xl
                  border
                  bg-white
                  dark:bg-[#06222c]
                  overflow-hidden
                  ${
                    moduleLocked
                      ? "border-gray-200/60 dark:border-white/5 opacity-70"
                      : "border-gray-200/70 dark:border-white/10"
                  }
                `}
              >
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-start gap-4">

                    <div
                      className={`
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        ${
                          moduleCompleted
                            ? "bg-[#0A9396] text-white"
                            : moduleLocked
                            ? "bg-gray-100 dark:bg-white/5 text-gray-400"
                            : "bg-[#0A9396]/10 text-[#0A9396]"
                        }
                      `}
                    >
                      {moduleCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : moduleLocked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <BookOpen className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#0A9396]">
                        Módulo {module.position}
                      </p>

                      <h2 className="mt-1 text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        {module.title}
                      </h2>

                      {module.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {module.description}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-gray-500">
                        {completedInModule} de{" "}
                        {moduleLessons.length} clases
                      </p>
                    </div>
                  </div>
                </div>

                {/* CLASES */}
                <div className="divide-y divide-gray-100 dark:divide-white/10">
                  {moduleLessons.map((lesson) => {
                    const lessonProgress =
                      progressMap.get(lesson.id)

                    const completed =
                      lessonProgress?.completed === true

                    const hasVideo = Boolean(lesson.video_url)

                    const canOpen =
                      !moduleLocked && hasVideo

                    const lessonContent = (
                      <>
                        <div className="shrink-0">
                          {moduleLocked ? (
                            <Lock className="w-5 h-5 text-gray-400" />
                          ) : completed ? (
                            <CheckCircle2 className="w-5 h-5 text-[#0A9396]" />
                          ) : hasVideo ? (
                            <PlayCircle className="w-5 h-5 text-[#0A9396]" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`
                              font-medium
                              ${
                                moduleLocked
                                  ? "text-gray-400"
                                  : "text-gray-800 dark:text-gray-100"
                              }
                            `}
                          >
                            {lesson.position}. {lesson.title}
                          </p>

                          {lesson.duration_seconds ? (
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                              <Clock3 className="w-3.5 h-3.5" />
                              {Math.ceil(
                                lesson.duration_seconds / 60
                              )}{" "}
                              min
                            </div>
                          ) : hasVideo ? (
                            <p className="mt-1 text-xs text-[#0A9396]">
                              Ver clase
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-gray-400">
                              Video próximamente
                            </p>
                          )}
                        </div>

                        {!moduleLocked && (
                          <span className="text-xs font-medium text-[#0A9396]">
                            {completed
                              ? "Completada"
                              : hasVideo
                              ? "Abrir"
                              : "Pendiente"}
                          </span>
                        )}
                      </>
                    )

                    if (canOpen) {
                      return (
                        <Link
                          key={lesson.id}
                          href={`/academy/clase/${lesson.id}`}
                          className="
                            flex
                            items-center
                            gap-4
                            px-6
                            md:px-8
                            py-4
                            transition-colors
                            hover:bg-[#0A9396]/5
                            cursor-pointer
                          "
                        >
                          {lessonContent}
                        </Link>
                      )
                    }

                    return (
                      <div
                        key={lesson.id}
                        className="
                          flex
                          items-center
                          gap-4
                          px-6
                          md:px-8
                          py-4
                        "
                      >
                        {lessonContent}
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Campus privado · Clover Academy
        </div>
      </div>
    </main>
  )
}