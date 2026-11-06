"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Props {
  requestId: string
  initialStatus: string
}

export default function RecoveryStatusSelect({
  requestId,
  initialStatus,
}: Props) {
  const [status, setStatus] =
    useState(initialStatus)

  const [loading, setLoading] =
    useState(false)

  const handleChange = async (
    nextStatus: string
  ) => {
    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase
      .from("recovery_requests")
      .update({
        status: nextStatus,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", requestId)

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setStatus(nextStatus)
    setLoading(false)
  }

  return (
    <div className="relative">
      <select
        value={status}
        disabled={loading}
        onChange={(event) =>
          handleChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#0A9396] disabled:opacity-60 dark:border-white/10 dark:bg-[#001219]"
      >
        <option value="pending">
          Pendiente
        </option>

        <option value="reviewing">
          En revisión
        </option>

        <option value="approved">
          Aprobada
        </option>

        <option value="rejected">
          Rechazada
        </option>

        <option value="completed">
          Completada
        </option>
      </select>

      {loading && (
        <Loader2 className="absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#0A9396]" />
      )}
    </div>
  )
}