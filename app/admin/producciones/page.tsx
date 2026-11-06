import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowLeft,
  CalendarDays,
  Filter,
  FolderOpen,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

interface PageProps {
  searchParams: Promise<{
    q?: string
    status?: string
    month?: string
    year?: string
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

const MONTHS = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
]

export default async function AdminProduccionesPage({
  searchParams,
}: PageProps) {
  const params = await searchParams

  const search =
    params.q?.trim().toLowerCase() || ""

  const selectedStatus =
    params.status || "all"

  const selectedMonth =
    params.month || "all"

  const selectedYear =
    params.year || "all"

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

  const {
    data: productions,
    error: productionsError,
  } = await supabase
    .from("productions")
    .select(`
      id,
      user_id,
      property_name,
      property_address,
      production_date,
      status,
      services,
      total_amount,
      created_at
    `)
    .order("production_date", {
      ascending: false,
      nullsFirst: false,
    })

  if (productionsError) {
    console.error(
      "Error cargando producciones:",
      productionsError
    )
  }

  const {
    data: profiles,
    error: profilesError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      avatar_url
    `)

  if (profilesError) {
    console.error(
      "Error cargando perfiles:",
      profilesError
    )
  }

  const profileMap = new Map(
    (profiles || []).map((profile) => [
      profile.id,
      profile,
    ])
  )

  const allRows = productions || []

  const yearOptions = [
    ...new Set(
      allRows
        .filter(
          (production) =>
            production.production_date
        )
        .map((production) =>
          new Date(
            production.production_date!
          )
            .getFullYear()
            .toString()
        )
    ),
  ].sort(
    (a, b) =>
      Number(b) - Number(a)
  )

  const rows = allRows.filter(
    (production) => {
      const profile =
        profileMap.get(
          production.user_id
        )

      const matchesSearch =
        !search ||
        production.property_name
          ?.toLowerCase()
          .includes(search) ||
        production.property_address
          ?.toLowerCase()
          .includes(search) ||
        profile?.full_name
          ?.toLowerCase()
          .includes(search) ||
        profile?.email
          ?.toLowerCase()
          .includes(search)

      const matchesStatus =
        selectedStatus === "all" ||
        production.status ===
          selectedStatus

      let matchesMonth = true
      let matchesYear = true

      if (
        production.production_date
      ) {
        const date = new Date(
          production.production_date
        )

        if (
          selectedMonth !== "all"
        ) {
          matchesMonth =
            date.getMonth() + 1 ===
            Number(selectedMonth)
        }

        if (
          selectedYear !== "all"
        ) {
          matchesYear =
            date
              .getFullYear()
              .toString() ===
            selectedYear
        }
      } else {
        if (
          selectedMonth !== "all" ||
          selectedYear !== "all"
        ) {
          matchesMonth = false
          matchesYear = false
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMonth &&
        matchesYear
      )
    }
  )

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) return "A coordinar"

    return new Intl.DateTimeFormat(
      "es-AR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    ).format(new Date(date))
  }

  const money = (
    value?: number | null
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "-"
    }

    return `$ ${Number(
      value
    ).toLocaleString("es-AR")}`
  }

  const hasFilters =
    search ||
    selectedStatus !== "all" ||
    selectedMonth !== "all" ||
    selectedYear !== "all"

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">

        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-[#0A9396] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a administración
          </Link>
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-sm font-semibold text-[#0A9396]">
              Clover Digital
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
              Producciones
            </h1>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Gestioná propiedades, clientes y estados de entrega.
            </p>
          </div>

          <Link
            href="/admin/producciones/nueva"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219]"
          >
            <Plus className="h-4 w-4" />
            Nueva producción
          </Link>

        </div>

        {/* FILTROS */}
        <form
          method="GET"
          className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c]"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#0A9396]" />

            <h2 className="font-semibold text-gray-900 dark:text-white">
              Buscar y filtrar
            </h2>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Buscar
              </label>

              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  name="q"
                  defaultValue={params.q || ""}
                  placeholder="Cliente, email, propiedad o dirección"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Estado
              </label>

              <select
                name="status"
                defaultValue={selectedStatus}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              >
                <option value="all">
                  Todos
                </option>

                {Object.entries(
                  STATUS_LABELS
                ).map(
                  ([value, label]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Mes
              </label>

              <select
                name="month"
                defaultValue={selectedMonth}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              >
                <option value="all">
                  Todos
                </option>

                {MONTHS.map(
                  (month) => (
                    <option
                      key={month.value}
                      value={month.value}
                    >
                      {month.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Año
              </label>

              <select
                name="year"
                defaultValue={selectedYear}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              >
                <option value="all">
                  Todos
                </option>

                {yearOptions.map(
                  (year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              type="submit"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219]"
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>

          </div>

          {hasFilters && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-white/10">

              <p className="text-sm text-gray-500">
                Mostrando{" "}
                <strong className="font-semibold text-gray-900 dark:text-white">
                  {rows.length}
                </strong>{" "}
                de{" "}
                <strong className="font-semibold text-gray-900 dark:text-white">
                  {allRows.length}
                </strong>{" "}
                producciones
              </p>

              <Link
                href="/admin/producciones"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A9396] hover:underline"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </Link>

            </div>
          )}
        </form>

        {/* LISTADO */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <FolderOpen className="h-5 w-5 text-[#0A9396]" />

                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Producciones
                </h2>

              </div>

              <p className="text-sm text-gray-400">
                {rows.length} resultado
                {rows.length === 1
                  ? ""
                  : "s"}
              </p>

            </div>
          </div>

          {rows.length === 0 ? (
            <div className="p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                <FolderOpen className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                No encontramos producciones
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Probá cambiando o limpiando los filtros.
              </p>

              {hasFilters && (
                <Link
                  href="/admin/producciones"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0A9396] hover:underline"
                >
                  <X className="h-4 w-4" />
                  Ver todas
                </Link>
              )}

            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">

              {rows.map(
                (production) => {
                  const profile =
                    profileMap.get(
                      production.user_id
                    )

                  return (
                    <div
                      key={production.id}
                      className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:px-6"
                    >

                      <div className="flex min-w-0 flex-1 items-center gap-4">

                        {profile?.avatar_url ? (
                          <img
                            src={
                              profile.avatar_url
                            }
                            alt=""
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396]">
                            <UserRound className="h-5 w-5" />
                          </div>
                        )}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {
                                production.property_name
                              }
                            </h3>

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

                          <p className="mt-1 text-sm text-gray-500">
                            {profile?.full_name ||
                              "Sin nombre"}{" "}
                            ·{" "}
                            {profile?.email ||
                              "Sin email"}
                          </p>

                          {production.property_address && (
                            <p className="mt-1 text-xs text-gray-400">
                              {
                                production.property_address
                              }
                            </p>
                          )}

                        </div>
                      </div>

                      <div className="flex flex-wrap gap-5 text-sm text-gray-500 md:w-[42%]">

                        <div>
                          <p className="text-xs text-gray-400">
                            Fecha
                          </p>

                          <p className="mt-1 font-medium text-gray-700 dark:text-gray-200">
                            {formatDate(
                              production.production_date
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Servicios
                          </p>

                          <p className="mt-1 max-w-[220px] font-medium text-gray-700 dark:text-gray-200">
                            {production.services
                              ?.length
                              ? production.services.join(
                                  " · "
                                )
                              : "Sin servicios"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Total
                          </p>

                          <p className="mt-1 font-medium text-gray-700 dark:text-gray-200">
                            {money(
                              production.total_amount
                            )}
                          </p>
                        </div>

                      </div>

                      <div className="md:ml-auto">

                        <Link
                          href={`/admin/producciones/${production.id}`}
                          className="text-sm font-semibold text-[#0A9396] hover:underline"
                        >
                          Ver producción
                        </Link>

                      </div>

                    </div>
                  )
                }
              )}

            </div>
          )}
        </div>
      </div>
    </main>
  )
}