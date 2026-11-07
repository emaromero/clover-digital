"use client"

import {
  useMemo,
  useState,
} from "react"

import { useRouter } from "next/navigation"

import {
  BookOpen,
  Check,
  Clock3,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Video,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Lesson {
  id: string
  module_id: string
  title: string
  description: string | null
  video_url: string | null
  duration_seconds: number | null
  position: number
  is_published: boolean
}

interface Module {
  id: string
  course_id: string
  title: string
  description: string | null
  position: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  modules: Module[]
}

interface Props {
  courses: Course[]
}

interface ModuleDraft {
  title: string
  description: string
  position: string
}

interface LessonDraft {
  title: string
  description: string
  video_url: string
  duration_minutes: string
  position: string
}

export default function AcademyContentManager({
  courses,
}: Props) {
  const router =
    useRouter()

  const [
    selectedCourseId,
    setSelectedCourseId,
  ] =
    useState(
      courses[0]?.id || ""
    )

  const [
    loadingKey,
    setLoadingKey,
  ] =
    useState<string | null>(
      null
    )

  const [
    successKey,
    setSuccessKey,
  ] =
    useState<string | null>(
      null
    )

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("")

  const [
    newModuleTitle,
    setNewModuleTitle,
  ] =
    useState("")

  const [
    newModuleDescription,
    setNewModuleDescription,
  ] =
    useState("")

  const [
    moduleDrafts,
    setModuleDrafts,
  ] =
    useState<
      Record<
        string,
        ModuleDraft
      >
    >({})

  const [
    lessonDrafts,
    setLessonDrafts,
  ] =
    useState<
      Record<
        string,
        LessonDraft
      >
    >({})

  const [
    newLessonDrafts,
    setNewLessonDrafts,
  ] =
    useState<
      Record<
        string,
        LessonDraft
      >
    >({})

  const selectedCourse =
    useMemo(
      () =>
        courses.find(
          (course) =>
            course.id ===
            selectedCourseId
        ) ||
        courses[0] ||
        null,
      [
        courses,
        selectedCourseId,
      ]
    )

  const orderedModules =
    useMemo(
      () =>
        [
          ...(
            selectedCourse?.modules ||
            []
          ),
        ].sort(
          (a, b) =>
            a.position -
            b.position
        ),
      [selectedCourse]
    )

  const getModuleDraft = (
    module: Module
  ) =>
    moduleDrafts[
      module.id
    ] || {
      title:
        module.title,

      description:
        module.description ||
        "",

      position:
        String(
          module.position
        ),
    }

  const getLessonDraft = (
    lesson: Lesson
  ) =>
    lessonDrafts[
      lesson.id
    ] || {
      title:
        lesson.title,

      description:
        lesson.description ||
        "",

      video_url:
        lesson.video_url ||
        "",

      duration_minutes:
        lesson.duration_seconds
          ? String(
              Math.ceil(
                lesson.duration_seconds /
                  60
              )
            )
          : "",

      position:
        String(
          lesson.position
        ),
    }

  const getNewLessonDraft = (
    moduleId: string,
    nextPosition: number
  ) =>
    newLessonDrafts[
      moduleId
    ] || {
      title: "",
      description: "",
      video_url: "",
      duration_minutes: "",
      position:
        String(
          nextPosition
        ),
    }

  const showSuccess = (
    key: string
  ) => {
    setSuccessKey(
      key
    )

    window.setTimeout(
      () => {
        setSuccessKey(
          (current) =>
            current === key
              ? null
              : current
        )
      },
      1800
    )
  }

  const createModule =
    async () => {
      if (
        !selectedCourse ||
        !newModuleTitle.trim()
      ) {
        return
      }

      const key =
        "new-module"

      setLoadingKey(key)
      setErrorMessage("")

      const supabase =
        createClient()

      const nextPosition =
        orderedModules.length >
        0
          ? Math.max(
              ...orderedModules.map(
                (module) =>
                  module.position
              )
            ) + 1
          : 1

      const {
        error,
      } =
        await supabase
          .from("modules")
          .insert({
            course_id:
              selectedCourse.id,

            title:
              newModuleTitle.trim(),

            description:
              newModuleDescription.trim() ||
              null,

            position:
              nextPosition,
          })

      if (error) {
        console.error(
          "Error creando módulo:",
          error
        )

        setErrorMessage(
          "No pudimos crear el módulo."
        )

        setLoadingKey(
          null
        )

        return
      }

      setNewModuleTitle("")
      setNewModuleDescription("")
      setLoadingKey(null)

      showSuccess(key)

      router.refresh()
    }

  const saveModule =
    async (
      module: Module
    ) => {
      const draft =
        getModuleDraft(
          module
        )

      if (
        !draft.title.trim()
      ) {
        return
      }

      const key =
        `module-${module.id}`

      setLoadingKey(key)
      setErrorMessage("")

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from("modules")
          .update({
            title:
              draft.title.trim(),

            description:
              draft.description.trim() ||
              null,

            position:
              Math.max(
                Number(
                  draft.position
                ) ||
                  module.position,
                1
              ),
          })
          .eq(
            "id",
            module.id
          )

      if (error) {
        console.error(
          "Error guardando módulo:",
          error
        )

        setErrorMessage(
          "No pudimos guardar el módulo."
        )

        setLoadingKey(
          null
        )

        return
      }

      setLoadingKey(null)

      showSuccess(key)

      router.refresh()
    }

  const createLesson =
    async (
      module: Module
    ) => {
      const orderedLessons =
        [
          ...module.lessons,
        ].sort(
          (a, b) =>
            a.position -
            b.position
        )

      const nextPosition =
        orderedLessons.length >
        0
          ? Math.max(
              ...orderedLessons.map(
                (lesson) =>
                  lesson.position
              )
            ) + 1
          : 1

      const draft =
        getNewLessonDraft(
          module.id,
          nextPosition
        )

      if (
        !draft.title.trim()
      ) {
        return
      }

      const key =
        `new-lesson-${module.id}`

      setLoadingKey(key)
      setErrorMessage("")

      const supabase =
        createClient()

      const minutes =
        Number(
          draft.duration_minutes
        )

      const {
        error,
      } =
        await supabase
          .from("lessons")
          .insert({
            module_id:
              module.id,

            title:
              draft.title.trim(),

            description:
              draft.description.trim() ||
              null,

            video_url:
              draft.video_url.trim() ||
              null,

            duration_seconds:
              minutes > 0
                ? Math.round(
                    minutes *
                      60
                  )
                : null,

            position:
              Math.max(
                Number(
                  draft.position
                ) ||
                  nextPosition,
                1
              ),

            is_published:
              false,
          })

      if (error) {
        console.error(
          "Error creando clase:",
          error
        )

        setErrorMessage(
          "No pudimos crear la clase."
        )

        setLoadingKey(
          null
        )

        return
      }

      setNewLessonDrafts(
        (current) => ({
          ...current,

          [module.id]: {
            title: "",
            description: "",
            video_url: "",
            duration_minutes: "",
            position:
              String(
                nextPosition +
                  1
              ),
          },
        })
      )

      setLoadingKey(null)

      showSuccess(key)

      router.refresh()
    }

  const saveLesson =
    async (
      lesson: Lesson
    ) => {
      const draft =
        getLessonDraft(
          lesson
        )

      if (
        !draft.title.trim()
      ) {
        return
      }

      const key =
        `lesson-${lesson.id}`

      setLoadingKey(key)
      setErrorMessage("")

      const supabase =
        createClient()

      const minutes =
        Number(
          draft.duration_minutes
        )

      const {
        error,
      } =
        await supabase
          .from("lessons")
          .update({
            title:
              draft.title.trim(),

            description:
              draft.description.trim() ||
              null,

            video_url:
              draft.video_url.trim() ||
              null,

            duration_seconds:
              minutes > 0
                ? Math.round(
                    minutes *
                      60
                  )
                : null,

            position:
              Math.max(
                Number(
                  draft.position
                ) ||
                  lesson.position,
                1
              ),
          })
          .eq(
            "id",
            lesson.id
          )

      if (error) {
        console.error(
          "Error guardando clase:",
          error
        )

        setErrorMessage(
          "No pudimos guardar la clase."
        )

        setLoadingKey(
          null
        )

        return
      }

      setLoadingKey(null)

      showSuccess(key)

      router.refresh()
    }

  const togglePublished =
    async (
      lesson: Lesson
    ) => {
      const nextState =
        !lesson.is_published

      const key =
        `publish-${lesson.id}`

      setLoadingKey(key)
      setErrorMessage("")

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from("lessons")
          .update({
            is_published:
              nextState,
          })
          .eq(
            "id",
            lesson.id
          )

      if (error) {
        console.error(
          "Error cambiando publicación:",
          error
        )

        setErrorMessage(
          "No pudimos cambiar el estado de publicación."
        )

        setLoadingKey(
          null
        )

        return
      }

      setLoadingKey(null)

      showSuccess(key)

      router.refresh()
    }

  if (
    courses.length === 0
  ) {
    return (
      <div className="rounded-3xl border border-gray-200/70 bg-white p-8 text-center dark:border-white/10 dark:bg-[#06222c]">
        <BookOpen className="mx-auto h-8 w-8 text-gray-300" />

        <p className="mt-4 font-semibold text-gray-800 dark:text-gray-200">
          No hay cursos creados
        </p>
      </div>
    )
  }

  return (
    <div>
      <section className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Curso
        </label>

        <select
          value={
            selectedCourse?.id ||
            ""
          }
          onChange={(
            event
          ) => {
            setSelectedCourseId(
              event.target.value
            )

            setErrorMessage("")
          }}
          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
        >
          {courses.map(
            (course) => (
              <option
                key={
                  course.id
                }
                value={
                  course.id
                }
              >
                {course.title}
              </option>
            )
          )}
        </select>

        {selectedCourse?.description && (
          <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-500">
            {
              selectedCourse.description
            }
          </p>
        )}
      </section>

      {errorMessage && (
        <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <section className="mt-6 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">
        <div className="flex items-center gap-3">
          <Plus className="h-5 w-5 text-[#0A9396]" />

          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">
              Agregar módulo
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Se agregará al final del curso.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <input
            value={
              newModuleTitle
            }
            onChange={(
              event
            ) =>
              setNewModuleTitle(
                event.target.value
              )
            }
            placeholder="Título del módulo"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
          />

          <textarea
            rows={3}
            value={
              newModuleDescription
            }
            onChange={(
              event
            ) =>
              setNewModuleDescription(
                event.target.value
              )
            }
            placeholder="Descripción del módulo"
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
          />
        </div>

        <button
          type="button"
          disabled={
            loadingKey ===
              "new-module" ||
            !newModuleTitle.trim()
          }
          onClick={
            createModule
          }
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50"
        >
          {loadingKey ===
          "new-module" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : successKey ===
            "new-module" ? (
            <Check className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}

          {successKey ===
          "new-module"
            ? "Creado"
            : "Crear módulo"}
        </button>
      </section>

      <div className="mt-6 space-y-6">
        {orderedModules.map(
          (module) => {
            const moduleDraft =
              getModuleDraft(
                module
              )

            const orderedLessons =
              [
                ...module.lessons,
              ].sort(
                (a, b) =>
                  a.position -
                  b.position
              )

            const nextPosition =
              orderedLessons.length >
              0
                ? Math.max(
                    ...orderedLessons.map(
                      (lesson) =>
                        lesson.position
                    )
                  ) + 1
                : 1

            const newLesson =
              getNewLessonDraft(
                module.id,
                nextPosition
              )

            return (
              <section
                key={
                  module.id
                }
                className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#0A9396]">
                        Módulo{" "}
                        {module.position}
                      </p>

                      <div className="mt-4 grid gap-4">
                        <input
                          value={
                            moduleDraft.title
                          }
                          onChange={(
                            event
                          ) =>
                            setModuleDrafts(
                              (current) => ({
                                ...current,

                                [module.id]: {
                                  ...moduleDraft,
                                  title:
                                    event.target.value,
                                },
                              })
                            )
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
                        />

                        <textarea
                          rows={3}
                          value={
                            moduleDraft.description
                          }
                          onChange={(
                            event
                          ) =>
                            setModuleDrafts(
                              (current) => ({
                                ...current,

                                [module.id]: {
                                  ...moduleDraft,
                                  description:
                                    event.target.value,
                                },
                              })
                            )
                          }
                          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
                        />

                        <div className="flex flex-wrap items-end gap-3">
                          <label className="w-28 text-xs font-medium text-gray-500">
                            Orden

                            <input
                              type="number"
                              min="1"
                              value={
                                moduleDraft.position
                              }
                              onChange={(
                                event
                              ) =>
                                setModuleDrafts(
                                  (current) => ({
                                    ...current,

                                    [module.id]: {
                                      ...moduleDraft,
                                      position:
                                        event.target.value,
                                    },
                                  })
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#001219]"
                            />
                          </label>

                          <button
                            type="button"
                            disabled={
                              loadingKey ===
                              `module-${module.id}`
                            }
                            onClick={() =>
                              saveModule(
                                module
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {loadingKey ===
                            `module-${module.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}

                            Guardar módulo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-white/10">
                  <div className="flex items-center justify-between p-6 md:px-8">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Clases
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">
                        {orderedLessons.length}{" "}
                        {orderedLessons.length ===
                        1
                          ? "clase"
                          : "clases"}
                      </p>
                    </div>

                    <Video className="h-5 w-5 text-[#0A9396]" />
                  </div>

                  {orderedLessons.length >
                    0 && (
                    <div className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-white/10 dark:border-white/10">
                      {orderedLessons.map(
                        (lesson) => {
                          const lessonDraft =
                            getLessonDraft(
                              lesson
                            )

                          return (
                            <div
                              key={
                                lesson.id
                              }
                              className="p-6 md:px-8"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#0A9396]/10 px-2.5 py-1 text-xs font-semibold text-[#0A9396]">
                                  Clase{" "}
                                  {
                                    lesson.position
                                  }
                                </span>

                                {lesson.is_published ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                    <Eye className="h-3.5 w-3.5" />
                                    Publicada
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                                    <EyeOff className="h-3.5 w-3.5" />
                                    Borrador
                                  </span>
                                )}

                                {lesson.video_url ? (
                                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                                    Video cargado
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-400 dark:bg-white/5">
                                    Sin video
                                  </span>
                                )}
                              </div>

                              <div className="mt-4 grid gap-4">
                                <input
                                  value={
                                    lessonDraft.title
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setLessonDrafts(
                                      (current) => ({
                                        ...current,

                                        [lesson.id]: {
                                          ...lessonDraft,
                                          title:
                                            event.target.value,
                                        },
                                      })
                                    )
                                  }
                                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold dark:border-white/10 dark:bg-[#001219]"
                                />

                                <textarea
                                  rows={3}
                                  value={
                                    lessonDraft.description
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setLessonDrafts(
                                      (current) => ({
                                        ...current,

                                        [lesson.id]: {
                                          ...lessonDraft,
                                          description:
                                            event.target.value,
                                        },
                                      })
                                    )
                                  }
                                  placeholder="Descripción de la clase"
                                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#001219]"
                                />

                                <input
                                  value={
                                    lessonDraft.video_url
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setLessonDrafts(
                                      (current) => ({
                                        ...current,

                                        [lesson.id]: {
                                          ...lessonDraft,
                                          video_url:
                                            event.target.value,
                                        },
                                      })
                                    )
                                  }
                                  placeholder="URL del video"
                                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#001219]"
                                />

                                <div className="flex flex-wrap items-end gap-3">
                                  <label className="w-28 text-xs font-medium text-gray-500">
                                    Orden

                                    <input
                                      type="number"
                                      min="1"
                                      value={
                                        lessonDraft.position
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        setLessonDrafts(
                                          (current) => ({
                                            ...current,

                                            [lesson.id]: {
                                              ...lessonDraft,
                                              position:
                                                event.target.value,
                                            },
                                          })
                                        )
                                      }
                                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#001219]"
                                    />
                                  </label>

                                  <label className="w-36 text-xs font-medium text-gray-500">
                                    Duración (min)

                                    <div className="relative mt-2">
                                      <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                      <input
                                        type="number"
                                        min="0"
                                        value={
                                          lessonDraft.duration_minutes
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          setLessonDrafts(
                                            (current) => ({
                                              ...current,

                                              [lesson.id]: {
                                                ...lessonDraft,
                                                duration_minutes:
                                                  event.target.value,
                                              },
                                            })
                                          )
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 dark:border-white/10 dark:bg-[#001219]"
                                      />
                                    </div>
                                  </label>

                                  <button
                                    type="button"
                                    disabled={
                                      loadingKey ===
                                      `lesson-${lesson.id}`
                                    }
                                    onClick={() =>
                                      saveLesson(
                                        lesson
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                                  >
                                    <Save className="h-4 w-4" />
                                    Guardar
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      loadingKey ===
                                      `publish-${lesson.id}`
                                    }
                                    onClick={() =>
                                      togglePublished(
                                        lesson
                                      )
                                    }
                                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                                      lesson.is_published
                                        ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
                                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                                    }`}
                                  >
                                    {loadingKey ===
                                    `publish-${lesson.id}` ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : lesson.is_published ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}

                                    {lesson.is_published
                                      ? "Pasar a borrador"
                                      : "Publicar"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        }
                      )}
                    </div>
                  )}

                  <div className="border-t border-gray-100 bg-gray-50/70 p-6 dark:border-white/10 dark:bg-white/[0.02] md:px-8">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Agregar clase
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Las clases nuevas se crean como borrador.
                    </p>

                    <div className="mt-4 grid gap-4">
                      <input
                        value={
                          newLesson.title
                        }
                        onChange={(
                          event
                        ) =>
                          setNewLessonDrafts(
                            (current) => ({
                              ...current,

                              [module.id]: {
                                ...newLesson,
                                title:
                                  event.target.value,
                              },
                            })
                          )
                        }
                        placeholder="Título de la clase"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#001219]"
                      />

                      <textarea
                        rows={3}
                        value={
                          newLesson.description
                        }
                        onChange={(
                          event
                        ) =>
                          setNewLessonDrafts(
                            (current) => ({
                              ...current,

                              [module.id]: {
                                ...newLesson,
                                description:
                                  event.target.value,
                              },
                            })
                          )
                        }
                        placeholder="Descripción"
                        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#001219]"
                      />

                      <input
                        value={
                          newLesson.video_url
                        }
                        onChange={(
                          event
                        ) =>
                          setNewLessonDrafts(
                            (current) => ({
                              ...current,

                              [module.id]: {
                                ...newLesson,
                                video_url:
                                  event.target.value,
                              },
                            })
                          )
                        }
                        placeholder="URL del video (opcional)"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#001219]"
                      />

                      <div className="flex flex-wrap items-end gap-3">
                        <label className="w-28 text-xs font-medium text-gray-500">
                          Orden

                          <input
                            type="number"
                            min="1"
                            value={
                              newLesson.position
                            }
                            onChange={(
                              event
                            ) =>
                              setNewLessonDrafts(
                                (current) => ({
                                  ...current,

                                  [module.id]: {
                                    ...newLesson,
                                    position:
                                      event.target.value,
                                  },
                                })
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#001219]"
                          />
                        </label>

                        <label className="w-36 text-xs font-medium text-gray-500">
                          Duración (min)

                          <input
                            type="number"
                            min="0"
                            value={
                              newLesson.duration_minutes
                            }
                            onChange={(
                              event
                            ) =>
                              setNewLessonDrafts(
                                (current) => ({
                                  ...current,

                                  [module.id]: {
                                    ...newLesson,
                                    duration_minutes:
                                      event.target.value,
                                  },
                                })
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#001219]"
                          />
                        </label>

                        <button
                          type="button"
                          disabled={
                            loadingKey ===
                              `new-lesson-${module.id}` ||
                            !newLesson.title.trim()
                          }
                          onClick={() =>
                            createLesson(
                              module
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {loadingKey ===
                          `new-lesson-${module.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}

                          Crear borrador
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )
          }
        )}
      </div>
    </div>
  )
}