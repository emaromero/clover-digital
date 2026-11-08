import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderOpen,
  GraduationCap,
  UserRound,
  Users,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

export default async function AdminClientesPage() {
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
    data: profiles,
    error: profilesError,
  } =
    await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        avatar_url,
        created_at
      `)
      .order(
        "full_name",
        {
          ascending: true,
        }
      )

  const {
    data: productions,
    error: productionsError,
  } =
    await supabase
      .from("productions")
      .select(`
        id,
        user_id,
        client_name,
        client_email,
        property_name,
        status,
        production_date
      `)

  const {
    data: enrollments,
    error: enrollmentsError,
  } =
    await supabase
      .from("enrollments")
      .select(`
        id,
        user_id,
        status
      `)

  const {
    data: recoveryRequests,
    error: recoveryError,
  } =
    await supabase
      .from("recovery_requests")
      .select(`
        id,
        user_id,
        status
      `)

  if (profilesError) {
    console.error(
      "Error cargando perfiles:",
      profilesError
    )
  }

  if (productionsError) {
    console.error(
      "Error cargando producciones:",
      productionsError
    )
  }

  if (enrollmentsError) {
    console.error(
      "Error cargando inscripciones:",
      enrollmentsError
    )
  }

  if (recoveryError) {
    console.error(
      "Error cargando recuperaciones:",
      recoveryError
    )
  }

  const clients =
    profiles || []

  const allProductions =
    productions || []

  const allEnrollments =
    enrollments || []

  const allRecoveries =
    recoveryRequests || []

  const normalizeEmail = (
    email?: string | null
  ) =>
    typeof email ===
    "string"
      ? email
          .trim()
          .toLowerCase()
      : ""

  /*
   * Emails de usuarios que ya tienen
   * una cuenta registrada.
   */
  const registeredEmailMap =
    new Map(
      clients
        .filter(
          (client) =>
            Boolean(
              normalizeEmail(
                client.email
              )
            )
        )
        .map(
          (client) => [
            normalizeEmail(
              client.email
            ),
            client.id,
          ]
        )
    )

  /*
   * CLIENTES PENDIENTES
   *
   * Solo mostramos personas cuyo email
   * todavía NO corresponde a una cuenta
   * registrada.
   */
  const pendingMap =
    new Map<
      string,
      {
        name: string
        email: string
        productions: typeof allProductions
      }
    >()

  for (
    const production of
    allProductions
  ) {
    if (
      production.user_id
    ) {
      continue
    }

    const email =
      normalizeEmail(
        production.client_email
      )

    if (!email) {
      continue
    }

    /*
     * Si ese email ya pertenece a un perfil,
     * NO es un cliente pendiente de registro.
     */
    if (
      registeredEmailMap.has(
        email
      )
    ) {
      continue
    }

    const existing =
      pendingMap.get(
        email
      )

    if (existing) {
      existing.productions.push(
        production
      )

      if (
        existing.name ===
          "Sin nombre" &&
        production.client_name
      ) {
        existing.name =
          production.client_name
      }

      continue
    }

    pendingMap.set(
      email,
      {
        name:
          production.client_name ||
          "Sin nombre",

        email,

        productions: [
          production,
        ],
      }
    )
  }

  const pendingClients =
    Array.from(
      pendingMap.values()
    ).sort(
      (
        a,
        b
      ) =>
        a.name.localeCompare(
          b.name
        )
    )

  const formatDate = (
    value?: string | null
  ) => {
    if (!value) {
      return "-"
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-"
    }

    try {
      return new Intl.DateTimeFormat(
        "es-AR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      ).format(date)
    } catch {
      return "-"
    }
  }

  const getLastProduction =
    (
      items: typeof allProductions
    ) => {
      const validItems =
        items.filter(
          (
            item
          ) => {
            if (
              !item.production_date
            ) {
              return false
            }

            const date =
              new Date(
                item.production_date
              )

            return !Number.isNaN(
              date.getTime()
            )
          }
        )

      validItems.sort(
        (
          a,
          b
        ) =>
          new Date(
            b.production_date!
          ).getTime() -
          new Date(
            a.production_date!
          ).getTime()
      )

      return validItems[0]
  }

  const totalClients =
    clients.length +
    pendingClients.length

  const activeEnrollmentsCount =
    allEnrollments.filter(
      (
        item
      ) =>
        item.status ===
        "active"
    ).length

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">

      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">

        {/* HEADER */}
        <div>

          <p className="text-sm font-semibold text-[#0A9396]">
            Clover Digital
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Clientes
          </h1>

          <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
            Consultá clientes registrados, personas pendientes de registro, producciones, Academy y recuperaciones.
          </p>

        </div>

        {/* MÉTRICAS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">

                <Users className="h-6 w-6" />

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Total clientes
                </p>

                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalClients}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">

                <CheckCircle2 className="h-6 w-6" />

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Registrados
                </p>

                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {clients.length}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">

                <Clock3 className="h-6 w-6" />

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Pendientes
                </p>

                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    pendingClients.length
                  }
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">

                <FolderOpen className="h-6 w-6" />

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Producciones
                </p>

                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    allProductions.length
                  }
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* PENDIENTES */}
        {pendingClients.length >
          0 && (
          <section className="mt-8 overflow-hidden rounded-3xl border border-amber-200/80 bg-white dark:border-amber-500/20 dark:bg-[#06222c]">

            <div className="border-b border-amber-100 p-6 dark:border-amber-500/10 md:p-8">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">

                  <Clock3 className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Pendientes de registro
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Personas con producciones cargadas que todavía no crearon su cuenta.
                  </p>

                </div>

              </div>

            </div>

            <div className="divide-y divide-amber-100/70 dark:divide-amber-500/10">

              {pendingClients.map(
                (
                  client
                ) => {
                  const lastProduction =
                    getLastProduction(
                      client.productions
                    )

                  return (
                    <div
                      key={
                        client.email
                      }
                      className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:px-8"
                    >

                      <div className="flex min-w-0 flex-1 items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">

                          <UserRound className="h-5 w-5" />

                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="truncate font-semibold text-gray-900 dark:text-white">
                              {
                                client.name
                              }
                            </p>

                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                              Pendiente de registro
                            </span>

                          </div>

                          <p className="mt-1 truncate text-sm text-gray-500">
                            {
                              client.email
                            }
                          </p>

                        </div>

                      </div>

                      <div className="md:w-[130px]">

                        <p className="text-xs text-gray-400">
                          Producciones
                        </p>

                        <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                          {
                            client
                              .productions
                              .length
                          }
                        </p>

                      </div>

                      <div className="md:w-[160px]">

                        <p className="text-xs text-gray-400">
                          Última producción
                        </p>

                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(
                            lastProduction
                              ?.production_date
                          )}
                        </p>

                      </div>

                      <div className="md:w-[200px]">

                        <p className="text-xs text-gray-400">
                          Última propiedad
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                          {lastProduction
                            ?.property_name ||
                            "-"}
                        </p>

                      </div>

                      <div className="flex md:justify-end">

                        <Link
                          href={`/admin/producciones?q=${encodeURIComponent(
                            client.email
                          )}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-[#0A9396] hover:underline"
                        >
                          Ver producciones

                          <ArrowRight className="h-4 w-4" />
                        </Link>

                      </div>

                    </div>
                  )
                }
              )}

            </div>

          </section>
        )}

        {/* REGISTRADOS */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10 md:p-8">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">

                <CheckCircle2 className="h-5 w-5" />

              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Clientes registrados
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Personas que ya tienen una cuenta vinculada en Clover Digital.
                </p>

              </div>

            </div>

          </div>

          {clients.length ===
          0 ? (
            <div className="p-10 text-center text-gray-500">
              Todavía no hay clientes registrados.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">

              {clients.map(
                (
                  client
                ) => {
                  const clientEmail =
                    normalizeEmail(
                      client.email
                    )

                  /*
                   * Incluimos:
                   * 1. producciones vinculadas por user_id
                   * 2. producciones antiguas sin user_id cuyo
                   *    email coincide con este usuario registrado
                   */
                  const clientProductions =
                    allProductions.filter(
                      (
                        item
                      ) => {
                        if (
                          item.user_id ===
                          client.id
                        ) {
                          return true
                        }

                        if (
                          item.user_id
                        ) {
                          return false
                        }

                        if (
                          !clientEmail
                        ) {
                          return false
                        }

                        return (
                          normalizeEmail(
                            item.client_email
                          ) ===
                          clientEmail
                        )
                      }
                    )

                  const activeEnrollment =
                    allEnrollments.some(
                      (
                        item
                      ) =>
                        item.user_id ===
                          client.id &&
                        item.status ===
                          "active"
                    )

                  const pendingRecoveries =
                    allRecoveries.filter(
                      (
                        item
                      ) =>
                        item.user_id ===
                          client.id &&
                        (
                          item.status ===
                            "pending" ||
                          item.status ===
                            "reviewing"
                        )
                    ).length

                  const lastProduction =
                    getLastProduction(
                      clientProductions
                    )

                  return (
                    <div
                      key={
                        client.id
                      }
                      className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:px-8"
                    >

                      <div className="flex min-w-0 flex-1 items-center gap-4">

                        {client.avatar_url ? (
                          <img
                            src={
                              client.avatar_url
                            }
                            alt=""
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396]">

                            <UserRound className="h-5 w-5" />

                          </div>
                        )}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="truncate font-semibold text-gray-900 dark:text-white">
                              {client.full_name ||
                                "Sin nombre"}
                            </p>

                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                              Registrado
                            </span>

                          </div>

                          {client.email && (
                            <p className="mt-1 truncate text-sm text-gray-500">
                              {
                                client.email
                              }
                            </p>
                          )}

                          {client.phone && (
                            <p className="mt-1 text-xs text-gray-400">
                              {
                                client.phone
                              }
                            </p>
                          )}

                        </div>

                      </div>

                      <div className="md:w-[130px]">

                        <p className="text-xs text-gray-400">
                          Producciones
                        </p>

                        <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                          {
                            clientProductions.length
                          }
                        </p>

                      </div>

                      <div className="md:w-[150px]">

                        <p className="text-xs text-gray-400">
                          Última producción
                        </p>

                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(
                            lastProduction
                              ?.production_date
                          )}
                        </p>

                      </div>

                      <div className="md:w-[130px]">

                        <p className="text-xs text-gray-400">
                          Academy
                        </p>

                        <p
                          className={`mt-1 text-sm font-semibold ${
                            activeEnrollment
                              ? "text-[#0A9396]"
                              : "text-gray-400"
                          }`}
                        >
                          {activeEnrollment
                            ? "Activo"
                            : "Sin curso"}
                        </p>

                      </div>

                      <div className="md:w-[130px]">

                        <p className="text-xs text-gray-400">
                          Recuperaciones
                        </p>

                        <p
                          className={`mt-1 text-sm font-semibold ${
                            pendingRecoveries >
                            0
                              ? "text-amber-600"
                              : "text-gray-400"
                          }`}
                        >
                          {
                            pendingRecoveries
                          }
                        </p>

                      </div>

                      <div className="flex md:justify-end">

                        <Link
                          href={`/admin/clientes/${client.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-[#0A9396] hover:underline"
                        >
                          Ver cliente

                          <ArrowRight className="h-4 w-4" />
                        </Link>

                      </div>

                    </div>
                  )
                }
              )}

            </div>
          )}

        </section>

        {/* ACADEMY */}
        <div className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">

              <GraduationCap className="h-5 w-5" />

            </div>

            <div>

              <p className="font-semibold text-gray-900 dark:text-white">
                Clover Academy
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {activeEnrollmentsCount}{" "}
                {activeEnrollmentsCount ===
                1
                  ? "inscripción activa"
                  : "inscripciones activas"}
                .
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  )
}