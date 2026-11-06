import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import {
  ArchiveRestore,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileVideo2,
  FolderOpen,
  Link2,
  MapPin,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import RecoveryRequestButton from "@/components/recovery-request-button"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  completed: "Realizada",
  editing: "En edición",
  delivered: "Entregada",
  archived: "Archivada",
  cancelled: "Cancelada",
}

const STATUS_CLASSES: Record<string, string> = {
  confirmed:
    "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",

  completed:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",

  editing:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",

  delivered:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",

  archived:
    "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300",

  cancelled:
    "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300",
}

const formatDate = (
  value?: string | null
) => {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(
    new Date(value)
  )
}

const formatDateTime = (
  value?: string | null
) => {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  )
}

export default async function ProductionDetailPage({
  params,
}: PageProps) {
  const { id } =
    await params

  const supabase =
    await createClient()

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const {
    data: production,
  } =
    await supabase
      .from("productions")
      .select(`
        id,
        user_id,
        property_name,
        property_address,
        production_date,
        status,
        services,
        estimated_delivery_at,
        delivered_at,
        available_until,
        created_at
      `)
      .eq(
        "id",
        id
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle()

  if (!production) {
    notFound()
  }

  const {
    data: files,
  } =
    await supabase
      .from(
        "production_files"
      )
      .select(`
        id,
        label,
        file_type,
        url,
        expires_at,
        created_at
      `)
      .eq(
        "production_id",
        production.id
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      )

  const now =
    Date.now()

  const isArchived =
    production.status ===
      "archived" ||
    (
      production.available_until &&
      new Date(
        production.available_until
      ).getTime() <= now
    )

  const allFiles =
    files || []

  const availableFiles =
    allFiles.filter(
      (file) => {
        if (isArchived) {
          return false
        }

        if (
          file.file_type ===
            "wetransfer" &&
          file.expires_at
        ) {
          return (
            new Date(
              file.expires_at
            ).getTime() >
            now
          )
        }

        return true
      }
    )

  const expiredWeTransfers =
    allFiles.filter(
      (file) =>
        file.file_type ===
          "wetransfer" &&
        file.expires_at &&
        new Date(
          file.expires_at
        ).getTime() <=
          now
    )

  const {
    data:
      existingRecoveryRequest,
  } =
    await supabase
      .from(
        "recovery_requests"
      )
      .select(
        "id, status"
      )
      .eq(
        "production_id",
        production.id
      )
      .eq(
        "user_id",
        user.id
      )
      .in(
        "status",
        [
          "pending",
          "reviewing",
          "approved",
        ]
      )
      .order(
        "requested_at",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle()

  const hasAvailableMaterial =
    availableFiles.length >
    0

  return (
    <main className="min-h-screen bg-[#f5fafa] px-4 py-10 dark:bg-[#001219] md:py-16">

      <div className="mx-auto max-w-5xl">

        <Link
          href="/cuenta#producciones"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis producciones
        </Link>

        {/* CABECERA */}
        <section className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

            <div>

              <p className="text-sm font-semibold text-[#0A9396]">
                Clover Digital
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
                {
                  production.property_name
                }
              </h1>

              {production.property_address && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">

                  <MapPin className="h-4 w-4" />

                  {
                    production.property_address
                  }

                </div>
              )}

            </div>

            <span
              className={`w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${
                isArchived
                  ? STATUS_CLASSES.archived
                  : STATUS_CLASSES[
                      production.status
                    ] ||
                    STATUS_CLASSES.archived
              }`}
            >
              {isArchived
                ? "Archivada"
                : STATUS_LABELS[
                    production.status
                  ] ||
                  production.status}
            </span>

          </div>

          {/* FECHAS */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">

            <div className="rounded-2xl bg-gray-50 p-5 dark:bg-white/[0.03]">

              <div className="flex items-center gap-2 text-[#0A9396]">

                <CalendarDays className="h-4 w-4" />

                <p className="text-xs font-semibold uppercase tracking-wide">
                  Producción
                </p>

              </div>

              <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                {formatDate(
                  production.production_date
                )}
              </p>

            </div>

            <div className="rounded-2xl bg-gray-50 p-5 dark:bg-white/[0.03]">

              <div className="flex items-center gap-2 text-[#0A9396]">

                <Clock3 className="h-4 w-4" />

                <p className="text-xs font-semibold uppercase tracking-wide">
                  Entrega estimada
                </p>

              </div>

              <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                {formatDate(
                  production.estimated_delivery_at
                )}
              </p>

            </div>

            <div className="rounded-2xl bg-gray-50 p-5 dark:bg-white/[0.03]">

              <div className="flex items-center gap-2 text-[#0A9396]">

                <CheckCircle2 className="h-4 w-4" />

                <p className="text-xs font-semibold uppercase tracking-wide">
                  Entregada
                </p>

              </div>

              <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                {formatDate(
                  production.delivered_at
                )}
              </p>

            </div>

          </div>

          {/* SERVICIOS */}
          <div className="mt-8">

            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Servicios realizados
            </p>

            <div className="mt-3 flex flex-wrap gap-2">

              {production.services
                ?.length ? (
                production.services.map(
                  (
                    service
                  ) => (
                    <span
                      key={
                        service
                      }
                      className="rounded-full bg-[#0A9396]/10 px-3 py-1.5 text-sm font-medium text-[#0A9396]"
                    >
                      {
                        service
                      }
                    </span>
                  )
                )
              ) : (
                <p className="text-sm text-gray-500">
                  Sin servicios cargados.
                </p>
              )}

            </div>

          </div>

        </section>

        {/* ENTREGA */}
        <section className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                <FolderOpen className="h-5 w-5" />
              </div>

              <div>

                <p className="text-sm font-semibold text-[#0A9396]">
                  Tu entrega
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                  Material de la producción
                </h2>

                {!isArchived &&
                  production.available_until && (
                  <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    Clover mantiene esta entrega disponible online hasta el{" "}
                    <strong className="font-semibold text-gray-700 dark:text-gray-200">
                      {formatDate(
                        production.available_until
                      )}
                    </strong>
                    .
                  </p>
                )}

              </div>

            </div>

            {!isArchived &&
              production.available_until && (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 dark:bg-emerald-500/10">

                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Disponible hasta
                </p>

                <p className="mt-1 font-semibold text-emerald-800 dark:text-emerald-200">
                  {formatDate(
                    production.available_until
                  )}
                </p>

              </div>
            )}

          </div>

          {/* ARCHIVADA */}
          {isArchived ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/20 dark:bg-amber-500/10">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">

                  <ArchiveRestore className="h-5 w-5" />

                </div>

                <div className="flex-1">

                  <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                    Material archivado
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-800/80 dark:text-amber-200/70">
                    Esta producción ya superó el período de almacenamiento online de 90 días. Si necesitás nuevamente el material, podés solicitar su recuperación.
                  </p>

                  <p className="mt-2 text-xs leading-5 text-amber-700/70 dark:text-amber-300/70">
                    La recuperación depende de la disponibilidad del archivo y puede tener un costo adicional.
                  </p>

                  <RecoveryRequestButton
                    productionId={
                      production.id
                    }
                    userId={
                      user.id
                    }
                    existingRequest={
                      existingRecoveryRequest
                    }
                  />

                </div>

              </div>

            </div>
          ) : !hasAvailableMaterial ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-white/10">

              <FolderOpen className="mx-auto h-7 w-7 text-gray-300" />

              <p className="mt-3 font-medium text-gray-700 dark:text-gray-200">
                Todavía no hay material disponible
              </p>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                Cuando la entrega esté lista, los enlaces de descarga aparecerán en esta sección.
              </p>

            </div>
          ) : (
            <div className="mt-6 space-y-3">

              {availableFiles.map(
                (
                  file
                ) => {
                  const isWeTransfer =
                    file.file_type ===
                    "wetransfer"

                  const isVideo =
                    file.file_type.includes(
                      "video"
                    ) ||
                    file.file_type ===
                      "talking_reel"

                  return (
                    <a
                      key={
                        file.id
                      }
                      href={
                        file.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-4 rounded-2xl border border-gray-200 p-5 transition hover:border-[#0A9396]/40 hover:bg-[#0A9396]/5 dark:border-white/10 dark:hover:bg-white/[0.03] sm:flex-row sm:items-center"
                    >

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396]">

                        {isVideo ? (
                          <FileVideo2 className="h-5 w-5" />
                        ) : isWeTransfer ? (
                          <Download className="h-5 w-5" />
                        ) : (
                          <Link2 className="h-5 w-5" />
                        )}

                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-semibold text-gray-900 dark:text-white">
                            {
                              file.label
                            }
                          </p>

                          {isWeTransfer && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                              WeTransfer
                            </span>
                          )}

                        </div>

                        {isWeTransfer &&
                          file.expires_at && (
                          <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-300">
                            Este enlace vence el{" "}
                            {formatDateTime(
                              file.expires_at
                            )}
                          </p>
                        )}

                        {!isWeTransfer && (
                          <p className="mt-2 text-xs text-gray-400">
                            Abrí el enlace para acceder al material.
                          </p>
                        )}

                      </div>

                      <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#001219]">

                        {isWeTransfer
                          ? "Descargar"
                          : "Abrir material"}

                        <ExternalLink className="h-4 w-4" />

                      </span>

                    </a>
                  )
                }
              )}

            </div>
          )}

          {/* WETRANSFER VENCIDO */}
          {!isArchived &&
            expiredWeTransfers.length >
              0 && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">

                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Algunos enlaces temporales vencieron
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Los enlaces de WeTransfer tienen una duración limitada. Si también hay una entrega permanente disponible, podés seguir accediendo desde los enlaces superiores.
                </p>

              </div>
            )}

          {/* AVISO 90 DÍAS */}
          {!isArchived &&
            production.available_until && (
              <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/10">

                <p className="text-xs leading-5 text-gray-400">
                  Te recomendamos descargar y guardar una copia de todo el material. Clover Digital mantiene las entregas online durante 90 días desde la fecha de entrega.
                </p>

              </div>
            )}

        </section>

      </div>

    </main>
  )
}