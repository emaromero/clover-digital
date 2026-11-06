"use client"

import { useState } from "react"

import {
  Check,
  Loader2,
  Save,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Props {
  requestId: string
  initialStatus: string
  initialAdminNotes?: string | null
}

const STATUS_LABELS: Record<
  string,
  string
> = {
  pending: "Pendiente",
  reviewing: "En revisión",
  approved: "Aprobada",
  rejected: "Rechazada",
  completed: "Completada",
}

export default function RecoveryStatusSelect({
  requestId,
  initialStatus,
  initialAdminNotes,
}: Props) {
  const [
    status,
    setStatus,
  ] =
    useState(
      initialStatus
    )

  const [
    adminNotes,
    setAdminNotes,
  ] =
    useState(
      initialAdminNotes ||
        ""
    )

  const [
    loadingStatus,
    setLoadingStatus,
  ] =
    useState(false)

  const [
    savingNotes,
    setSavingNotes,
  ] =
    useState(false)

  const [
    notesSaved,
    setNotesSaved,
  ] =
    useState(false)

  const handleChange =
    async (
      nextStatus: string
    ) => {
      setLoadingStatus(
        true
      )

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from(
            "recovery_requests"
          )
          .update({
            status:
              nextStatus,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            requestId
          )

      if (error) {
        console.error(
          error
        )

        setLoadingStatus(
          false
        )

        return
      }

      setStatus(
        nextStatus
      )

      setLoadingStatus(
        false
      )
    }

  const handleSaveNotes =
    async () => {
      setSavingNotes(
        true
      )

      setNotesSaved(
        false
      )

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from(
            "recovery_requests"
          )
          .update({
            admin_notes:
              adminNotes.trim() ||
              null,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            requestId
          )

      if (error) {
        console.error(
          error
        )

        setSavingNotes(
          false
        )

        return
      }

      setSavingNotes(
        false
      )

      setNotesSaved(
        true
      )

      setTimeout(
        () => {
          setNotesSaved(
            false
          )
        },
        1800
      )
    }

  return (
    <div className="space-y-4">

      <div>

        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-400">
          Estado
        </label>

        <div className="relative">

          <select
            value={
              status
            }
            disabled={
              loadingStatus
            }
            onChange={(
              event
            ) =>
              handleChange(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#0A9396] disabled:opacity-60 dark:border-white/10 dark:bg-[#001219]"
          >

            {Object.entries(
              STATUS_LABELS
            ).map(
              ([
                value,
                label,
              ]) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {
                    label
                  }
                </option>
              )
            )}

          </select>

          {loadingStatus && (
            <Loader2 className="absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#0A9396]" />
          )}

        </div>

      </div>

      <div>

        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-400">
          Nota interna
        </label>

        <textarea
          rows={3}
          value={
            adminNotes
          }
          onChange={(
            event
          ) =>
            setAdminNotes(
              event.target.value
            )
          }
          placeholder="Ej: archivo encontrado, recuperación sin cargo, cliente avisado..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/10 dark:bg-[#001219]"
        />

        <button
          type="button"
          onClick={
            handleSaveNotes
          }
          disabled={
            savingNotes
          }
          className={`mt-2 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
            notesSaved
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "bg-[#0e5c6e] text-white hover:bg-[#001219]"
          } disabled:opacity-60`}
        >
          {savingNotes ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : notesSaved ? (
            <>
              <Check className="h-4 w-4" />
              Guardado
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar nota
            </>
          )}
        </button>

      </div>

    </div>
  )
}