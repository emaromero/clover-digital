import Link from "next/link"

import {
  ArchiveRestore,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  CalendarDays,
  CircleDollarSign,
  FolderOpen,
  GraduationCap,
  IdCard,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  ReceiptText,
  Tag,
  UserRound,
} from "lucide-react"

import {
  notFound,
  redirect,
} from "next/navigation"

import { createClient } from "@/lib/supabase/server"

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

  let officeName:
    | string
    | null = null

  if (
    profile.office_id
  ) {
    const {
      data: office,
    } =
      await supabase
        .from(
          "client_offices"
        )
        .select(
          "name"
        )
        .eq(
          "id",
          profile.office_id
        )
        .maybeSingle()

    officeName =
      office?.name ||
      null
  }

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

  const clientTagIds =
    (
      profileTagRows ||
      []
    ).map(
      (item) =>
        item.tag_id
    )

  let clientTags:
    {
      id: string
      name: string
    }[] = []

  if (
    clientTagIds.length >
    0
  ) {
    const {
      data: tagRows,
    } =
      await supabase
        .from("tags")
        .select(`
          id,
          name
        `)
        .in(
          "id",
          clientTagIds
        )
        .order(
          "name",
          {
            ascending: true,
          }
        )

    clientTags =
      tagRows || []
  }

  /*
   * PRODUCCIONES
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

  const whatsappNumber =
    profile.phone
      ? profile.phone.replace(
          /\D/g,
          ""
        )
      : ""

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

        {/* CLIENTE */}
        <section className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

            <div className="flex min-w-0 flex-1 items-start gap-5">

              {profile.avatar_url ? (
                <img
                  src={
                    profile.avatar_url
                  }
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396]">
                  <UserRound className="h-8 w-8" />
                </div>
              )}

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-2">

                  <p className="text-sm font-semibold text-[#0A9396]">
                    Cliente Clover
                  </p>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Registrado
                  </span>

                </div>

                <h1 className="mt-1 truncate text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.full_name ||
                    "Sin nombre"}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">

                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#0A9396]"
                    >
                      <Mail className="h-4 w-4" />

                      {
                        profile.email
                      }
                    </a>
                  )}

                  {whatsappNumber ? (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#0A9396]/30 px-3 py-2 text-sm font-semibold text-[#0A9396] transition hover:bg-[#0A9396]/5"
                    >
                      <MessageCircle className="h-4 w-4" />

                      Hablar por WhatsApp
                    </a>
                  ) : (
                    <Link
                      href={`/admin/clientes/${profile.id}/editar`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A9396] hover:underline"
                    >
                      <Phone className="h-4 w-4" />

                      Agregar WhatsApp
                    </Link>
                  )}

                </div>

                {/* DATOS DEL CLIENTE */}
                <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 dark:border-white/10 sm:grid-cols-2 xl:grid-cols-3">

                  <div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">

                      <Building2 className="h-3.5 w-3.5 text-[#0A9396]" />

                      Oficina / inmobiliaria

                    </div>

                    <p className="mt-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {officeName ||
                        "Sin oficina"}
                    </p>

                  </div>

                  <div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">

                      <IdCard className="h-3.5 w-3.5 text-[#0A9396]" />

                      CUIT / CUIL / DNI

                    </div>

                    <p className="mt-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {taxData?.tax_id ||
                        "Sin cargar"}
                    </p>

                  </div>

                  <div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">

                      <Tag className="h-3.5 w-3.5 text-[#0A9396]" />

                      Tags

                    </div>

                    {clientTags.length >
                    0 ? (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">

                        {clientTags.map(
                          (tag) => (
                            <span
                              key={
                                tag.id
                              }
                              className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-600 dark:border-white/10 dark:text-gray-300"
                            >
                              {
                                tag.name
                              }
                            </span>
                          )
                        )}

                      </div>
                    ) : (
                      <p className="mt-1.5 text-sm font-medium text-gray-400">
                        Sin tags
                      </p>
                    )}

                  </div>

                </div>

              </div>

            </div>

            <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">

              <div className="flex items-center gap-2 text-sm text-gray-400">

                <CalendarDays className="h-4 w-4" />

                Registrado el{" "}

                {formatDate(
                  profile.created_at
                )}

              </div>

              <Link
                href={`/admin/clientes/${profile.id}/editar`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219]"
              >
                <Pencil className="h-4 w-4" />

                Editar cliente
              </Link>

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

        {/* PRODUCCIONES */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10 md:p-8">

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Producciones
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Producciones propias y compartidas con este cliente.
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

                  const hasAmount =
                    productionTotal >
                    0

                  const isPaid =
                    hasAmount &&
                    collected >=
                      productionTotal

                  const isPartial =
                    hasAmount &&
                    collected >
                      0 &&
                    collected <
                      productionTotal

                  const paymentLabel =
                    !hasAmount
                      ? "Sin importe"
                      : isPaid
                        ? "Cobrado"
                        : isPartial
                          ? "Pago parcial"
                          : "Pendiente"

                  const paymentClass =
                    !hasAmount
                      ? "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-300"
                      : isPaid
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"

                  return (
                    <div
                      key={
                        production.id
                      }
                      className="flex flex-col gap-5 p-6 md:px-8 lg:flex-row lg:items-center"
                    >

                      {/* DATOS DE LA PRODUCCIÓN */}
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

                      {/* FECHA */}
                      <div className="lg:w-[110px]">

                        <p className="text-xs text-gray-400">
                          Fecha
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatDate(
                            production.production_date
                          )}
                        </p>

                      </div>

                      {/* TOTAL + ESTADO DE PAGO */}
                      <div className="lg:w-[190px]">

                        <p className="text-xs text-gray-400">
                          Total
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2">

                          <p className="font-semibold text-gray-800 dark:text-gray-100">
                            {hasAmount
                              ? formatCurrency(
                                  productionTotal
                                )
                              : "-"}
                          </p>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${paymentClass}`}
                          >
                            {
                              paymentLabel
                            }
                          </span>

                        </div>

                        {isPartial && (
                          <p className="mt-1.5 text-xs text-gray-400">
                            Cobrado{" "}
                            <span className="font-semibold text-emerald-600">
                              {formatCurrency(
                                collected
                              )}
                            </span>
                            {" · "}
                            Resta{" "}
                            <span className="font-semibold text-amber-600">
                              {formatCurrency(
                                pending
                              )}
                            </span>
                          </p>
                        )}

                      </div>

                      {/* LINK */}
                      <Link
                        href={`/admin/producciones/${production.id}`}
                        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#0A9396] hover:underline"
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

                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                        {RECOVERY_LABELS[
                          recovery.status
                        ] ||
                          recovery.status}
                      </span>

                    </div>
                  )
                }
              )}

            </div>
          )}

        </section>

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
                Pagos, facturación y movimientos.
              </p>

            </div>

          </div>

          <ArrowRight className="h-5 w-5 text-[#0A9396]" />

        </Link>

      </div>

    </main>
  )
}