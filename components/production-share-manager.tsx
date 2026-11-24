
"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Check,
  Copy,
  Loader2,
  Share2,
  Trash2,
  Users,
  Link2,
  Clock3,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface ShareAccess {
  user_id: string | null
  user_email: string | null
  user_name: string | null
  first_access_at: string | null
  last_viewed_at: string | null
  view_count: number
  last_clicked_at: string | null
  click_count: number
}

interface ShareLink {
  share_token: string
  created_at: string
  expires_at: string
  revoked_at: string | null
  accesses: ShareAccess[]
}

interface ShareRow extends ShareAccess {
  share_token: string
  created_at: string
  expires_at: string
  revoked_at: string | null
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

const isActive = (link: ShareLink) =>
  !link.revoked_at &&
  new Date(link.expires_at).getTime() > Date.now()

export default function ProductionShareManager({
  productionId,
  propertyName,
}: Props) {
  const [links, setLinks] = useState<ShareLink[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [busyToken, setBusyToken] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const loadLinks = useCallback(async () => {
    const supabase = createClient()

    const { data, error: queryError } = await supabase.rpc(
      "list_production_share_links",
      { p_production_id: productionId }
    )

    if (queryError) {
      setError("No se pudieron cargar los enlaces compartidos.")
      setLoading(false)
      return
    }

    const grouped = new Map<string, ShareLink>()

    for (const row of (data || []) as ShareRow[]) {
      let link = grouped.get(row.share_token)

      if (!link) {
        link = {
          share_token: row.share_token,
          created_at: row.created_at,
          expires_at: row.expires_at,
          revoked_at: row.revoked_at,
          accesses: [],
        }

        grouped.set(row.share_token, link)
      }

      if (row.user_id) {
        link.accesses.push({
          user_id: row.user_id,
          user_email: row.user_email,
          user_name: row.user_name,
          first_access_at: row.first_access_at,
          last_viewed_at: row.last_viewed_at,
          view_count: row.view_count,
          last_clicked_at: row.last_clicked_at,
          click_count: row.click_count,
        })
      }
    }

    setLinks(
      Array.from(grouped.values()).sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
    )

    setLoading(false)
    setError("")
  }, [productionId])

  useEffect(() => {
    void loadLinks()
  }, [loadLinks])

  const activeLinks = links.filter(isActive)

  const createLink = async () => {
    if (activeLinks.length > 0) {
      setError("Ya existe un enlace activo para esta producción.")
      return
    }

    setCreating(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/production-share-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productionId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || "No pudimos generar el enlace."
        )
      }

      setMessage("Enlace generado correctamente.")

      await loadLinks()

      await copyLink(result.token)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al generar el enlace."
      )
    } finally {
      setCreating(false)
    }
  }

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/compartida/${token}`

    try {
      await navigator.clipboard.writeText(url)
      setCopiedToken(token)
      setMessage("Enlace copiado. Ya podés compartirlo.")

      window.setTimeout(() => {
        setCopiedToken((current) =>
          current === token ? null : current
        )
      }, 2500)
    } catch {
      setError("No se pudo copiar el enlace. Intentá nuevamente.")
    }
  }

  const revoke = async (token: string) => {
    if (
      !window.confirm(
        "¿Querés revocar este enlace? Los colegas dejarán de tener acceso."
      )
    ) {
      return
    }

    setBusyToken(token)
    setMessage("")
    setError("")

    const supabase = createClient()

    const { error: revokeError } = await supabase.rpc(
      "revoke_production_share",
      { p_token: token }
    )

    if (revokeError) {
      setError(revokeError.message)
    } else {
      setMessage("Enlace revocado correctamente.")
      await loadLinks()
    }

    setBusyToken(null)
  }

  return (
    <section className="mt-6 pb-8">
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
              Compartí el material de <strong>{propertyName}</strong> con
              otros colegas mediante un único enlace privado.
            </p>
          </div>

        </div>

        <div className="mt-6 rounded-2xl border border-[#0A9396]/20 bg-[#0A9396]/5 p-4 sm:p-5">

          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-[#0A9396]" />

            <h3 className="font-bold text-gray-900 dark:text-white">
              Enlace de acceso
            </h3>
          </div>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            Cualquier colega que tenga el enlace podrá ingresar con una
            cuenta de Clover Digital y consultar esta producción.
          </p>

          {activeLinks.length === 0 ? (
            <button
              type="button"
              onClick={() => void createLink()}
              disabled={creating || loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50 sm:w-auto"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}

              {creating ? "Generando enlace..." : "Generar enlace"}
            </button>
          ) : (
            <div className="mt-5 space-y-3">

              {activeLinks.map((link) => (
                <div
                  key={link.share_token}
                  className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#001219]"
                >

                  <p className="break-all text-xs text-gray-500 dark:text-gray-400">
                    {`${typeof window !== "undefined" ? window.location.origin : ""}/compartida/${link.share_token}`}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    <button
                      type="button"
                      onClick={() => void copyLink(link.share_token)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0e5c6e] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#001219]"
                    >
                      {copiedToken === link.share_token ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}

                      {copiedToken === link.share_token
                        ? "Copiado"
                        : "Copiar enlace"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void revoke(link.share_token)}
                      disabled={busyToken === link.share_token}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                    >
                      {busyToken === link.share_token ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}

                      Revocar enlace
                    </button>

                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    Vence el {formatDate(link.expires_at)}
                  </p>

                </div>
              ))}

            </div>
          )}

        </div>

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

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#0A9396]" />

            <h3 className="font-bold text-gray-900 dark:text-white">
              Colegas que ingresaron
            </h3>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-gray-400">
              Cargando actividad...
            </p>
          ) : links.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">
              Todavía no generaste un enlace para esta producción.
            </p>
          ) : (
            <div className="mt-4 space-y-5">

              {links.map((link) => (
                <div
                  key={link.share_token}
                  className="rounded-2xl border border-gray-200 p-4 dark:border-white/10"
                >

                  <div className="flex flex-wrap items-center justify-between gap-2">

                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {link.revoked_at
                        ? "Enlace revocado"
                        : isActive(link)
                          ? "Enlace activo"
                          : "Enlace vencido"}
                    </p>

                    <span className="text-xs text-gray-400">
                      {link.accesses.length} colegas
                    </span>

                  </div>

                  {link.accesses.length === 0 ? (
                    <p className="mt-3 text-xs text-gray-400">
                      Todavía nadie ingresó con este enlace.
                    </p>
                  ) : (
                    <div className="mt-3 divide-y divide-gray-100 dark:divide-white/10">

                      {link.accesses.map((access) => (
                        <div
                          key={access.user_id}
                          className="py-4 first:pt-1 last:pb-1"
                        >

                          <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">
                            {access.user_name ||
                              access.user_email ||
                              "Usuario registrado"}
                          </p>

                          {access.user_email && (
                            <p className="mt-1 break-all text-xs text-gray-500">
                              {access.user_email}
                            </p>
                          )}

                          <div className="mt-3 grid gap-3 sm:grid-cols-2">

                            <div>
                              <p className="text-xs text-gray-400">
                                Última visualización
                              </p>

                              <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-200">
                                {formatDate(access.last_viewed_at)}
                                {" · "}
                                {access.view_count} visitas
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                Último clic en material
                              </p>

                              <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-200">
                                {formatDate(access.last_clicked_at)}
                                {" · "}
                                {access.click_count} clics
                              </p>
                            </div>

                          </div>

                          <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                            <Clock3 className="h-3 w-3" />
                            Primer ingreso: {formatDate(access.first_access_at)}
                          </p>

                        </div>
                      ))}

                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

        </div>

        <p className="mt-6 text-xs leading-5 text-gray-400">
          Los colegas tienen permisos de solo lectura. El enlace puede
          reenviarse y su acceso se bloquea al revocarlo o al vencer.
        </p>

      </div>
    </section>
  )
}
