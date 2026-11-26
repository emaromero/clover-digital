import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Coins, Gift, ShieldCheck, Trophy, TicketPercent, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Administración de Clover Rewards",
  robots: { index: false, follow: false },
}

type Overview = {
  program_enabled: boolean
  launch_date: string | null
  classifications: number
  coin_lots: number
  coins_issued: number
  point_events: number
  points_issued: number
  coupons: number
  credit_lots: number
  referrals: number
  missions: number
  recent_audit: {
    action: string
    entity_type: string
    entity_id: string | null
    created_at: string
  }[]
}

const quantity = (value: number) =>
  new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value)

const date = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(value))

export default async function AdminRewardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/ingresar")

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()
  if (role?.role !== "admin") redirect("/cuenta")

  // RPC administrativa: nunca expone saldos de usuarios individuales.
  const { data, error } = await supabase.rpc("reward_admin_overview")
  const overview = (!error && data && typeof data === "object"
    ? data as Overview
    : null)

  const stats = overview ? [
    { label: "Producciones clasificadas", value: overview.classifications, icon: ShieldCheck },
    { label: "Lotes de Coins", value: overview.coin_lots, icon: Coins },
    { label: "Coins acreditados", value: overview.coins_issued, icon: Coins },
    { label: "Eventos de puntos", value: overview.point_events, icon: Trophy },
    { label: "Puntos registrados", value: overview.points_issued, icon: Trophy },
    { label: "Cupones", value: overview.coupons, icon: TicketPercent },
    { label: "Créditos", value: overview.credit_lots, icon: Gift },
    { label: "Referidos", value: overview.referrals, icon: Users },
    { label: "Misiones", value: overview.missions, icon: Trophy },
  ] : []

  return (
    <main className="min-h-screen bg-[#f5fafa] px-4 py-8 dark:bg-[#001219] sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A9396] hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Volver a administración
        </Link>
        <div className="mt-6 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0A9396]">Solo administración</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Clover Rewards · Control</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
            Indicadores y auditoría de solo lectura. Desde esta pantalla no se acreditan ni se canjean recompensas.
          </p>
          {overview ? (
            <>
              <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm dark:bg-white/[0.03]">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Estado del programa: {overview.program_enabled ? "Activo" : "Desactivado"}
                </p>
                <p className="mt-1 text-gray-500 dark:text-gray-300">
                  Inicio de acreditaciones: {overview.launch_date ? date(overview.launch_date) : "Sin configurar"}
                </p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                      <Icon className="h-5 w-5 text-[#0A9396]" aria-hidden="true"/>
                      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{quantity(Number(stat.value))}</p>
                    </div>
                  )
                })}
              </div>
              <h2 className="mt-9 text-lg font-bold text-gray-900 dark:text-white">Últimos movimientos administrativos</h2>
              {!overview.recent_audit?.length ? (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Todavía no hay movimientos registrados.</p>
              ) : (
                <div className="mt-3 divide-y divide-gray-100 dark:divide-white/10">
                  {overview.recent_audit.map((entry, index) => (
                    <div key={`${entry.created_at}-${index}`} className="py-3 text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">{entry.action}</p>
                      <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400">
                        {entry.entity_type}{entry.entity_id ? ` · ${entry.entity_id}` : ""} · {date(entry.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p role="status" className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300">
              El panel está pendiente de la instalación de la consulta de auditoría. No se modificó ningún saldo.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
