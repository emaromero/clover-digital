"use client"

import { useState } from "react"
import { ArchiveRestore, CheckCircle2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Props {
  productionId: string
  userId: string
  existingRequest?: {
    id: string
    status: string
  } | null
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Solicitud enviada",
  reviewing: "Solicitud en revisión",
  approved: "Recuperación aprobada",
  rejected: "Solicitud rechazada",
  completed: "Material recuperado",
}

export default function RecoveryRequestButton({
  productionId,
  userId,
  existingRequest,
}: Props) {
  const [request, setRequest] = useState(existingRequest)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleRequest = async () => {
    setLoading(true)
    setMessage("")

    const supabase = createClient()

    const { data, error } = await supabase
      .from("recovery_requests")
      .insert({
        production_id: productionId,
        user_id: userId,
        status: "pending",
      })
      .select("id, status")
      .single()

    if (error || !data) {
      console.error(error)

      setMessage(
        "No pudimos enviar la solicitud. Intentá nuevamente."
      )

      setLoading(false)
      return
    }

    setRequest(data)
    setLoading(false)
  }

  if (request) {
    return (
      <div className="mt-5 rounded-xl bg-white/70 px-4 py-3 dark:bg-black/10">
        <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200">
          <CheckCircle2 className="h-4 w-4" />

          {STATUS_LABELS[request.status] || "Solicitud enviada"}
        </div>

        <p className="mt-1 text-xs text-amber-800/70 dark:text-amber-200/60">
          Clover revisará la disponibilidad del material y se pondrá en contacto con vos.
        </p>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={handleRequest}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <ArchiveRestore className="h-4 w-4" />
            Solicitar recuperación
          </>
        )}
      </button>

      {message && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {message}
        </p>
      )}
    </>
  )
}