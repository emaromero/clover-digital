import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Gift, LockKeyhole, Sparkles, Trophy, TicketPercent } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Clover Rewards",
  robots: { index: false, follow: false },
}

const number = (value: number) =>
  new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value)

const currency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value)

type Summary = {
  coins_available: number
  points_rolling_12m: number
  club_tier: "plus" | "pro" | "elite"
  credit_available_ars: number
  active_coupons: number
  program_enabled: boolean
}

const levels = { plus: "Plus", pro: "Pro", elite: "Elite" } as const

export default async function RewardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/ingresar?next=%2Frewards")

  const { data, error } = await supabase.rpc("reward_my_summary")
  const summary = (data?.[0] ?? null) as Summary | null
  const enabled = Boolean(summary?.program_enabled)

  return (
    <main className="min-h-screen bg-[#f5fafa] px-4 py-8 dark:bg-[#001219] sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/cuenta" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A9396] hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a mi cuenta
        </Link>

        <div className="mt-6 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] sm:p-9">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
              <Gift className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0A9396]">Clover Digital</p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                Clover Rewards
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-300">
                Tus producciones y beneficios, en un solo lugar.
              </p>
            </div>
          </div>

          {!enabled ? (
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  Programa en preparación
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  Estamos configurando Clover Rewards. Todavía no se acreditan Coins,
                  puntos ni beneficios, y no hay canjes habilitados.
                </p>
              </div>
            </div>
          ) : error || !summary ? (
            <p role="alert" className="mt-8 text-sm text-red-600">
              No pudimos consultar tus beneficios. Intentá nuevamente más tarde.
            </p>
          ) : (
            <>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Coins disponibles", value: number(Number(summary.coins_available)), icon: Sparkles },
                  { label: "Clover Club", value: levels[summary.club_tier] ?? "Plus", icon: Trophy },
                  { label: "Puntos últimos 12 meses", value: number(Number(summary.points_rolling_12m)), icon: Trophy },
                  { label: "Créditos disponibles", value: currency(Number(summary.credit_available_ars)), icon: TicketPercent },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                      <Icon className="h-5 w-5 text-[#0A9396]" aria-hidden="true" />
                      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                      <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  )
                })}
              </div>

              <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
                Cupones activos: {summary.active_coupons}. Los beneficios se acreditan
                únicamente en las condiciones del programa.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
