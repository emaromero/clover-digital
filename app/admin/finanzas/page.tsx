import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  FileText,
  WalletCards,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

interface PageProps {
  searchParams: Promise<{
    month?: string
    year?: string
  }>
}

const MONTHS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
]

const INVOICE_LABELS: Record<
  string,
  string
> = {
  not_required: "No requiere",
  pending: "Pendiente",
  invoiced: "Facturada",
}

const formatCurrency = (
  value: number
) => {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }
  ).format(value)
}

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

const getPeriodBounds = (
  year: number,
  month: number
) => {
  const monthString =
    String(month).padStart(2, "0")

  let nextYear = year
  let nextMonth = month + 1

  if (nextMonth === 13) {
    nextMonth = 1
    nextYear = year + 1
  }

  const nextMonthString =
    String(nextMonth).padStart(
      2,
      "0"
    )

  return {
    start: new Date(
      `${year}-${monthString}-01T00:00:00-03:00`
    ),

    end: new Date(
      `${nextYear}-${nextMonthString}-01T00:00:00-03:00`
    ),
  }
}

export default async function AdminFinanzasPage({
  searchParams,
}: PageProps) {
  const params =
    await searchParams

  const now = new Date()

  const currentYear =
    now.getFullYear()

  const currentMonth =
    now.getMonth() + 1

  const selectedMonth =
    Number(params.month) >= 1 &&
    Number(params.month) <= 12
      ? Number(params.month)
      : currentMonth

  const selectedYear =
    Number(params.year) >= 2020 &&
    Number(params.year) <= 2100
      ? Number(params.year)
      : currentYear

  const period =
    getPeriodBounds(
      selectedYear,
      selectedMonth
    )

  const selectedMonthName =
    MONTHS.find(
      (month) =>
        month.value ===
        selectedMonth
    )?.label || ""

  const supabase =
    await createClient()

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const { data: roleData } =
    await supabase
      .from("user_roles")
      .select("role")
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle()

  if (
    roleData?.role !== "admin"
  ) {
    redirect("/cuenta")
  }

  const { data: productions } =
    await supabase
      .from("productions")
      .select(`
        id,
        user_id,
        property_name,
        property_address,
        production_date,
        status,
        total_amount,
        invoice_status,
        invoice_number,
        invoice_date,
        created_at
      `)
      .neq(
        "status",
        "cancelled"
      )
      .order(
        "production_date",
        {
          ascending: false,
          nullsFirst: false,
        }
      )

  const { data: payments } =
    await supabase
      .from(
        "production_payments"
      )
      .select(`
        id,
        production_id,
        amount,
        payment_method,
        paid_at
      `)
      .order(
        "paid_at",
        {
          ascending: false,
        }
      )

  const { data: profiles } =
    await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email
      `)

  const allProductions =
    productions || []

  const allPayments =
    payments || []

  const profileMap =
    new Map(
      (profiles || []).map(
        (profile) => [
          profile.id,
          profile,
        ]
      )
    )

  /*
   * PRODUCCIONES DEL PERÍODO
   * Se toma la fecha de producción.
   */
  const periodProductions =
    allProductions.filter(
      (production) => {
        if (
          !production.production_date
        ) {
          return false
        }

        const date =
          new Date(
            production.production_date
          )

        return (
          date >= period.start &&
          date < period.end
        )
      }
    )

  const periodProductionIds =
    new Set(
      periodProductions.map(
        (production) =>
          production.id
      )
    )

  /*
   * PAGOS DEL PERÍODO
   * Se toma la fecha real del cobro.
   */
  const periodPayments =
    allPayments.filter(
      (payment) => {
        if (!payment.paid_at) {
          return false
        }

        const date =
          new Date(
            payment.paid_at
          )

        return (
          date >= period.start &&
          date < period.end
        )
      }
    )

  /*
   * PAGOS HISTÓRICOS POR PRODUCCIÓN
   * Se usan para saber cuánto falta
   * cobrar de cada producción.
   */
  const paymentsByProduction =
    new Map<
      string,
      number
    >()

  allPayments.forEach(
    (payment) => {
      const current =
        paymentsByProduction.get(
          payment.production_id
        ) || 0

      paymentsByProduction.set(
        payment.production_id,
        current +
          Number(
            payment.amount
          )
      )
    }
  )

  /*
   * TOTAL PRODUCIDO DEL MES
   */
  const totalProduced =
    periodProductions.reduce(
      (
        sum,
        production
      ) =>
        sum +
        Number(
          production.total_amount ||
            0
        ),
      0
    )

  /*
   * COBRADO DURANTE EL MES
   */
  const totalCollected =
    periodPayments.reduce(
      (
        sum,
        payment
      ) =>
        sum +
        Number(
          payment.amount
        ),
      0
    )

  /*
   * SALDO ACTUAL PENDIENTE
   * DE LAS PRODUCCIONES DEL MES
   */
  const totalPending =
    periodProductions.reduce(
      (
        sum,
        production
      ) => {
        const total =
          Number(
            production.total_amount ||
              0
          )

        const paid =
          paymentsByProduction.get(
            production.id
          ) || 0

        return (
          sum +
          Math.max(
            total - paid,
            0
          )
        )
      },
      0
    )

  const pendingInvoices =
    periodProductions.filter(
      (production) =>
        production.invoice_status ===
        "pending"
    ).length

  /*
   * PRODUCCIONES DEL PERÍODO
   * QUE RECIBIERON ALGÚN PAGO
   * EN ESTE MISMO PERÍODO
   */
  const paidPeriodProductionIds =
    new Set(
      periodPayments
        .filter(
          (payment) =>
            periodProductionIds.has(
              payment.production_id
            )
        )
        .map(
          (payment) =>
            payment.production_id
        )
    )

  const yearOptions =
    Array.from(
      {
        length: 5,
      },
      (_, index) =>
        currentYear -
        2 +
        index
    )

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-sm font-semibold text-[#0A9396]">
              Clover Digital
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
              Finanzas
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
              Control de producción, cobros, saldos y facturación por período.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Inicio admin
          </Link>

        </div>

        {/* FILTRO */}
        <form
          method="GET"
          className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c]"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end">

            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Mes
              </label>

              <select
                name="month"
                defaultValue={
                  selectedMonth
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              >
                {MONTHS.map(
                  (month) => (
                    <option
                      key={
                        month.value
                      }
                      value={
                        month.value
                      }
                    >
                      {month.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Año
              </label>

              <select
                name="year"
                defaultValue={
                  selectedYear
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              >
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#001219]"
            >
              <CalendarDays className="h-4 w-4" />
              Ver período
            </button>

          </div>
        </form>

        <div className="mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando{" "}
            <strong className="font-semibold text-gray-900 dark:text-white">
              {selectedMonthName}{" "}
              {selectedYear}
            </strong>
          </p>
        </div>

        {/* MÉTRICAS */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <CircleDollarSign className="h-6 w-6 text-[#0A9396]" />

            <p className="mt-4 text-sm text-gray-500">
              Producción del mes
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                totalProduced
              )}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              {
                periodProductions.length
              }{" "}
              producciones
            </p>

          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <Banknote className="h-6 w-6 text-emerald-600" />

            <p className="mt-4 text-sm text-gray-500">
              Cobrado en el mes
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {formatCurrency(
                totalCollected
              )}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              {
                periodPayments.length
              }{" "}
              pagos registrados
            </p>

          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <WalletCards className="h-6 w-6 text-amber-600" />

            <p className="mt-4 text-sm text-gray-500">
              Saldo pendiente
            </p>

            <p className="mt-1 text-2xl font-bold text-amber-600">
              {formatCurrency(
                totalPending
              )}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              De las producciones del período
            </p>

          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

            <FileText className="h-6 w-6 text-[#0A9396]" />

            <p className="mt-4 text-sm text-gray-500">
              Pendientes de facturar
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {pendingInvoices}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              En el período seleccionado
            </p>

          </div>

        </div>

        {/* PRODUCCIONES */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10 md:p-8">

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Producciones de{" "}
              {selectedMonthName}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Estado financiero actual de cada producción realizada durante este período.
            </p>

          </div>

          {periodProductions.length ===
          0 ? (
            <div className="p-10 text-center">

              <CircleDollarSign className="mx-auto h-8 w-8 text-gray-300" />

              <p className="mt-4 font-semibold text-gray-800 dark:text-gray-200">
                No hay producciones en este período
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Probá seleccionando otro mes o año.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">

              {periodProductions.map(
                (production) => {
                  const total =
                    Number(
                      production.total_amount ||
                        0
                    )

                  const paid =
                    paymentsByProduction.get(
                      production.id
                    ) || 0

                  const pending =
                    Math.max(
                      total - paid,
                      0
                    )

                  const paymentStatus =
                    total <= 0
                      ? "Sin valor"
                      : paid <= 0
                        ? "Pendiente"
                        : paid < total
                          ? "Parcial"
                          : "Pagado"

                  const profile =
                    profileMap.get(
                      production.user_id
                    )

                  const receivedPaymentThisMonth =
                    paidPeriodProductionIds.has(
                      production.id
                    )

                  return (
                    <div
                      key={
                        production.id
                      }
                      className="flex flex-col gap-5 p-6 md:px-8 lg:flex-row lg:items-center"
                    >

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-semibold text-gray-900 dark:text-white">
                            {
                              production.property_name
                            }
                          </p>

                          {receivedPaymentThisMonth && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                              Cobro este mes
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          {profile?.full_name ||
                            profile?.email ||
                            "Cliente"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(
                            production.production_date
                          )}
                        </p>

                      </div>

                      <div className="lg:w-[135px]">

                        <p className="text-xs text-gray-400">
                          Total
                        </p>

                        <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                          {formatCurrency(
                            total
                          )}
                        </p>

                      </div>

                      <div className="lg:w-[135px]">

                        <p className="text-xs text-gray-400">
                          Cobrado total
                        </p>

                        <p className="mt-1 font-semibold text-emerald-600">
                          {formatCurrency(
                            paid
                          )}
                        </p>

                      </div>

                      <div className="lg:w-[135px]">

                        <p className="text-xs text-gray-400">
                          Pendiente
                        </p>

                        <p className="mt-1 font-semibold text-amber-600">
                          {formatCurrency(
                            pending
                          )}
                        </p>

                      </div>

                      <div className="lg:w-[110px]">

                        <p className="text-xs text-gray-400">
                          Estado
                        </p>

                        <p
                          className={`mt-1 text-sm font-semibold ${
                            paymentStatus ===
                            "Pagado"
                              ? "text-emerald-600"
                              : paymentStatus ===
                                  "Parcial"
                                ? "text-amber-600"
                                : "text-gray-500"
                          }`}
                        >
                          {paymentStatus}
                        </p>

                      </div>

                      <div className="lg:w-[125px]">

                        <p className="text-xs text-gray-400">
                          Factura
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {INVOICE_LABELS[
                            production.invoice_status
                          ] ||
                            production.invoice_status}
                        </p>

                      </div>

                      <Link
                        href={`/admin/producciones/${production.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#0A9396] hover:underline"
                      >
                        Gestionar

                        <ArrowRight className="h-4 w-4" />
                      </Link>

                    </div>
                  )
                }
              )}

            </div>
          )}

        </section>

        {/* ACLARACIÓN */}
        <div className="mt-6 rounded-2xl border border-gray-200/70 bg-white p-5 text-sm leading-6 text-gray-500 dark:border-white/10 dark:bg-[#06222c] dark:text-gray-400">

          <strong className="text-gray-800 dark:text-gray-200">
            Cómo se calculan los números:
          </strong>{" "}
          “Producción del mes” usa la fecha de la sesión.
          “Cobrado en el mes” usa la fecha en que realmente ingresó el pago.
          El saldo pendiente considera todos los pagos realizados hasta hoy sobre las producciones del período.

        </div>

      </div>
    </main>
  )
}