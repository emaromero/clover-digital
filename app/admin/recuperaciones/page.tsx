import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArchiveRestore,
  ArrowLeft,
  Mail,
  Phone,
  UserRound,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import RecoveryStatusSelect from "@/components/recovery-status-select"

export default async function RecuperacionesAdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  if (roleData?.role !== "admin") {
    redirect("/cuenta")
  }

  const { data: requests } = await supabase
    .from("recovery_requests")
    .select(`
      id,
      production_id,
      user_id,
      status,
      message,
      admin_notes,
      requested_at,
      updated_at
    `)
    .order("requested_at", {
      ascending: false,
    })

  const allRequests =
    requests || []

  const userIds = [
    ...new Set(
      allRequests.map(
        (item) => item.user_id
      )
    ),
  ]

  const productionIds = [
    ...new Set(
      allRequests.map(
        (item) =>
          item.production_id
      )
    ),
  ]

  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            email,
            phone,
            avatar_url
          `)
          .in("id", userIds)
      : { data: [] }

  const { data: productions } =
    productionIds.length > 0
      ? await supabase
          .from("productions")
          .select(`
            id,
            property_name,
            property_address,
            production_date,
            delivered_at
          `)
          .in("id", productionIds)
      : { data: [] }

  const profileMap = new Map(
    (profiles || []).map(
      (profile) => [
        profile.id,
        profile,
      ]
    )
  )

  const productionMap = new Map(
    (productions || []).map(
      (production) => [
        production.id,
        production,
      ]
    )
  )

  const pendingCount =
    allRequests.filter(
      (request) =>
        request.status === "pending"
    ).length

  const reviewingCount =
    allRequests.filter(
      (request) =>
        request.status === "reviewing"
    ).length

  const approvedCount =
    allRequests.filter(
      (request) =>
        request.status === "approved"
    ).length

  const formatDateTime = (
    value?: string | null
  ) => {
    if (!value) return "-"

    return new Intl.DateTimeFormat(
      "es-AR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(value))
  }

  const formatDate = (
    value?: string | null
  ) => {
    if (!value) return "-"

    return new Intl.DateTimeFormat(
      "es-AR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    ).format(new Date(value))
  }

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a administración
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold text-[#0A9396]">
            Clover Digital
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Recuperaciones
          </h1>

          <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
            Gestioná las solicitudes de clientes que necesitan recuperar material archivado.
          </p>
        </div>

        {/* MÉTRICAS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c]">
            <p className="text-sm text-gray-500">
              Solicitudes
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {allRequests.length}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c]">
            <p className="text-sm text-gray-500">
              Pendientes
            </p>

            <p className="mt-1 text-3xl font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c]">
            <p className="text-sm text-gray-500">
              En revisión
            </p>

            <p className="mt-1 text-3xl font-bold text-blue-600">
              {reviewingCount}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c]">
            <p className="text-sm text-gray-500">
              Aprobadas
            </p>

            <p className="mt-1 text-3xl font-bold text-[#0A9396]">
              {approvedCount}
            </p>
          </div>

        </div>

        {/* SOLICITUDES */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396]">
                <ArchiveRestore className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Solicitudes de recuperación
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Revisá si conservamos el material antes de aprobar.
                </p>
              </div>
            </div>
          </div>

          {allRequests.length === 0 ? (
            <div className="p-10 text-center">
              <ArchiveRestore className="mx-auto h-8 w-8 text-gray-300" />

              <p className="mt-4 font-semibold text-gray-800 dark:text-gray-200">
                No hay solicitudes de recuperación
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Cuando un cliente solicite material archivado aparecerá acá.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {allRequests.map(
                (request) => {
                  const profile =
                    profileMap.get(
                      request.user_id
                    )

                  const production =
                    productionMap.get(
                      request.production_id
                    )

                  return (
                    <article
                      key={request.id}
                      className="p-6 md:p-8"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

                        {/* CLIENTE */}
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt=""
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396]">
                              <UserRound className="h-5 w-5" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {profile?.full_name ||
                                "Sin nombre"}
                            </p>

                            {profile?.email && (
                              <p className="mt-1 truncate text-sm text-gray-500">
                                {profile.email}
                              </p>
                            )}

                            {profile?.phone && (
                              <p className="mt-1 text-xs text-gray-400">
                                {profile.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* PROPIEDAD */}
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            Propiedad
                          </p>

                          <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                            {production?.property_name ||
                              "Producción"}
                          </p>

                          {production?.property_address && (
                            <p className="mt-1 text-sm text-gray-500">
                              {production.property_address}
                            </p>
                          )}

                          {production?.production_date && (
                            <p className="mt-2 text-xs text-gray-400">
                              Producción:{" "}
                              {formatDate(
                                production.production_date
                              )}
                            </p>
                          )}
                        </div>

                        {/* FECHA SOLICITUD */}
                        <div className="lg:w-[180px]">
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            Solicitada
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {formatDateTime(
                              request.requested_at
                            )}
                          </p>
                        </div>

                        {/* ESTADO */}
                        <div className="lg:w-[190px]">
                          <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">
                            Estado
                          </p>

                          <RecoveryStatusSelect
                            requestId={request.id}
                            initialStatus={
                              request.status
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 border-t border-gray-100 pt-5 dark:border-white/10">

                        <Link
                          href={`/admin/producciones/${request.production_id}`}
                          className="text-sm font-semibold text-[#0A9396] hover:underline"
                        >
                          Ver producción
                        </Link>

                        {profile?.email && (
                          <a
                            href={`mailto:${profile.email}`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-[#0A9396]"
                          >
                            <Mail className="h-4 w-4" />
                            Enviar email
                          </a>
                        )}

                        {profile?.phone && (
                          <a
                            href={`tel:${profile.phone}`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-[#0A9396]"
                          >
                            <Phone className="h-4 w-4" />
                            Llamar
                          </a>
                        )}
                      </div>

                      <p className="mt-4 text-xs text-gray-400">
                        La recuperación está sujeta a disponibilidad del archivo y puede tener un costo adicional.
                      </p>
                    </article>
                  )
                }
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}