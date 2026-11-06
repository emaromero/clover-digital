import Link from "next/link"
import { redirect } from "next/navigation"

import {
  Archive,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderOpen,
  GraduationCap,
  Settings,
  ShieldCheck,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import ProfileForm from "@/components/profile-form"

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

  /*
   * PERFIL
   */
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
    profile?.avatar_url ||
    metadataAvatar

  const profilePhone =
    profile?.phone || ""

  /*
   * PRODUCCIONES
   */
  const {
    data: productions,
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
      .eq(
        "user_id",
        user.id
      )
      .order(
        "production_date",
        {
          ascending: false,
          nullsFirst: false,
        }
      )

  const allProductions =
    productions || []

  const now =
    Date.now()

  /*
   * EN CURSO
   */
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

  /*
   * ENTREGADAS Y TODAVÍA
   * DISPONIBLES ONLINE
   */
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

  /*
   * ARCHIVADAS / HISTORIAL
   *
   * También incluimos:
   * - entregas cuyo período
   *   online ya venció
   * - canceladas
   */
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
    data: enrollment,
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
      .limit(1)
      .maybeSingle()

  const course =
    enrollment
      ? Array.isArray(
          enrollment.courses
        )
        ? enrollment
            .courses[0]
        : enrollment.courses
      : null

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
    production: (typeof allProductions)[number]
    archived?: boolean
  }) => {
    return (
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:px-6">

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h4 className="font-semibold text-gray-900 dark:text-white">
              {
                production.property_name
              }
            </h4>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
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
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {
                production.property_address
              }
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-400">

            <span>
              Producción:{" "}
              {formatDate(
                production.production_date
              )}
            </span>

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

          </div>

          {production.status ===
            "confirmed" &&
            production.estimated_delivery_at && (
              <p className="mt-3 text-xs text-blue-600 dark:text-blue-300">
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
              <p className="mt-3 text-xs text-amber-600 dark:text-amber-300">
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
              <p className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                Material disponible hasta el{" "}
                {formatDate(
                  production.available_until
                )}
              </p>
            )}

          {archived &&
            production.status !==
              "cancelled" && (
              <p className="mt-3 text-xs text-gray-400">
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
    <main className="min-h-screen bg-[#f5fafa] px-4 py-10 dark:bg-[#001219] md:py-16">

      <div className="mx-auto max-w-6xl">

        {/* CABECERA */}
        <section className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-5">

              {profileAvatar ? (
                <img
                  src={
                    profileAvatar
                  }
                  alt={
                    profileName
                  }
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0A9396]/15 text-2xl font-bold text-[#0A9396]">
                  {profileName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div>

                <p className="text-sm font-semibold text-[#0A9396]">
                  Portal Clover
                </p>

                <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                  Hola,{" "}
                  {firstName}
                </h1>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {
                    user.email
                  }
                </p>

              </div>

            </div>

            <div className="flex flex-wrap gap-3">

              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#0A9396]/20 bg-[#0A9396]/10 px-4 py-2.5 text-sm font-semibold text-[#0A9396] transition hover:bg-[#0A9396]/15"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Administrar
                </Link>
              )}

              <Link
                href="/"
                className="inline-flex items-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Volver a Clover Digital
              </Link>

            </div>

          </div>

        </section>

        {/* PRODUCCIONES */}
        <section
          id="producciones"
          className="mt-8"
        >

          <div>

            <p className="text-sm font-semibold text-[#0A9396]">
              Clover Digital
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              Mis producciones
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Consultá el estado, tus entregas y el historial de tus propiedades.
            </p>

          </div>

          {/* RESUMEN */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c]">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396]">
                <FolderOpen className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Producciones
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {
                  totalProductions
                }
              </p>

            </div>

            <div className="rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c]">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                <Clock3 className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm text-gray-500">
                En curso
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {
                  activeProductions.length
                }
              </p>

            </div>

            <div className="rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c]">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Disponibles
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {
                  deliveredProductions.length
                }
              </p>

            </div>

            <div className="rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c]">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300">
                <Archive className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Historial
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {
                  archivedProductions.length
                }
              </p>

            </div>

          </div>

          {totalProductions ===
          0 ? (
            <div className="mt-5 rounded-3xl border border-gray-200/70 bg-white p-10 text-center dark:border-white/10 dark:bg-[#06222c]">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                <FolderOpen className="h-6 w-6" />
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
              <section className="mt-5 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

                <div className="border-b border-gray-100 p-6 dark:border-white/10">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                      <Clock3 className="h-5 w-5" />
                    </div>

                    <div>

                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        En curso
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Producciones confirmadas, realizadas o que se encuentran en edición.
                      </p>

                    </div>

                  </div>

                </div>

                {activeProductions.length ===
                0 ? (
                  <div className="p-6 text-sm text-gray-500">
                    No tenés producciones en curso.
                  </div>
                ) : (
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
                )}

              </section>

              {/* ENTREGADAS */}
              <section className="mt-5 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

                <div className="border-b border-gray-100 p-6 dark:border-white/10">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div>

                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Entregadas
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Material disponible actualmente para consultar y descargar.
                      </p>

                    </div>

                  </div>

                </div>

                {deliveredProductions.length ===
                0 ? (
                  <div className="p-6 text-sm text-gray-500">
                    No tenés entregas disponibles en este momento.
                  </div>
                ) : (
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
                )}

              </section>

              {/* HISTORIAL */}
              <section className="mt-5 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

                <div className="border-b border-gray-100 p-6 dark:border-white/10">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300">
                      <Archive className="h-5 w-5" />
                    </div>

                    <div>

                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Archivadas e historial
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Entregas cuyo período online finalizó y producciones canceladas.
                      </p>

                    </div>

                  </div>

                </div>

                {archivedProductions.length ===
                0 ? (
                  <div className="p-6 text-sm text-gray-500">
                    Todavía no tenés producciones archivadas.
                  </div>
                ) : (
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
                )}

              </section>
            </>
          )}

        </section>

        {/* ACADEMY */}
        <section className="mt-8">

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                  <GraduationCap className="h-6 w-6" />
                </div>

                <div>

                  <p className="text-sm font-semibold text-[#0A9396]">
                    Clover Academy
                  </p>

                  {course ? (
                    <>
                      <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                        {
                          course.title
                        }
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                        Continuá aprendiendo desde donde lo dejaste.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                        Tus cursos
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                        Cuando te inscribas en un curso de Clover Academy, vas a poder acceder desde acá.
                      </p>
                    </>
                  )}

                </div>

              </div>

              {course && (
                <Link
                  href="/academy"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219]"
                >
                  Ir al curso

                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

            </div>

          </div>

        </section>

        {/* PERFIL */}
        <section className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300">
              <Settings className="h-5 w-5" />
            </div>

            <div>

              <p className="text-sm font-semibold text-[#0A9396]">
                Mi perfil
              </p>

              <h2 className="font-bold text-gray-900 dark:text-white">
                Datos personales
              </h2>

            </div>

          </div>

          <ProfileForm
            userId={
              user.id
            }
            initialName={
              profileName
            }
            email={
              user.email ||
              ""
            }
            initialAvatar={
              profileAvatar
            }
            initialPhone={
              profilePhone
            }
          />

        </section>

        <div className="mt-10 text-center text-xs text-gray-400">
          Portal privado · Clover Digital
        </div>

      </div>
    </main>
  )
}