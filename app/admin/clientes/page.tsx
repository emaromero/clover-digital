import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Filter,
  FolderOpen,
  GraduationCap,
  Search,
  Settings2,
  Tag,
  UserRound,
  Users,
  X,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

interface PageProps {
  searchParams: Promise<{
    q?: string
    office?: string
    tag?: string
  }>
}

export default async function AdminClientesPage({
  searchParams,
}: PageProps) {
  const params =
    await searchParams

  const search =
    params.q
      ?.trim()
      .toLowerCase() ||
    ""

  const selectedOffice =
    params.office ||
    "all"

  const selectedTag =
    params.tag ||
    "all"

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
        office_id,
        created_at
      `)
      .order(
        "full_name",
        {
          ascending: true,
        }
      )

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
    data: profileTags,
  } =
    await supabase
      .from(
        "profile_tags"
      )
      .select(`
        user_id,
        tag_id
      `)

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
    data: productionUsers,
    error: productionUsersError,
  } =
    await supabase
      .from(
        "production_users"
      )
      .select(`
        production_id,
        user_id
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
      .from(
        "recovery_requests"
      )
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

  if (productionUsersError) {
    console.error(
      "Error cargando participantes:",
      productionUsersError
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

  const allOffices =
    offices || []

  const allClientTags =
    clientTags || []

  const allProfileTags =
    profileTags || []

  const allProductions =
    productions || []

  const allProductionUsers =
    productionUsers || []

  const allEnrollments =
    enrollments || []

  const allRecoveries =
    recoveryRequests || []

  const officeMap =
    new Map(
      allOffices.map(
        (office) => [
          office.id,
          office.name,
        ]
      )
    )

  const tagMap =
    new Map(
      allClientTags.map(
        (tag) => [
          tag.id,
          tag.name,
        ]
      )
    )

  const tagIdsByUser =
    new Map<
      string,
      string[]
    >()

  for (
    const row of
    allProfileTags
  ) {
    const current =
      tagIdsByUser.get(
        row.user_id
      ) || []

    current.push(
      row.tag_id
    )

    tagIdsByUser.set(
      row.user_id,
      current
    )
  }

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
   * PRODUCCIONES POR USUARIO
   */
  const productionIdsByUser =
    new Map<
      string,
      Set<string>
    >()

  for (
    const membership of
    allProductionUsers
  ) {
    const current =
      productionIdsByUser.get(
        membership.user_id
      ) ||
      new Set<string>()

    current.add(
      membership.production_id
    )

    productionIdsByUser.set(
      membership.user_id,
      current
    )
  }

  for (
    const production of
    allProductions
  ) {
    if (
      !production.user_id
    ) {
      continue
    }

    const current =
      productionIdsByUser.get(
        production.user_id
      ) ||
      new Set<string>()

    current.add(
      production.id
    )

    productionIdsByUser.set(
      production.user_id,
      current
    )
  }

  /*
   * CLIENTES REGISTRADOS
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
   * PENDIENTES DE REGISTRO
   */
  const participantCountByProduction =
    new Map<
      string,
      number
    >()

  for (
    const membership of
    allProductionUsers
  ) {
    participantCountByProduction.set(
      membership.production_id,
      (
        participantCountByProduction.get(
          membership.production_id
        ) || 0
      ) + 1
    )
  }

  const pendingMap =
    new Map<
      string,
      {
        name: string
        email: string
        productions:
          typeof allProductions
      }
    >()

  for (
    const production of
    allProductions
  ) {
    const participantCount =
      participantCountByProduction.get(
        production.id
      ) || 0

    if (
      participantCount >
      0
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

  const allPendingClients =
    Array.from(
      pendingMap.values()
    ).sort(
      (
        a,
        b
      ) =>
        a.name.localeCompare(
          b.name,
          "es"
        )
    )

  const filteredClients =
    clients.filter(
      (client) => {
        const clientTagIds =
          tagIdsByUser.get(
            client.id
          ) || []

        const officeName =
          client.office_id
            ? officeMap.get(
                client.office_id
              ) ||
              ""
            : ""

        const tagNames =
          clientTagIds
            .map(
              (tagId) =>
                tagMap.get(
                  tagId
                ) || ""
            )
            .join(" ")

        const searchableText =
          [
            client.full_name ||
              "",
            client.email ||
              "",
            client.phone ||
              "",
            officeName,
            tagNames,
          ]
            .join(" ")
            .toLowerCase()

        const matchesSearch =
          !search ||
          searchableText.includes(
            search
          )

        const matchesOffice =
          selectedOffice ===
            "all" ||
          client.office_id ===
            selectedOffice

        const matchesTag =
          selectedTag ===
            "all" ||
          clientTagIds.includes(
            selectedTag
          )

        return (
          matchesSearch &&
          matchesOffice &&
          matchesTag
        )
      }
    )

  /*
   * Pendientes no tienen todavía oficina/tags.
   * Solo los mostramos con búsqueda general
   * cuando no hay filtros de clasificación.
   */
  const filteredPendingClients =
    selectedOffice ===
      "all" &&
    selectedTag ===
      "all"
      ? allPendingClients.filter(
          (client) => {
            if (!search) {
              return true
            }

            const text =
              `${client.name} ${client.email}`
                .toLowerCase()

            return text.includes(
              search
            )
          }
        )
      : []

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
      items:
        typeof allProductions
    ) => {
      const validItems =
        items.filter(
          (item) => {
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
    allPendingClients.length

  const activeEnrollmentsCount =
    allEnrollments.filter(
      (item) =>
        item.status ===
        "active"
    ).length

  const hasFilters =
    Boolean(
      search
    ) ||
    selectedOffice !==
      "all" ||
    selectedTag !==
      "all"

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">

      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">

        {/* HEADER */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-sm font-semibold text-[#0A9396]">
              Clover Digital
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
              Clientes
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
              Consultá clientes, oficinas, tags, producciones y actividad dentro de Clover Digital.
            </p>

          </div>

          <Link
            href="/admin/configuracion"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0A9396]/30 bg-white px-4 py-3 text-sm font-semibold text-[#0A9396] transition hover:bg-[#0A9396]/5 dark:bg-[#06222c]"
          >
            <Settings2 className="h-4 w-4" />

            Oficinas y tags
          </Link>

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
                  {
                    totalClients
                  }
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
                  {
                    clients.length
                  }
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
                    allPendingClients.length
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

        {/* FILTROS */}
        <form
          method="GET"
          className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c]"
        >

          <div className="flex items-center gap-2">

            <Filter className="h-5 w-5 text-[#0A9396]" />

            <h2 className="font-semibold text-gray-900 dark:text-white">
              Buscar y filtrar clientes
            </h2>

          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">

            <div>

              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Buscar
              </label>

              <div className="relative mt-2">

                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  name="q"
                  defaultValue={
                    params.q ||
                    ""
                  }
                  placeholder="Nombre, email, oficina o tag"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
                />

              </div>

            </div>

            <div>

              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Oficina
              </label>

              <div className="relative mt-2">

                <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <select
                  name="office"
                  defaultValue={
                    selectedOffice
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
                >

                  <option value="all">
                    Todas
                  </option>

                  {allOffices.map(
                    (office) => (
                      <option
                        key={
                          office.id
                        }
                        value={
                          office.id
                        }
                      >
                        {
                          office.name
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            <div>

              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Tag
              </label>

              <div className="relative mt-2">

                <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <select
                  name="tag"
                  defaultValue={
                    selectedTag
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
                >

                  <option value="all">
                    Todos
                  </option>

                  {allClientTags.map(
                    (tag) => (
                      <option
                        key={
                          tag.id
                        }
                        value={
                          tag.id
                        }
                      >
                        {
                          tag.name
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

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

                {
                  filteredClients.length
                }{" "}

                cliente
                {filteredClients.length ===
                1
                  ? ""
                  : "s"}{" "}

                registrado
                {filteredClients.length ===
                1
                  ? ""
                  : "s"}{" "}

                encontrado
                {filteredClients.length ===
                1
                  ? ""
                  : "s"}

              </p>

              <Link
                href="/admin/clientes"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A9396] hover:underline"
              >
                <X className="h-4 w-4" />

                Limpiar filtros
              </Link>

            </div>
          )}

        </form>

        {/* PENDIENTES */}
        {filteredPendingClients.length >
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

              {filteredPendingClients.map(
                (client) => {
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

                      <div className="md:w-[120px]">

                        <p className="text-xs text-gray-400">
                          Producciones
                        </p>

                        <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                          {
                            client.productions.length
                          }
                        </p>

                      </div>

                      <div className="md:w-[150px]">

                        <p className="text-xs text-gray-400">
                          Última
                        </p>

                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(
                            lastProduction
                              ?.production_date
                          )}
                        </p>

                      </div>

                      <div className="md:w-[190px]">

                        <p className="text-xs text-gray-400">
                          Propiedad
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                          {lastProduction
                            ?.property_name ||
                            "-"}
                        </p>

                      </div>

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
                  )
                }
              )}

            </div>

          </section>
        )}

        {/* REGISTRADOS */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10 md:p-8">

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Clientes registrados
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Clientes con cuenta vinculada en Clover Digital.
                  </p>

                </div>

              </div>

              <p className="text-sm text-gray-400">

                {
                  filteredClients.length
                }{" "}

                resultado
                {filteredClients.length ===
                1
                  ? ""
                  : "s"}

              </p>

            </div>

          </div>

          {filteredClients.length ===
          0 ? (
            <div className="p-10 text-center">

              <Search className="mx-auto h-7 w-7 text-gray-300" />

              <p className="mt-3 font-semibold text-gray-700 dark:text-gray-200">
                No encontramos clientes
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Probá cambiando la búsqueda o los filtros.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">

              {filteredClients.map(
                (client) => {
                  const clientEmail =
                    normalizeEmail(
                      client.email
                    )

                  const productionIds =
                    productionIdsByUser.get(
                      client.id
                    ) ||
                    new Set<string>()

                  const clientProductions =
                    allProductions.filter(
                      (item) => {
                        if (
                          productionIds.has(
                            item.id
                          )
                        ) {
                          return true
                        }

                        if (
                          !item.user_id &&
                          clientEmail &&
                          normalizeEmail(
                            item.client_email
                          ) ===
                            clientEmail
                        ) {
                          return true
                        }

                        return false
                      }
                    )

                  const activeEnrollment =
                    allEnrollments.some(
                      (item) =>
                        item.user_id ===
                          client.id &&
                        item.status ===
                          "active"
                    )

                  const pendingRecoveries =
                    allRecoveries.filter(
                      (item) =>
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

                  const officeName =
                    client.office_id
                      ? officeMap.get(
                          client.office_id
                        ) ||
                        null
                      : null

                  const clientTagIds =
                    tagIdsByUser.get(
                      client.id
                    ) || []

                  const clientTagNames =
                    clientTagIds
                      .map(
                        (tagId) =>
                          tagMap.get(
                            tagId
                          )
                      )
                      .filter(
                        Boolean
                      ) as string[]

                  return (
                    <div
                      key={
                        client.id
                      }
                      className="flex flex-col gap-5 p-6 md:px-8"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

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

                            {officeName && (
                              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">

                                <Building2 className="h-3.5 w-3.5 text-[#0A9396]" />

                                {
                                  officeName
                                }

                              </p>
                            )}

                          </div>

                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:w-[470px] lg:grid-cols-3">

                          <div>

                            <p className="text-xs text-gray-400">
                              Producciones
                            </p>

                            <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                              {
                                clientProductions.length
                              }
                            </p>

                          </div>

                          <div>

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

                          <div>

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

                        </div>

                        <div className="lg:ml-auto">

                          <Link
                            href={`/admin/clientes/${client.id}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0A9396] hover:underline"
                          >
                            Ver cliente

                            <ArrowRight className="h-4 w-4" />
                          </Link>

                        </div>

                      </div>

                      {(clientTagNames.length >
                        0 ||
                        pendingRecoveries >
                          0) && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-white/10">

                          {clientTagNames.map(
                            (tagName) => (
                              <span
                                key={
                                  tagName
                                }
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#0A9396]/10 px-2.5 py-1 text-xs font-semibold text-[#0A9396]"
                              >
                                <Tag className="h-3 w-3" />

                                {
                                  tagName
                                }
                              </span>
                            )
                          )}

                          {pendingRecoveries >
                            0 && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">

                              {
                                pendingRecoveries
                              }{" "}

                              recuperación
                              {pendingRecoveries ===
                              1
                                ? ""
                                : "es"}{" "}

                              pendiente
                              {pendingRecoveries ===
                              1
                                ? ""
                                : "s"}

                            </span>
                          )}

                        </div>
                      )}

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

                {
                  activeEnrollmentsCount
                }{" "}

                {activeEnrollmentsCount ===
                1
                  ? "inscripción activa"
                  : "inscripciones activas"}

              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  )
}