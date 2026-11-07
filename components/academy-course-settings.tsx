"use client"

import {
  ChangeEvent,
  useEffect,
  useState,
} from "react"

import { useRouter } from "next/navigation"

import {
  Check,
  ImageIcon,
  Loader2,
  Save,
  Trash2,
  Upload,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  cover_url: string | null
}

interface Props {
  courses: Course[]
}

export default function AcademyCourseSettings({
  courses,
}: Props) {
  const router =
    useRouter()

  const [
    selectedCourseId,
    setSelectedCourseId,
  ] = useState(
    courses[0]?.id || ""
  )

  const selectedCourse =
    courses.find(
      (course) =>
        course.id ===
        selectedCourseId
    ) ||
    courses[0] ||
    null

  const [
    title,
    setTitle,
  ] = useState(
    selectedCourse?.title || ""
  )

  const [
    description,
    setDescription,
  ] = useState(
    selectedCourse?.description || ""
  )

  const [
    coverUrl,
    setCoverUrl,
  ] = useState<string | null>(
    selectedCourse?.cover_url ||
      null
  )

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    uploadingCover,
    setUploadingCover,
  ] = useState(false)

  const [
    removingCover,
    setRemovingCover,
  ] = useState(false)

  const [
    saved,
    setSaved,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("")

  useEffect(() => {
    if (!selectedCourse) {
      return
    }

    setTitle(
      selectedCourse.title
    )

    setDescription(
      selectedCourse.description ||
        ""
    )

    setCoverUrl(
      selectedCourse.cover_url ||
        null
    )

    setErrorMessage("")
    setSaved(false)
  }, [
    selectedCourseId,
    selectedCourse,
  ])

  const saveCourse =
    async () => {
      if (
        !selectedCourse ||
        !title.trim()
      ) {
        return
      }

      setLoading(true)
      setSaved(false)
      setErrorMessage("")

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from("courses")
          .update({
            title:
              title.trim(),

            description:
              description.trim() ||
              null,
          })
          .eq(
            "id",
            selectedCourse.id
          )

      if (error) {
        console.error(
          "Error guardando curso:",
          error
        )

        setErrorMessage(
          "No pudimos guardar los cambios del curso."
        )

        setLoading(false)

        return
      }

      setLoading(false)
      setSaved(true)

      router.refresh()

      window.setTimeout(
        () => {
          setSaved(false)
        },
        1800
      )
    }

  const uploadCover =
    async (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target.files?.[0]

      event.target.value = ""

      if (
        !file ||
        !selectedCourse
      ) {
        return
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setErrorMessage(
          "El archivo tiene que ser una imagen."
        )

        return
      }

      const maxSize =
        5 * 1024 * 1024

      if (
        file.size >
        maxSize
      ) {
        setErrorMessage(
          "La portada no puede superar los 5 MB."
        )

        return
      }

      setUploadingCover(true)
      setErrorMessage("")

      const supabase =
        createClient()

      const storagePath =
        `${selectedCourse.id}/cover`

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            "academy-covers"
          )
          .upload(
            storagePath,
            file,
            {
              upsert: true,
              contentType:
                file.type,
              cacheControl:
                "3600",
            }
          )

      if (uploadError) {
        console.error(
          "Error subiendo portada:",
          uploadError
        )

        setErrorMessage(
          "No pudimos subir la portada."
        )

        setUploadingCover(
          false
        )

        return
      }

      const {
        data: publicData,
      } =
        supabase.storage
          .from(
            "academy-covers"
          )
          .getPublicUrl(
            storagePath
          )

      const publicUrl =
        `${publicData.publicUrl}?v=${Date.now()}`

      const {
        error: courseError,
      } =
        await supabase
          .from("courses")
          .update({
            cover_url:
              publicUrl,
          })
          .eq(
            "id",
            selectedCourse.id
          )

      if (courseError) {
        console.error(
          "Error guardando portada:",
          courseError
        )

        setErrorMessage(
          "La imagen se subió, pero no pudimos asociarla al curso."
        )

        setUploadingCover(
          false
        )

        return
      }

      setCoverUrl(
        publicUrl
      )

      setUploadingCover(
        false
      )

      router.refresh()
    }

  const removeCover =
    async () => {
      if (
        !selectedCourse ||
        !coverUrl
      ) {
        return
      }

      const confirmed =
        window.confirm(
          "¿Querés eliminar la portada actual del curso?"
        )

      if (!confirmed) {
        return
      }

      setRemovingCover(true)
      setErrorMessage("")

      const supabase =
        createClient()

      const storagePath =
        `${selectedCourse.id}/cover`

      const {
        error: removeError,
      } =
        await supabase.storage
          .from(
            "academy-covers"
          )
          .remove([
            storagePath,
          ])

      if (removeError) {
        console.error(
          "Error eliminando portada:",
          removeError
        )

        setErrorMessage(
          "No pudimos eliminar la portada."
        )

        setRemovingCover(
          false
        )

        return
      }

      const {
        error: courseError,
      } =
        await supabase
          .from("courses")
          .update({
            cover_url:
              null,
          })
          .eq(
            "id",
            selectedCourse.id
          )

      if (courseError) {
        console.error(
          "Error actualizando curso:",
          courseError
        )

        setErrorMessage(
          "La imagen se eliminó, pero no pudimos actualizar el curso."
        )

        setRemovingCover(
          false
        )

        return
      }

      setCoverUrl(null)
      setRemovingCover(false)

      router.refresh()
    }

  if (
    courses.length === 0
  ) {
    return (
      <p className="text-sm text-gray-500">
        Todavía no hay cursos disponibles.
      </p>
    )
  }

  return (
    <div>
      <div className="grid gap-6">

        {/* CURSO */}
        <div>
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
            ) =>
              setSelectedCourseId(
                event.target.value
              )
            }
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
                  {
                    course.title
                  }
                </option>
              )
            )}
          </select>
        </div>

        {/* PORTADA */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Portada del curso
          </label>

          {coverUrl ? (
            <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">

              <div className="aspect-[16/9] bg-gray-100 dark:bg-[#001219]">
                <img
                  src={coverUrl}
                  alt={`Portada de ${selectedCourse?.title || "curso"}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-wrap gap-3 border-t border-gray-100 p-4 dark:border-white/10">

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001219]">

                  {uploadingCover ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}

                  {uploadingCover
                    ? "Subiendo..."
                    : "Cambiar portada"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={
                      uploadingCover ||
                      removingCover
                    }
                    onChange={
                      uploadCover
                    }
                    className="hidden"
                  />

                </label>

                <button
                  type="button"
                  disabled={
                    removingCover ||
                    uploadingCover
                  }
                  onClick={
                    removeCover
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/10"
                >

                  {removingCover ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  {removingCover
                    ? "Eliminando..."
                    : "Eliminar"}

                </button>

              </div>

            </div>
          ) : (
            <div className="mt-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-white/10 dark:bg-white/[0.02]">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                <ImageIcon className="h-6 w-6" />
              </div>

              <p className="mt-4 font-semibold text-gray-800 dark:text-gray-200">
                Sin portada
              </p>

              <p className="mt-2 text-sm text-gray-500">
                JPG, PNG o WebP. Máximo 5 MB.
              </p>

              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001219]">

                {uploadingCover ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}

                {uploadingCover
                  ? "Subiendo..."
                  : "Subir portada"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={
                    uploadingCover
                  }
                  onChange={
                    uploadCover
                  }
                  className="hidden"
                />

              </label>

            </div>
          )}

          <p className="mt-2 text-xs leading-5 text-gray-400">
            Recomendación: una imagen horizontal 16:9, por ejemplo 1600 × 900 px.
          </p>
        </div>

        {/* NOMBRE */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Nombre del curso
          </label>

          <input
            value={title}
            onChange={(
              event
            ) =>
              setTitle(
                event.target.value
              )
            }
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Descripción
          </label>

          <textarea
            rows={4}
            value={
              description
            }
            onChange={(
              event
            ) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="Descripción general del curso"
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 leading-6 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
          />
        </div>

        {/* SLUG */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Slug
          </label>

          <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-white/10 dark:bg-white/[0.03]">
            {
              selectedCourse?.slug
            }
          </div>

          <p className="mt-2 text-xs leading-5 text-gray-400">
            El slug identifica internamente al curso. Lo dejamos bloqueado para evitar romper enlaces o relaciones existentes.
          </p>
        </div>

      </div>

      {errorMessage && (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        disabled={
          loading ||
          !title.trim()
        }
        onClick={
          saveCourse
        }
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4" />
        ) : (
          <Save className="h-4 w-4" />
        )}

        {loading
          ? "Guardando..."
          : saved
            ? "Guardado"
            : "Guardar información"}
      </button>
    </div>
  )
}