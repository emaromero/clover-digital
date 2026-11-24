
"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Check,
  Copy,
  Loader2,
  Mail,
  Share2,
  Trash2,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Invitation {
  token: string
  recipient_email: string
  created_at: string
  expires_at: string
  accepted_at: string | null
  revoked_at: string | null
  last_viewed_at: string | null
  view_count: number
  last_clicked_at: string | null
  click_count: number
}

interface Props {
  productionId: string
  propertyName: string
}

const formatDate = (value: string | null) => {
  if (!value) return "Sin actividad"

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(value))
}

export default function ProductionShareManager({
  productionId,
  propertyName,
}: Props) {
  const [email, setEmail] = useState("")
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [busyToken, setBusyToken] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const loadInvitations = useCallback(async () => {
    const supabase = createClient()

    const { data, error: queryError } = await supabase.rpc(
      "list_production_shares",
      { p_production_id: productionId }
    )

    if (queryError) {
      setError("No se pudieron cargar las invitaciones.")
    } else {
      setInvitations((data || []) as Invitation[])
    }

    setLoading(false)
  }, [productionId])

  useEffect(() => {
    void loadInvitations()
  }, [loadInvitations])

  const invite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) return

    setSending(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/production-share-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productionId,
          email: email.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "No pudimos crear la invitación.")
      }

      setEmail("")

      setMessage(
        result.emailSent
          ? "Invitación enviada por correo correctamente."
          : "Invitación creada, pero el correo no pudo enviarse. Copiá el enlace de la lista y compartilo con tu colega."
      )

      await loadInvitations()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error."
      )
    } finally {
      setSending(false)
    }
  }

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/compartida/${token}`

    try {
      await navigator.clipboard.writeText(url)
      setMessage("Enlace copiado.")
    } catch {
      setError("No se pudo copiar el enlace.")
    }
  }

  const revoke = async (token: string) => {
    if (!window.confirm("¿Revocar el acceso de este colega?")) {
      return
    }

    setBusyToken(token)
    setError("")
    setMessage("")

    const supabase = createClient()

    const { error: revokeError } = await supabase.rpc(
      "revoke_production_share",
      { p_token: token }
    )

    if (revokeError) {
      setError(revokeError.message)
    } else {
      setMessage("Acceso revocado correctamente.")
      await loadInvitations()
    }

    setBusyToken(null)
  }

  return (
    <section className="mx-auto mt-6 max-w-5xl px-4 pb-8">
      <div className="rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c] sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
            <Share2 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Compartir producción
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Invitá a un colega para consultar el material de{" "}
              <strong>{propertyName}</strong>.
              Solo podrá visualizar esta producción.
            </p>
          </div>
        </div>

        <form onSubmit={invite} className="mt-6">
          <label
            htmlFor="share-email"
            className="text-sm font-semibold text-gray-800 dark:text-white"
          >
            Correo del colega
          </label>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="share-email"
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="colega@inmobiliaria.com"
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#0A9396] dark:border-white/15 dark:bg-[#001219] dark:text-white"
            />

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Enviar invitación
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            El colega deberá ingresar con el mismo correo.
            El enlace vence a los 30 días o al revocar el acceso.
          </p>
        </form>

        {message && (
          <p
            role="status"
            className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            <Check className="h-4 w-4 shrink-0" />
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
          >
            {error}
          </p>
        )}

        <div className="mt-8 border-t border-gray-100 pt-6 dark:border-white/10">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Colegas invitados
          </h3>

          {loading ? (
            <p className="mt-4 text-sm text-gray-400">
              Cargando invitaciones...
            </p>
          ) : invitations.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">
              Todavía no compartiste esta producción.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {invitations.map((invitation) => {
                const active =
                  !invitation.revoked_at &&
                  new Date(invitation.expires_at).getTime() >
                    Date.now()

                return (
                  <div
                    key={invitation.token}
                    className="rounded-2xl border border-gray-200 p-4 dark:border-white/10"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all text-sm font-semibold text-gray-900 dark:text-white">
                          {invitation.recipient_email}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {invitation.revoked_at
                            ? "Acceso revocado"
                            : !active
                              ? "Invitación vencida"
                              : invitation.accepted_at
                                ? "Acceso utilizado"
                                : "Invitación pendiente"}
                        </p>
                      </div>

                      {active && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void copyLink(invitation.token)
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#0e5c6e] dark:border-white/15 dark:text-teal-300"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copiar
                          </button>

                          <button
                            type="button"
                            disabled={busyToken === invitation.token}
                            onClick={() =>
                              void revoke(invitation.token)
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50 dark:border-red-500/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Revocar
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 text-xs dark:border-white/10 sm:grid-cols-2">
                      <div>
                        <p className="text-gray-400">
                          Última visualización
                        </p>
                        <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">
                          {formatDate(invitation.last_viewed_at)}
                          {" · "}
                          {invitation.view_count} visitas
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">
                          Último clic en material
                        </p>
                        <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">
                          {formatDate(invitation.last_clicked_at)}
                          {" · "}
                          {invitation.click_count} clics
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
