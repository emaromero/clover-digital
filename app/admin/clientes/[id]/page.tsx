import Link from "next/link"

import {
  ArchiveRestore,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CircleDollarSign,
  FolderOpen,
  GraduationCap,
  Mail,
  Phone,
  ReceiptText,
  UserRound,
} from "lucide-react"

import {
  notFound,
  redirect,
} from "next/navigation"

import { createClient } from "@/lib/supabase/server"

import ClientClassificationManager from "@/components/client-classification-manager"
import ClientTaxIdEditor from "@/components/client-tax-id-editor"

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

const RECOVERY_LABELS: Record<string, string> = {
  pending: "Pendiente",
  reviewing: "En revisión",
  approved: "Aprobada",
  rejected: "Rechazada",
  completed: "Completada",
}

export default async function AdminClientDetailPage({
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
    data: roleData,
  } =
    await supabase
      .from("user_roles")
      .select("role")
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle()

  if (
    roleData?.role !==
    "admin"
  ) {
    redirect("/cuenta")
  }

  const {
    data: profile,
  } =
    await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        avatar_url,
        office_id,
        created_at
      `)
      .eq(
        "id",
        id
      )
      .maybeSingle()

  if (!profile) {
    notFound()
  }

  const {
    data: taxData,
  } =
    await supabase
      .from(
        "client_tax_data"
      )
      .select(
        "tax_id"
      )
      .eq(
        "user_id",
        id
      )
      .maybeSingle()

  /*
   * ORGANIZACIÓN INTERNA
   */
  const {
    data: offices,
  } =
    await supabase
      .from(
        "client_offices"
      )
      .select(`
        id,
        name
      `)
      .order(
        "name",
        {
          ascending: true,
        }
      )

  const {
    data: clientTags,
  } =
    await supabase
      .from("tags")
      .select(`
        id,
        name
      `)
      .eq(
        "scope",
        "client"
      )
      .order(
        "name",
        {
          ascending: true,
        }
      )

  const {
    data: profileTagRows,
  } =
    await supabase
      .from(
        "profile_tags"
      )
      .select(
        "tag_id"
      )
      .eq(
        "user_id",
        id
      )

  /*
   * PRODUCCIONES DEL CLIENTE
   */
  const {
    data: memberships,
  } =
    await supabase
      .from(
        "production_users"
      )
      .select(
        "production_id"
      )
      .eq(
        "user_id",
        id
      )

  const productionIds =
    [
      ...new Set(
        (
          memberships ||
          []
        ).map(
          (membership) =>
            membership.production_id
        )
      ),
    ]

  let allProductions:
    {
      id: string
      property_name: string
      property_address: string | null
      production_date: string | null
      status: string
      services: string[]
      total_amount: number | null
      invoice_status: string | null
      invoice_number: string | null
      delivered_at: string | null
      created_at: string
    }[] = []

  if (
    productionIds.length >
    0
  ) {
    const {
      data: productions,
    } =
      await supabase
        .from(
          "productions"
        )
        .select(`
          id,
          property_name,
          property_address,
          production_date,
          status,
          services,
          total_amount,
          invoice_status,
          invoice_number,
          delivered_at,
          created_at
        `)
        .in(
          "id",
          productionIds
        )
        .order(
          "production_date",
          {
            ascending: false,
            nullsFirst: false,
          }
        )

    allProductions =
      productions || []
  }

  let payments:
    {
      id: string
      production_id: string
      amount: number
      paid_at: string
      payment_method: string
    }[] = []

  if (
    productionIds.length >
    0
  ) {
    const {
      data: paymentData,
    } =
      await supabase
        .from(
          "production_payments"
        )
        .select(`
          id,
          production_id,
          amount,
          paid_at,
          payment_method
        `)
        .in(
          "production_id",
          productionIds
        )

    payments =
      paymentData || []
  }

  const {
    data: enrollments,
  } =
    await supabase
      .from("enrollments")
      .select(`
        id,
        status,
        enrolled_at,
        courses (
          id,
          title,
          slug
        )
      `)
      .eq(
        "user_id",
        id
      )
      .order(
        "enrolled_at",
        {
          ascending: false,
        }
      )

  const {
    data: recoveries,
  } =
    await supabase
      .from(
        "recovery_requests"
      )
      .select(`
        id,
        production_id,
        status,
        requested_at
      `)
      .eq(
        "user_id",
        id
      )
      .order(
        "requested_at",
        {
          ascending: false,
        }
      )

  const allEnrollments =
    enrollments || []

  const allRecoveries =
    recoveries || []

  const totalProductionValue =
    allProductions.reduce(
      (
        total,
        production
      ) =>
        total +
        Number(
          production.total_amount ||
            0
        ),
      0
    )

  const totalCollected =
    payments.reduce(
      (
        total,
        payment
      ) =>
        total +
        Number(
          payment.amount ||
            0
        ),
      0
    )

  const totalPending =
    Math.max(
      totalProductionValue -
        totalCollected,
      0
    )

  const pendingInvoices =
    allProductions.filter(
      (production) =>
        production.invoice_status ===
        "pending"
    ).length

  const pendingRecoveries =
    allRecoveries.filter(
      (recovery) =>
        recovery.status ===
          "pending" ||
        recovery.status ===
          "reviewing"
    ).length

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

  const formatCurrency = (
    value: number
  ) => {
    return new Intl.NumberFormat(
      "es-AR",
      {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }
    ).format(value)
  }

  const getProductionCollected =
    (
      productionId: string
    ) => {
      return payments
        .filter(
          (payment) =>
            payment.production_id ===
            productionId
        )
        .reduce(
          (
            total,
            payment
          ) =>
            total +
            Number(
              payment.amount ||
                0
            ),
          0
        )
    }

  const getRecoveryProduction =
    (
      productionId: string
    ) => {
      return allProductions.find(
        (production) =>
          production.id ===
          productionId
      )
    }

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">

        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />

          Volver a clientes
        </Link>

        {/* CABECERA */}
        <section className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center">

            {profile.avatar_url ? (
              <img
                src={
                  profile.avatar_url
                }
                alt=""
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396]">
                <UserRound className="h-8 w-8" />
              </div>
            )}

            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <p className="text-sm font-semibold text-[#0A9396]">
                  Cliente Clover
                </p>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Registrado
                </span>

              </div>

              <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {profile.full_name ||
                  "Sin nombre"}
              </h1>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 hover:text-[#0A9396]"
                  >
                    <Mail className="h-4 w-4" />

                    {
                      profile.email
                    }
                  </a>
                )}

                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="inline-flex items-center gap-2 hover:text-[#0A9396]"
                  >
                    <Phone className="h-4 w-4" />

                    {
                      profile.phone
                    }
                  </a>
                )}

              </div>

            </div>

            <div className="text-sm text-gray-400">

              Registrado el{" "}

              {formatDate(
                profile.created_at
              )}

            </div>

          </div>

        </section>

        {/* MÉTRICAS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <FolderOpen className="h-5 w-5 text-[#0A9396]" />

            <p className="mt-4 text-sm text-gray-500">
              Producciones
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {
                allProductions.length
              }
            </p>

          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <CircleDollarSign className="h-5 w-5 text-[#0A9396]" />

            <p className="mt-4 text-sm text-gray-500">
              Facturado
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                totalProductionValue
              )}
            </p>

          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <Banknote className="h-5 w-5 text-emerald-600" />

            <p className="mt-4 text-sm text-gray-500">
              Cobrado
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {formatCurrency(
                totalCollected
              )}
            </p>

          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <ReceiptText className="h-5 w-5 text-amber-600" />

            <p className="mt-4 text-sm text-gray-500">
              Saldo pendiente
            </p>

            <p
              className={`mt-1 text-2xl font-bold ${
                totalPending >
                0
                  ? "text-amber-600"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {formatCurrency(
                totalPending
              )}
            </p>

          </div>

        </div>

        {/* DATOS INTERNOS */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          <ClientClassificationManager
            userId={
              profile.id
            }
            offices={
              offices || []
            }
            tags={
              clientTags || []
            }
            initialOfficeId={
              profile.office_id ||
              null
            }
            initialTagIds={
              (
                profileTagRows ||
                []
              ).map(
                (item) =>
                  item.tag_id
              )
            }
          />

          <ClientTaxIdEditor
            userId={
              profile.id
            }
            initialTaxId={
              taxData?.tax_id ||
              null
            }
          />

        </div>

        {/* ALERTAS */}
        {(pendingInvoices >
          0 ||
          pendingRecoveries >
            0) && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {pendingInvoices >
              0 && (
              <Link
                href="/admin/finanzas"
                className="rounded-3xl border border-amber-200 bg-amber-50 p-5 transition hover:border-amber-300 dark:border-amber-500/20 dark:bg-amber-500/10"
              >

                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Facturación pendiente
                </p>

                <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/80">

                  {
                    pendingInvoices
                  }{" "}

                  producción
                  {pendingInvoices ===
                  1
                    ? ""
                    : "es"}{" "}

                  pendiente
                  {pendingInvoices ===
                  1
                    ? ""
                    : "s"}{" "}

                  de facturar.

                </p>

              </Link>
            )}

            {pendingRecoveries >
              0 && (
              <Link
                href="/admin/recuperaciones"
                className="rounded-3xl border border-amber-200 bg-amber-50 p-5 transition hover:border-amber-300 dark:border-amber-500/20 dark:bg-amber-500/10"
              >

                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Recuperaciones pendientes
                </p>

                <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/80">

                  Hay{" "}

                  {
                    pendingRecoveries
                  }{" "}

                  solicitud
                  {pendingRecoveries ===
                  1
                    ? ""
                    : "es"}{" "}

                  para revisar.

                </p>

              </Link>
            )}

          </div>
        )}

        {/* PRODUCCIONES */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10 md:p-8">

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Producciones
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Incluye producciones propias y compartidas con este cliente.
            </p>

          </div>

          {allProductions.length ===
          0 ? (
            <div className="p-8 text-center text-gray-500">
              Este cliente todavía no tiene producciones.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">

              {allProductions.map(
                (
                  production
                ) => {
                  const collected =
                    getProductionCollected(
                      production.id
                    )

                  const productionTotal =
                    Number(
                      production.total_amount ||
                        0
                    )

                  const pending =
                    Math.max(
                      productionTotal -
                        collected,
                      0
                    )

                  return (
                    <div
                      key={
                        production.id
                      }
                      className="flex flex-col gap-5 p-6 md:px-8 lg:flex-row lg:items-center"
                    >

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-semibold text-gray-900 dark:text-white">
                            {
                              production.property_name
                            }
                          </p>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              STATUS_CLASSES[
                                production.status
                              ] ||
                              STATUS_CLASSES.archived
                            }`}
                          >
                            {STATUS_LABELS[
                              production.status
                            ] ||
                              production.status}
                          </span>

                        </div>

                        {production.property_address && (
                          <p className="mt-1 text-sm text-gray-500">
                            {
                              production.property_address
                            }
                          </p>
                        )}

                        {production.services
                          ?.length >
                          0 && (
                          <p className="mt-2 text-xs text-gray-400">
                            {production.services.join(
                              " · "
                            )}
                          </p>
                        )}

                      </div>

                      <div className="grid gap-4 text-sm sm:grid-cols-2 lg:w-[46%] lg:grid-cols-4">

                        <div>

                          <p className="text-xs text-gray-400">
                            Fecha
                          </p>

                          <p className="mt-1 font-medium text-gray-700 dark:text-gray-300">
                            {formatDate(
                              production.production_date
                            )}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs text-gray-400">
                            Total
                          </p>

                          <p className="mt-1 font-medium text-gray-700 dark:text-gray-300">
                            {formatCurrency(
                              productionTotal
                            )}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs text-gray-400">
                            Cobrado
                          </p>

                          <p className="mt-1 font-medium text-emerald-600">
                            {formatCurrency(
                              collected
                            )}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs text-gray-400">
                            Pendiente
                          </p>

                          <p
                            className={`mt-1 font-semibold ${
                              pending >
                              0
                                ? "text-amber-600"
                                : "text-gray-400"
                            }`}
                          >
                            {formatCurrency(
                              pending
                            )}
                          </p>

                        </div>

                      </div>

                      <Link
                        href={`/admin/producciones/${production.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#0A9396] hover:underline"
                      >
                        Ver producción

                        <ArrowRight className="h-4 w-4" />
                      </Link>

                    </div>
                  )
                }
              )}

            </div>
          )}

        </section>

        {/* ACADEMY */}
        <section className="mt-6 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex items-center gap-3">

            <GraduationCap className="h-5 w-5 text-[#0A9396]" />

            <div>

              <h2 className="font-bold text-gray-900 dark:text-white">
                Clover Academy
              </h2>

              <p className="text-sm text-gray-500">
                Cursos asignados al cliente.
              </p>

            </div>

          </div>

          {allEnrollments.length ===
          0 ? (
            <p className="mt-5 text-sm text-gray-500">
              Sin cursos asignados.
            </p>
          ) : (
            <div className="mt-5 space-y-3">

              {allEnrollments.map(
                (
                  enrollment
                ) => {
                  const course =
                    Array.isArray(
                      enrollment.courses
                    )
                      ? enrollment
                          .courses[0]
                      : enrollment.courses

                  return (
                    <div
                      key={
                        enrollment.id
                      }
                      className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]"
                    >

                      <p className="font-semibold text-gray-900 dark:text-white">
                        {course?.title ||
                          "Curso"}
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#0A9396]">
                        Acceso permanente
                      </p>

                      <p className="mt-1 text-xs text-gray-400">

                        Asignado:{" "}

                        {formatDate(
                          enrollment.enrolled_at
                        )}

                      </p>

                    </div>
                  )
                }
              )}

            </div>
          )}

        </section>

        {/* RECUPERACIONES */}
        <section className="mt-6 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex items-center gap-3">

            <ArchiveRestore className="h-5 w-5 text-[#0A9396]" />

            <div>

              <h2 className="font-bold text-gray-900 dark:text-white">
                Recuperaciones
              </h2>

              <p className="text-sm text-gray-500">
                Solicitudes de recuperación de material.
              </p>

            </div>

          </div>

          {allRecoveries.length ===
          0 ? (
            <p className="mt-5 text-sm text-gray-500">
              Sin solicitudes de recuperación.
            </p>
          ) : (
            <div className="mt-5 space-y-3">

              {allRecoveries.map(
                (
                  recovery
                ) => {
                  const production =
                    getRecoveryProduction(
                      recovery.production_id
                    )

                  return (
                    <div
                      key={
                        recovery.id
                      }
                      className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03] sm:flex-row sm:items-center"
                    >

                      <div className="flex-1">

                        <p className="font-semibold text-gray-900 dark:text-white">
                          {production
                            ?.property_name ||
                            "Producción"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">

                          Solicitada el{" "}

                          {formatDate(
                            recovery.requested_at
                          )}

                        </p>

                      </div>

                      <div>

                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                          {RECOVERY_LABELS[
                            recovery.status
                          ] ||
                            recovery.status}
                        </span>

                      </div>

                      <Link
                        href="/admin/recuperaciones"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#0A9396] hover:underline"
                      >
                        Ver solicitud

                        <ArrowRight className="h-4 w-4" />
                      </Link>

                    </div>
                  )
                }
              )}

            </div>
          )}

        </section>

        {/* FINANZAS */}
        <Link
          href="/admin/finanzas"
          className="mt-6 flex items-center justify-between rounded-3xl border border-gray-200/70 bg-white p-6 transition hover:border-[#0A9396]/40 dark:border-white/10 dark:bg-[#06222c]"
        >

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
              <Banknote className="h-5 w-5" />
            </div>

            <div>

              <p className="font-semibold text-gray-900 dark:text-white">
                Ver finanzas generales
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Consultá pagos, facturación y movimientos de todas las producciones.
              </p>

            </div>

          </div>

          <ArrowRight className="h-5 w-5 text-[#0A9396]" />

        </Link>

      </div>

    </main>
  )
}