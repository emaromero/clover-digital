
import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  Eye,
  FolderOpen,
  Users,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

type ActivityEvent = {
  id: string
  user_id: string
  production_id: string | null
  file_id: string | null
  event_type: string
  created_at: string
}

const LABELS: Record<string, string> = {
  portal_visit: "Visitó su portal",
  production_view: "Consultó una producción",
  material_click: "Abrió un enlace de material",
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "Sin actividad registrada"

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(value))
}

export default async function AdminActividadPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  if (role?.role !== "admin") {
    redirect("/cuenta")
  }

  const [
    eventsResult,
    profilesResult,
    productionsResult,
  ] = await Promise.all([
    supabase
      .from("client_activity_events")
      .select(
        "id, user_id, production_id, file_id, event_type, created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(1000),

    supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name", {
        ascending: true,
      }),

    supabase
      .from("productions")
      .select("id, property_name"),
  ])

  const events = (eventsResult.data || []) as ActivityEvent[]
  const profiles = profilesResult.data || []
  const productions = productionsResult.data || []

  const profilesById = new Map(
    profiles.map((profile) => [profile.id, profile])
  )

  const productionsById = new Map(
    productions.map((production) => [
      production.id,
      production,
    ])
  )

  const findLast = (userId: string, type: string) =>
    events.find(
      (event) =>
        event.user_id === userId &&
        event.event_type === type
    )?.created_at ?? null

  const clientsWithActivity = profiles.map((profile) => ({
    ...profile,
    lastPortalVisit: findLast(
      profile.id,
      "portal_visit"
    ),
    lastProductionView: findLast(
      profile.id,
      "production_view"
    ),
    lastMaterialClick: findLast(
      profile.id,
      "material_click"
    ),
  }))

  const totalProductionViews = events.filter(
    (event) => event.event_type === "production_view"
  ).length

  const totalMaterialClicks = events.filter(
    (event) => event.event_type === "material_click"
  ).length

  const clientsActive = new Set(
    events.map((event) => event.user_id)
  ).size

  return (
    <main className="min-h-screen bg-[#f5fafa] px-4 py-10 dark:bg-[#001219] md:py-16">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al administrador
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold text-[#0A9396]">
            Clover Digital
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            Actividad de clientes
          </h1>

          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Consultá quién ingresó al portal, qué producciones
            abrió y qué enlaces de entrega utilizó.
          </p>
        </div>

        {eventsResult.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            No pudimos consultar la actividad:
            {" "}
            {eventsResult.error.message}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <MetricCard
            title="Clientes con actividad"
            value={clientsActive}
            icon={<Users className="h-5 w-5" />}
          />

          <MetricCard
            title="Vistas de producciones"
            value={totalProductionViews}
            icon={<Eye className="h-5 w-5" />}
          />

          <MetricCard
            title="Clics en material"
            value={totalMaterialClicks}
            icon={<ExternalLink className="h-5 w-5" />}
          />
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#06222c]">
          <div className="border-b border-gray-100 p-5 dark:border-white/10 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Última actividad por cliente
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Se muestran los últimos datos disponibles
              dentro de los 1.000 eventos consultados.
            </p>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/10">
            {clientsWithActivity.map((client) => (
              <div
                key={client.id}
                className="p-5 md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/clientes/${client.id}`}
                      className="font-semibold text-gray-900 hover:text-[#0A9396] dark:text-white"
                    >
                      {client.full_name ||
                        client.email ||
                        "Cliente sin nombre"}
                    </Link>

                    <p className="mt-1 text-xs text-gray-400">
                      {client.email}
                    </p>
                  </div>

                  <Link
                    href={`/admin/clientes/${client.id}`}
                    className="text-xs font-semibold text-[#0A9396] hover:underline"
                  >
                    Ver cliente
                  </Link>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <ActivityValue
                    label="Última visita al portal"
                    value={formatDateTime(client.lastPortalVisit)}
                  />

                  <ActivityValue
                    label="Última producción consultada"
                    value={formatDateTime(
                      client.lastProductionView
                    )}
                  />

                  <ActivityValue
                    label="Último clic en material"
                    value={formatDateTime(
                      client.lastMaterialClick
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#06222c]">
          <div className="border-b border-gray-100 p-5 dark:border-white/10 md:p-6">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-[#0A9396]" />

              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Historial reciente
              </h2>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Últimos 100 eventos registrados.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              Todavía no hay actividad registrada.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {events.slice(0, 100).map((event) => {
                const client = profilesById.get(
                  event.user_id
                )

                const production = event.production_id
                  ? productionsById.get(event.production_id)
                  : null

                return (
                  <div
                    key={event.id}
                    className="flex flex-wrap items-start gap-4 p-5 md:p-6"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396]">
                      <FolderOpen className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {client?.full_name ||
                          client?.email ||
                          "Cliente"}
                      </p>

                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {LABELS[event.event_type] ||
                          event.event_type}
                      </p>

                      {production && (
                        <Link
                          href={`/admin/producciones/${production.id}`}
                          className="mt-1 inline-block text-sm text-[#0A9396] hover:underline"
                        >
                          {production.property_name}
                        </Link>
                      )}
                    </div>

                    <p className="text-xs text-gray-400">
                      {formatDateTime(event.created_at)}
                    </p>
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

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#06222c]">
      <div className="text-[#0A9396]">{icon}</div>

      <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        {title}
      </p>
    </div>
  )
}

function ActivityValue({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white">
        {value}
      </p>
    </div>
  )
}
