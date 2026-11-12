import Link from "next/link"
import { redirect } from "next/navigation"

import {
  Archive,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderOpen,
  GraduationCap,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

import LogoutButton from "@/components/logout-button"

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

export default async function CuentaPage() {
  const supabase =
    await createClient()

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const metadataName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Usuario"

  const metadataAvatar =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null

  const {
    data: profile,
  } =
    await supabase
      .from("profiles")
      .select(`
        full_name,
        email,
        avatar_url,
        phone
      `)
      .eq(
        "id",
        user.id
      )
      .maybeSingle()

  const profileName =
    profile?.full_name ||
    metadataName

const profileAvatar =
  metadataAvatar ||
  profile?.avatar_url ||
  null

// Sincronizar la foto de Google con el perfil
if (
  metadataAvatar &&
  metadataAvatar !== profile?.avatar_url &&
  typeof metadataAvatar === "string" &&
  metadataAvatar.startsWith("https://")
) {
  await supabase
    .from("profiles")
    .update({
      avatar_url: metadataAvatar,
    })
    .eq("id", user.id)
}

  /*
   * PRODUCCIONES
   */
  const {
    data: productionMemberships,
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
        user.id
      )

  const productionIds =
    productionMemberships?.map(
      (item) =>
        item.production_id
    ) || []

  let productions:
    {
      id: string
      property_name: string
      property_address: string | null
      production_date: string | null
      status: string
      services: string[]
      total_amount: number | null
      estimated_delivery_at: string | null
      delivered_at: string | null
      available_until: string | null
      created_at: string
    }[] = []

  if (
    productionIds.length >
    0
  ) {
    const {
      data,
    } =
      await supabase
        .from("productions")
        .select(`
          id,
          property_name,
          property_address,
          production_date,
          status,
          services,
          total_amount,
          estimated_delivery_at,
          delivered_at,
          available_until,
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

    productions =
      data || []
  }

  const allProductions =
    productions

  const now =
    Date.now()

  const activeProductions =
    allProductions.filter(
      (production) =>
        production.status ===
          "confirmed" ||
        production.status ===
          "completed" ||
        production.status ===
          "editing"
    )

  const deliveredProductions =
    allProductions.filter(
      (production) => {
        if (
          production.status !==
          "delivered"
        ) {
          return false
        }

        if (
          production.available_until
        ) {
          return (
            new Date(
              production.available_until
            ).getTime() >
            now
          )
        }

        return true
      }
    )

  const archivedProductions =
    allProductions.filter(
      (production) => {
        if (
          production.status ===
            "archived" ||
          production.status ===
            "cancelled"
        ) {
          return true
        }

        if (
          production.status ===
            "delivered" &&
          production.available_until &&
          new Date(
            production.available_until
          ).getTime() <=
            now
        ) {
          return true
        }

        return false
      }
    )

  const totalProductions =
    allProductions.length

  /*
   * ACADEMY
   */
  const {
    data: enrollments,
  } =
    await supabase
      .from("enrollments")
      .select(`
        id,
        status,
        course_id,
        courses (
          id,
          title,
          slug,
          description
        )
      `)
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "status",
        "active"
      )
      .order(
        "enrolled_at",
        {
          ascending: false,
        }
      )

  const activeEnrollments =
    enrollments || []

  /*
   * ADMIN
   */
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

  const isAdmin =
    roleData?.role ===
    "admin"

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) {
      return "A coordinar"
    }

    return new Intl.DateTimeFormat(
      "es-AR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    ).format(
      new Date(date)
    )
  }

  const firstName =
    profileName
      .split(" ")[0]

  const ProductionCard = ({
    production,
    archived = false,
  }: {
    production:
      (typeof allProductions)[number]

    archived?: boolean
  }) => {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:gap-5 md:px-6">

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white sm:text-base">
              {
                production.property_name
              }
            </h4>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs ${
                STATUS_CLASSES[
                  production.status
                ] ||
                STATUS_CLASSES.archived
              }`}
            >
              {
                archived &&
                production.status ===
                  "delivered"
                  ? "Archivada"
                  : STATUS_LABELS[
                      production.status
                    ] ||
                    production.status
              }
            </span>

          </div>

          {production.property_address && (
            <p className="mt-1 hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
              {
                production.property_address
              }
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400 sm:mt-3 sm:gap-x-5">

            {production.services
              ?.length >
              0 && (
              <span>
                {
                  production.services.join(
                    " · "
                  )
                }
              </span>
            )}

            <span>
              {formatDate(
                production.production_date
              )}
            </span>

          </div>

          {production.status ===
            "confirmed" &&
            production.estimated_delivery_at && (
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-300 sm:mt-3">

                Entrega estimada:{" "}

                {formatDate(
                  production.estimated_delivery_at
                )}

              </p>
            )}

          {(production.status ===
            "completed" ||
            production.status ===
              "editing") &&
            production.estimated_delivery_at && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-300 sm:mt-3">

                Entrega estimada:{" "}

                {formatDate(
                  production.estimated_delivery_at
                )}

              </p>
            )}

          {production.status ===
            "delivered" &&
            !archived &&
            production.available_until && (
              <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-300 sm:mt-3">

                Disponible hasta el{" "}

                {formatDate(
                  production.available_until
                )}

              </p>
            )}

          {archived &&
            production.status !==
              "cancelled" && (
              <p className="mt-2 text-xs text-gray-400 sm:mt-3">
                El período de disponibilidad online finalizó.
              </p>
            )}

        </div>

        <div className="shrink-0">

          <Link
            href={`/producciones/${production.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0A9396] hover:underline"
          >
            Ver producción

            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>

      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#f5fafa] px-4 py-6 dark:bg-[#001219] sm:py-10 md:py-16">

      <div className="mx-auto max-w-6xl">

        {/* CABECERA */}
        <section className="rounded-3xl border border-gray-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#06222c] sm:p-6 md:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">

            <div className="flex min-w-0 items-center gap-4 sm:gap-5">

              {profileAvatar ? (
                <img
                  src={
                    profileAvatar
                  }
                  alt={
                    profileName
                  }
                  className="h-14 w-14 shrink-0 rounded-full object-cover sm:h-16 sm:w-16"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/15 text-xl font-bold text-[#0A9396] sm:h-16 sm:w-16 sm:text-2xl">
                  {profileName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div className="min-w-0">

                <p className="text-xs font-semibold text-[#0A9396] sm:text-sm">
                  Portal Clover
                </p>

                <h1 className="mt-0.5 truncate text-2xl font-bold text-gray-900 dark:text-white sm:mt-1 sm:text-3xl md:text-4xl">
                  Hola,{" "}
                  {
                    firstName
                  }
                </h1>

                <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  {
                    user.email
                  }
                </p>

              </div>

            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">

              {isAdmin && (
                <Link
                  href="/admin"
                  className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-[#0A9396]/20 bg-[#0A9396]/10 px-3 py-2.5 text-sm font-semibold text-[#0A9396] transition hover:bg-[#0A9396]/15 sm:col-span-1 sm:px-4"
                >
                  <ShieldCheck className="h-4 w-4" />

                  Administrar
                </Link>
              )}

              <Link
                href="/cuenta/perfil"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 sm:px-4"
              >
                <UserRound className="h-4 w-4" />

                Mi perfil
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2.5 text-center text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 sm:px-4"
              >
                Volver a Clover Digital
              </Link>

            </div>

          </div>

        </section>

        {/* PRODUCCIONES */}
        <section
          id="producciones"
          className="mt-6 sm:mt-8"
        >

          <div>

            <p className="text-xs font-semibold text-[#0A9396] sm:text-sm">
              Clover Digital
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              Mis producciones
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Consultá tus trabajos, entregas e historial.
            </p>

          </div>

          {/* RESUMEN */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-4">

            <div className="rounded-2xl border border-gray-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#06222c] sm:rounded-3xl sm:p-5">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396] sm:h-10 sm:w-10">
                <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              <p className="mt-3 text-xs text-gray-500 sm:mt-4 sm:text-sm">
                Producciones
              </p>

              <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white sm:mt-1 sm:text-3xl">
                {
                  totalProductions
                }
              </p>

            </div>

            <div className="rounded-2xl border border-gray-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#06222c] sm:rounded-3xl sm:p-5">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300 sm:h-10 sm:w-10">
                <Clock3 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              <p className="mt-3 text-xs text-gray-500 sm:mt-4 sm:text-sm">
                En curso
              </p>

              <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white sm:mt-1 sm:text-3xl">
                {
                  activeProductions.length
                }
              </p>

            </div>

            <div className="rounded-2xl border border-gray-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#06222c] sm:rounded-3xl sm:p-5">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300 sm:h-10 sm:w-10">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              <p className="mt-3 text-xs text-gray-500 sm:mt-4 sm:text-sm">
                Disponibles
              </p>

              <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white sm:mt-1 sm:text-3xl">
                {
                  deliveredProductions.length
                }
              </p>

            </div>

            <div className="rounded-2xl border border-gray-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#06222c] sm:rounded-3xl sm:p-5">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300 sm:h-10 sm:w-10">
                <Archive className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              <p className="mt-3 text-xs text-gray-500 sm:mt-4 sm:text-sm">
                Historial
              </p>

              <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white sm:mt-1 sm:text-3xl">
                {
                  archivedProductions.length
                }
              </p>

            </div>

          </div>

          {totalProductions ===
          0 ? (
            <div className="mt-4 rounded-3xl border border-gray-200/70 bg-white p-7 text-center dark:border-white/10 dark:bg-[#06222c] sm:mt-5 sm:p-10">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396] sm:h-14 sm:w-14">
                <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                Todavía no tenés producciones
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                Cuando realices una producción con Clover Digital, vas a poder consultar desde acá su estado, entrega y material disponible.
              </p>

            </div>
          ) : (
            <>

              {/* EN CURSO */}
              {activeProductions.length >
                0 && (
                <section className="mt-4 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c] sm:mt-5">

                  <div className="border-b border-gray-100 p-4 dark:border-white/10 sm:p-6">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300 sm:h-10 sm:w-10">
                        <Clock3 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>

                      <div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          En curso
                        </h3>

                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                          Producciones confirmadas, realizadas o en edición.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-white/10">

                    {activeProductions.map(
                      (
                        production
                      ) => (
                        <ProductionCard
                          key={
                            production.id
                          }
                          production={
                            production
                          }
                        />
                      )
                    )}

                  </div>

                </section>
              )}

              {/* ENTREGADAS */}
              {deliveredProductions.length >
                0 && (
                <section className="mt-4 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c] sm:mt-5">

                  <div className="border-b border-gray-100 p-4 dark:border-white/10 sm:p-6">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300 sm:h-10 sm:w-10">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>

                      <div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Entregadas
                        </h3>

                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                          Material disponible para consultar y descargar.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-white/10">

                    {deliveredProductions.map(
                      (
                        production
                      ) => (
                        <ProductionCard
                          key={
                            production.id
                          }
                          production={
                            production
                          }
                        />
                      )
                    )}

                  </div>

                </section>
              )}

              {/* HISTORIAL */}
              {archivedProductions.length >
                0 && (
                <section className="mt-4 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c] sm:mt-5">

                  <div className="border-b border-gray-100 p-4 dark:border-white/10 sm:p-6">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300 sm:h-10 sm:w-10">
                        <Archive className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>

                      <div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Archivadas e historial
                        </h3>

                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                          Entregas vencidas y producciones canceladas.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-white/10">

                    {archivedProductions.map(
                      (
                        production
                      ) => (
                        <ProductionCard
                          key={
                            production.id
                          }
                          production={
                            production
                          }
                          archived={
                            true
                          }
                        />
                      )
                    )}

                  </div>

                </section>
              )}

            </>
          )}

        </section>

        {/* ACADEMY */}
        <section className="mt-6 sm:mt-8">

          <div className="rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c] sm:p-6 md:p-8">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-6">

              <div className="flex items-start gap-3 sm:gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396] sm:h-12 sm:w-12 sm:rounded-2xl">
                  <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                <div>

                  <p className="text-xs font-semibold text-[#0A9396] sm:text-sm">
                    Clover Academy
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    Tus cursos
                  </h2>

                  {activeEnrollments.length >
                  0 ? (
                    <p className="mt-1.5 max-w-2xl text-xs text-gray-500 dark:text-gray-400 sm:mt-2 sm:text-sm">

                      Tenés{" "}

                      <strong className="font-semibold text-gray-700 dark:text-gray-200">
                        {
                          activeEnrollments.length
                        }
                      </strong>{" "}

                      {activeEnrollments.length ===
                      1
                        ? "curso activo"
                        : "cursos activos"}
                      .

                    </p>
                  ) : (
                    <p className="mt-1.5 max-w-2xl text-xs leading-5 text-gray-500 dark:text-gray-400 sm:mt-2 sm:text-sm">
                      Cuando tengas acceso a un curso de Clover Academy, vas a poder entrar desde acá.
                    </p>
                  )}

                </div>

              </div>

              {activeEnrollments.length >
                0 && (
                <Link
                  href="/academy"
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001219] sm:w-auto sm:py-3"
                >
                  Ir a Academy

                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

            </div>

          </div>

        </section>

        {/* CIERRE */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-gray-200/70 pt-6 dark:border-white/10 sm:mt-10 sm:gap-4 sm:pt-8">

          <LogoutButton />

          <p className="text-xs text-gray-400">
            Portal privado · Clover Digital
          </p>

        </div>

      </div>

    </main>
  )
}