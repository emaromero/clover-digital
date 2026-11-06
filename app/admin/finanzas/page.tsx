import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  Banknote,
  CircleDollarSign,
  FileText,
  WalletCards,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

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

const INVOICE_LABELS: Record<
  string,
  string
> = {
  not_required:
    "No requiere",
  pending:
    "Pendiente",
  invoiced:
    "Facturada",
}

export default async function AdminFinanzasPage() {
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
      .eq("user_id", user.id)
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
      .order("paid_at", {
        ascending: false,
      })

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

  const profileMap = new Map(
    (profiles || []).map(
      (profile) => [
        profile.id,
        profile,
      ]
    )
  )

  const paymentsByProduction =
    new Map<string, number>()

  allPayments.forEach(
    (payment) => {
      const current =
        paymentsByProduction.get(
          payment.production_id
        ) || 0

      paymentsByProduction.set(
        payment.production_id,
        current +
          Number(payment.amount)
      )
    }
  )

  const totalBilled =
    allProductions.reduce(
      (sum, production) =>
        sum +
        Number(
          production.total_amount ||
            0
        ),
      0
    )

  const totalCollected =
    allPayments.reduce(
      (sum, payment) =>
        sum +
        Number(payment.amount),
      0
    )

  const totalPending =
    Math.max(
      totalBilled -
        totalCollected,
      0
    )

  const pendingInvoices =
    allProductions.filter(
      (production) =>
        production.invoice_status ===
        "pending"
    ).length

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">

        <div>
          <p className="text-sm font-semibold text-[#0A9396]">
            Clover Digital
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Finanzas
          </h1>

          <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
            Control general de producciones, cobros, saldos y facturación.
          </p>
        </div>

        {/* MÉTRICAS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">
            <CircleDollarSign className="h-6 w-6 text-[#0A9396]" />

            <p className="mt-4 text-sm text-gray-500">
              Total producido
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                totalBilled
              )}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">
            <Banknote className="h-6 w-6 text-emerald-600" />

            <p className="mt-4 text-sm text-gray-500">
              Cobrado
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {formatCurrency(
                totalCollected
              )}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">
            <WalletCards className="h-6 w-6 text-amber-600" />

            <p className="mt-4 text-sm text-gray-500">
              Pendiente
            </p>

            <p className="mt-1 text-2xl font-bold text-amber-600">
              {formatCurrency(
                totalPending
              )}
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
          </div>

        </div>

        {/* TABLA */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Producciones
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Estado financiero de cada producción.
            </p>
          </div>

          {allProductions.length ===
          0 ? (
            <div className="p-10 text-center text-gray-500">
              Todavía no hay producciones.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">

              {allProductions.map(
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
                        : paid <
                            total
                          ? "Parcial"
                          : "Pagado"

                  const profile =
                    profileMap.get(
                      production.user_id
                    )

                  return (
                    <div
                      key={
                        production.id
                      }
                      className="flex flex-col gap-5 p-6 md:px-8 lg:flex-row lg:items-center"
                    >

                      <div className="min-w-0 flex-1">

                        <p className="font-semibold text-gray-900 dark:text-white">
                          {
                            production.property_name
                          }
                        </p>

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

                      <div className="lg:w-[140px]">
                        <p className="text-xs text-gray-400">
                          Total
                        </p>

                        <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                          {formatCurrency(
                            total
                          )}
                        </p>
                      </div>

                      <div className="lg:w-[140px]">
                        <p className="text-xs text-gray-400">
                          Cobrado
                        </p>

                        <p className="mt-1 font-semibold text-emerald-600">
                          {formatCurrency(
                            paid
                          )}
                        </p>
                      </div>

                      <div className="lg:w-[140px]">
                        <p className="text-xs text-gray-400">
                          Pendiente
                        </p>

                        <p className="mt-1 font-semibold text-amber-600">
                          {formatCurrency(
                            pending
                          )}
                        </p>
                      </div>

                      <div className="lg:w-[120px]">
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

                      <div className="lg:w-[140px]">
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
      </div>
    </main>
  )
}