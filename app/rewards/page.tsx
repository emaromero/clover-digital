import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Gift, LockKeyhole, Sparkles, Trophy, TicketPercent } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import RewardInvites from "@/components/reward-invites"

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

type History = {
  coins: {id:string, production_name:string|null, original_coins:number, available_coins:number, created_at:string, expires_at:string}[]
  points: {id:string, production_name:string|null, points:number, occurred_at:string}[]
  coupons: {id:string, discount_ars:number, status:string, expires_at:string}[]
  credits: {id:string, original_ars:number, available_ars:number, expires_at:string}[]
}

const formatDay = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(value))

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
  // La consulta es privada y solo se realiza con el programa habilitado.
  // Si la migración de historial aún no está instalada, la página sigue operativa.
  const { data: historyData, error: historyError } = enabled
    ? await supabase.rpc("reward_my_history")
    : { data: null, error: null }
  const history = (!historyError && historyData && typeof historyData === "object"
    ? historyData as History
    : null)


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

              <section className="mt-6 rounded-2xl border border-gray-200 p-5 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Tu progreso en Clover Club
                  </h2>
                  <span className="text-sm font-semibold text-[#0A9396]">
                    {levels[summary.club_tier] ?? "Plus"}
                  </span>
                </div>
                {(() => {
                  const points = Math.max(0, Number(summary.points_rolling_12m) || 0)
                  const target = points >= 20 ? 20 : points >= 8 ? 20 : 8
                  const progress = Math.min(100, (points / target) * 100)
                  return (
                    <>
                      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10"
                        role="progressbar" aria-label="Progreso de puntos Clover Club"
                        aria-valuemin={0} aria-valuemax={target} aria-valuenow={Math.min(points, target)}>
                        <div className="h-full rounded-full bg-[#0A9396]" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                        {points >= 20
                          ? "Alcanzaste el umbral de Elite con 20 puntos en los últimos 12 meses."
                          : `Tenés ${number(points)} de ${target} puntos para alcanzar ${points >= 8 ? "Elite" : "Pro"}.`}
                      </p>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Plus: 0 a 7 puntos · Pro: 8 a 19 · Elite: 20 o más.
                        El nivel mostrado también puede incluir protección temporal de categoría.
                      </p>
                    </>
                  )
                })()}
              </section>

              <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
                Cupones activos: {summary.active_coupons}. Los beneficios se acreditan
                únicamente en las condiciones del programa.
              </p>
              <RewardInvites />
              <section className="mt-8 border-t border-gray-100 pt-6 dark:border-white/10">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Historial de recompensas
                </h2>
                {!history ? (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">
                    El historial estará disponible cuando se complete la configuración.
                  </p>
                ) : (
                  <>
                    <h3 className="mt-5 text-sm font-semibold text-gray-900 dark:text-white">Movimientos de Coins</h3>
                    {!history.coins?.length ? (
                      <p className="mt-2 text-sm text-gray-500">Todavía no tenés Coins acreditados.</p>
                    ) : (
                      <div className="mt-2 divide-y divide-gray-100 dark:divide-white/10">
                        {history.coins.map((lot) => (
                          <div key={lot.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {lot.production_name || "Recompensa de Clover"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Acreditado: {formatDay(lot.created_at)} · Vence: {formatDay(lot.expires_at)}
                              </p>
                            </div>
                            <span className="font-semibold text-[#0A9396]">
                              {number(Number(lot.available_coins))} / {number(Number(lot.original_coins))} Coins
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <h3 className="mt-6 text-sm font-semibold text-gray-900 dark:text-white">Puntos Clover Club</h3>
                    {!history.points?.length ? (
                      <p className="mt-2 text-sm text-gray-500">Todavía no hay movimientos de puntos.</p>
                    ) : (
                      <div className="mt-2 divide-y divide-gray-100 dark:divide-white/10">
                        {history.points.map((point) => (
                          <div key={point.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                            <span className="text-gray-900 dark:text-white">{point.production_name || "Ajuste de puntos"}</span>
                            <span className="font-semibold text-[#0A9396]">
                              {point.points > 0 ? "+" : ""}{point.points} · {formatDay(point.occurred_at)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-5 text-xs text-gray-500 dark:text-gray-400">
                      Cupones registrados: {history.coupons?.length ?? 0} · Créditos registrados: {history.credits?.length ?? 0}.
                    </p>
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
