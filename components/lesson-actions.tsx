"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface LessonActionsProps {
  userId: string
  lessonId: string
  completed: boolean
  previousLessonId?: string | null
  nextLessonId?: string | null
}

export default function LessonActions({
  userId,
  lessonId,
  completed,
  previousLessonId,
  nextLessonId,
}: LessonActionsProps) {
  const router = useRouter()

  const [isCompleted, setIsCompleted] = useState(completed)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const markCompleted = async (continueAfter = false) => {
    setLoading(true)
    setMessage("")

    const supabase = createClient()

    const now = new Date().toISOString()

    const { error } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          completed_at: now,
          updated_at: now,
        },
        {
          onConflict: "user_id,lesson_id",
        }
      )

    if (error) {
      setMessage("No pudimos guardar tu progreso.")
      setLoading(false)
      return
    }

    setIsCompleted(true)
    setLoading(false)

    router.refresh()

    if (continueAfter) {
      if (nextLessonId) {
        router.push(`/academy/clase/${nextLessonId}`)
      } else {
        router.push("/academy")
      }
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {message}
        </p>
      )}

      {!isCompleted ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => markCompleted(false)}
          className="w-full rounded-xl bg-[#0A9396] px-5 py-3.5 font-semibold text-white transition hover:bg-[#087f82] disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Marcar como completada
            </span>
          )}
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-[#0A9396]/10 px-5 py-3.5 font-semibold text-[#0A9396]">
          <CheckCircle2 className="h-5 w-5" />
          Clase completada
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {previousLessonId ? (
          <Link
            href={`/academy/clase/${previousLessonId}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Clase anterior
          </Link>
        ) : (
          <Link
            href="/academy"
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al curso
          </Link>
        )}

        {isCompleted ? (
          nextLessonId ? (
            <Link
              href={`/academy/clase/${nextLessonId}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#001219]"
            >
              Siguiente clase
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/academy"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#001219]"
            >
              Finalizar curso
              <CheckCircle2 className="h-4 w-4" />
            </Link>
          )
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => markCompleted(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-60"
          >
            Completar y continuar
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}