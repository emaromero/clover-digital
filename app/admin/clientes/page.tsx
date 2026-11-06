import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  FolderOpen,
  GraduationCap,
  Mail,
  Phone,
  UserRound,
  Users,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

export default async function AdminClientesPage() {
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

  const { data: profiles } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      phone,
      avatar_url,
      created_at
    `)
    .order("full_name", {
      ascending: true,
    })

  const { data: productions } = await supabase
    .from("productions")
    .select(`
      id,
      user_id,
      status,
      production_date
    `)

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      user_id,
      status
    `)

  const { data: recoveryRequests } = await supabase
    .from("recovery_requests")
    .select(`
      id,
      user_id,
      status
    `)

  const clients = profiles || []
  const allProductions = productions || []
  const allEnrollments = enrollments || []
  const allRecoveries = recoveryRequests || []

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

        <div>
          <p className="text-sm font-semibold text-[#0A9396]">
            Clover Digital
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Clientes
          </h1>

          <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
            Consultá datos, producciones, acceso a Academy y solicitudes de recuperación de cada cliente.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                <Users className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Usuarios registrados
                </p>

                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {clients.length}
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
                  {allProductions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Academy activos
                </p>

                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    allEnrollments.filter(
                      (item) =>
                        item.status === "active"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Todos los clientes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Una ficha central por cada usuario registrado.
            </p>
          </div>

          {clients.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              Todavía no hay clientes registrados.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {clients.map((client) => {
                const clientProductions =
                  allProductions.filter(
                    (item) =>
                      item.user_id === client.id
                  )

                const activeEnrollment =
                  allEnrollments.some(
                    (item) =>
                      item.user_id === client.id &&
                      item.status === "active"
                  )

                const pendingRecoveries =
                  allRecoveries.filter(
                    (item) =>
                      item.user_id === client.id &&
                      (
                        item.status === "pending" ||
                        item.status === "reviewing"
                      )
                  ).length

                const lastProduction =
                  [...clientProductions]
                    .filter(
                      (item) =>
                        item.production_date
                    )
                    .sort(
                      (a, b) =>
                        new Date(
                          b.production_date!
                        ).getTime() -
                        new Date(
                          a.production_date!
                        ).getTime()
                    )[0]

                return (
                  <div
                    key={client.id}
                    className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:px-8"
                  >

                    <div className="flex min-w-0 flex-1 items-center gap-4">

                      {client.avatar_url ? (
                        <img
                          src={client.avatar_url}
                          alt=""
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396]">
                          <UserRound className="h-5 w-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">
                          {client.full_name ||
                            "Sin nombre"}
                        </p>

                        {client.email && (
                          <p className="mt-1 truncate text-sm text-gray-500">
                            {client.email}
                          </p>
                        )}

                        {client.phone && (
                          <p className="mt-1 text-xs text-gray-400">
                            {client.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="md:w-[130px]">
                      <p className="text-xs text-gray-400">
                        Producciones
                      </p>

                      <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                        {clientProductions.length}
                      </p>
                    </div>

                    <div className="md:w-[150px]">
                      <p className="text-xs text-gray-400">
                        Última producción
                      </p>

                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(
                          lastProduction?.production_date
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
                          pendingRecoveries > 0
                            ? "text-amber-600"
                            : "text-gray-400"
                        }`}
                      >
                        {pendingRecoveries}
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
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}