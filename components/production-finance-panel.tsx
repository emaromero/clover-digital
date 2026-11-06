"use client"

import { useMemo, useState } from "react"
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Payment {
  id: string
  production_id: string
  amount: number
  payment_method: string
  paid_at: string
  notes: string | null
  created_at: string
}

interface Props {
  productionId: string
  totalAmount: number | null
  initialPayments: Payment[]

  initialInvoiceStatus: string
  initialInvoiceNumber: string | null
  initialInvoiceDate: string | null
}

const PAYMENT_METHODS = [
  {
    value: "transfer",
    label: "Transferencia",
  },
  {
    value: "cash",
    label: "Efectivo",
  },
  {
    value: "mercadopago",
    label: "Mercado Pago",
  },
  {
    value: "other",
    label: "Otro",
  },
]

const INVOICE_STATUS = [
  {
    value: "not_required",
    label: "No requiere factura",
  },
  {
    value: "pending",
    label: "Pendiente de facturar",
  },
  {
    value: "invoiced",
    label: "Facturada",
  },
]

const formatCurrency = (
  amount: number
) => {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }
  ).format(amount)
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

const getLocalNow = () => {
  const date = new Date()

  const offset =
    date.getTimezoneOffset() * 60000

  return new Date(
    date.getTime() - offset
  )
    .toISOString()
    .slice(0, 16)
}

const toLocalInput = (
  value?: string | null
) => {
  if (!value) return ""

  const date = new Date(value)

  const offset =
    date.getTimezoneOffset() * 60000

  return new Date(
    date.getTime() - offset
  )
    .toISOString()
    .slice(0, 16)
}

export default function ProductionFinancePanel({
  productionId,
  totalAmount,
  initialPayments,
  initialInvoiceStatus,
  initialInvoiceNumber,
  initialInvoiceDate,
}: Props) {
  const [payments, setPayments] =
    useState<Payment[]>(
      initialPayments
    )

  const [amount, setAmount] =
    useState("")

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("transfer")

  const [paidAt, setPaidAt] =
    useState(getLocalNow())

  const [paymentNotes, setPaymentNotes] =
    useState("")

  const [adding, setAdding] =
    useState(false)

  const [paymentMessage, setPaymentMessage] =
    useState("")

  const [
    invoiceStatus,
    setInvoiceStatus,
  ] = useState(
    initialInvoiceStatus ||
      "not_required"
  )

  const [
    invoiceNumber,
    setInvoiceNumber,
  ] = useState(
    initialInvoiceNumber || ""
  )

  const [
    invoiceDate,
    setInvoiceDate,
  ] = useState(
    toLocalInput(
      initialInvoiceDate
    )
  )

  const [
    savingInvoice,
    setSavingInvoice,
  ] = useState(false)

  const [
    invoiceMessage,
    setInvoiceMessage,
  ] = useState("")

  const totalPaid = useMemo(
    () =>
      payments.reduce(
        (sum, payment) =>
          sum +
          Number(payment.amount),
        0
      ),
    [payments]
  )

  const productionTotal =
    Number(totalAmount || 0)

  const pendingAmount =
    Math.max(
      productionTotal - totalPaid,
      0
    )

  const paymentStatus =
    productionTotal <= 0
      ? "Sin valor"
      : totalPaid <= 0
        ? "Pendiente"
        : totalPaid <
            productionTotal
          ? "Parcial"
          : "Pagado"

  const paymentStatusClass =
    paymentStatus === "Pagado"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : paymentStatus === "Parcial"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
        : "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300"

  const handleAddPayment = async (
    event: React.FormEvent
  ) => {
    event.preventDefault()

    const numericAmount =
      Number(amount)

    if (
      !numericAmount ||
      numericAmount <= 0
    ) {
      setPaymentMessage(
        "Ingresá un importe válido."
      )
      return
    }

    if (!paidAt) {
      setPaymentMessage(
        "Indicá la fecha del pago."
      )
      return
    }

    setAdding(true)
    setPaymentMessage("")

    const supabase =
      createClient()

    const { data, error } =
      await supabase
        .from(
          "production_payments"
        )
        .insert({
          production_id:
            productionId,

          amount:
            numericAmount,

          payment_method:
            paymentMethod,

          paid_at:
            new Date(
              paidAt
            ).toISOString(),

          notes:
            paymentNotes.trim() ||
            null,
        })
        .select(`
          id,
          production_id,
          amount,
          payment_method,
          paid_at,
          notes,
          created_at
        `)
        .single()

    if (error || !data) {
      console.error(error)

      setPaymentMessage(
        "No pudimos registrar el pago."
      )

      setAdding(false)
      return
    }

    setPayments(
      (current) => [
        data,
        ...current,
      ]
    )

    setAmount("")
    setPaymentNotes("")
    setPaidAt(getLocalNow())

    setPaymentMessage(
      "Pago registrado correctamente."
    )

    setAdding(false)
  }

  const handleDeletePayment =
    async (
      paymentId: string
    ) => {
      const confirmed =
        window.confirm(
          "¿Querés eliminar este pago?"
        )

      if (!confirmed) {
        return
      }

      const supabase =
        createClient()

      const { error } =
        await supabase
          .from(
            "production_payments"
          )
          .delete()
          .eq("id", paymentId)

      if (error) {
        console.error(error)

        setPaymentMessage(
          "No pudimos eliminar el pago."
        )

        return
      }

      setPayments(
        (current) =>
          current.filter(
            (payment) =>
              payment.id !==
              paymentId
          )
      )

      setPaymentMessage(
        "Pago eliminado."
      )
    }

  const handleSaveInvoice =
    async (
      event: React.FormEvent
    ) => {
      event.preventDefault()

      setSavingInvoice(true)
      setInvoiceMessage("")

      const supabase =
        createClient()

      const { error } =
        await supabase
          .from("productions")
          .update({
            invoice_status:
              invoiceStatus,

            invoice_number:
              invoiceStatus ===
              "invoiced"
                ? invoiceNumber.trim() ||
                  null
                : null,

            invoice_date:
              invoiceStatus ===
                "invoiced" &&
              invoiceDate
                ? new Date(
                    invoiceDate
                  ).toISOString()
                : null,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            productionId
          )

      if (error) {
        console.error(error)

        setInvoiceMessage(
          "No pudimos guardar la facturación."
        )

        setSavingInvoice(false)
        return
      }

      setInvoiceMessage(
        "Facturación actualizada."
      )

      setSavingInvoice(false)
    }

  return (
    <section className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
          <WalletCards className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#0A9396]">
            Administración
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            Finanzas de la producción
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Registrá cobros, saldos y estado de facturación.
          </p>
        </div>
      </div>

      {/* RESUMEN */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl bg-gray-50 p-5 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-400">
            Valor total
          </p>

          <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(
              productionTotal
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-5 dark:bg-emerald-500/10">
          <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
            Cobrado
          </p>

          <p className="mt-2 text-xl font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(
              totalPaid
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 p-5 dark:bg-amber-500/10">
          <p className="text-xs text-amber-700/70 dark:text-amber-300/70">
            Pendiente
          </p>

          <p className="mt-2 text-xl font-bold text-amber-700 dark:text-amber-300">
            {formatCurrency(
              pendingAmount
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-5 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-400">
            Estado
          </p>

          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${paymentStatusClass}`}
          >
            {paymentStatus}
          </span>
        </div>

      </div>

      {/* PAGOS */}
      <div className="mt-8">

        <div className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-[#0A9396]" />

          <h3 className="font-bold text-gray-900 dark:text-white">
            Pagos registrados
          </h3>
        </div>

        <div className="mt-4 space-y-3">

          {payments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-white/10">
              Todavía no registraste pagos.
            </div>
          ) : (
            payments.map(
              (payment) => {
                const method =
                  PAYMENT_METHODS.find(
                    (item) =>
                      item.value ===
                      payment.payment_method
                  )

                return (
                  <div
                    key={payment.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 dark:border-white/10 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          Number(
                            payment.amount
                          )
                        )}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {method?.label ||
                          "Otro"}{" "}
                        ·{" "}
                        {formatDate(
                          payment.paid_at
                        )}
                      </p>

                      {payment.notes && (
                        <p className="mt-1 text-xs text-gray-400">
                          {payment.notes}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeletePayment(
                          payment.id
                        )
                      }
                      className="inline-flex items-center justify-center rounded-xl border border-red-200 px-3 py-2 text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
                      aria-label="Eliminar pago"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              }
            )
          )}

        </div>

        {/* NUEVO PAGO */}
        <form
          onSubmit={
            handleAddPayment
          }
          className="mt-5 rounded-2xl bg-gray-50 p-5 dark:bg-white/[0.03]"
        >

          <h4 className="font-semibold text-gray-900 dark:text-white">
            Registrar nuevo pago
          </h4>

          <div className="mt-4 grid gap-4 md:grid-cols-3">

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Importe
              </label>

              <input
                type="number"
                min="1"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                placeholder="70000"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Medio de pago
              </label>

              <select
                value={
                  paymentMethod
                }
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
              >
                {PAYMENT_METHODS.map(
                  (method) => (
                    <option
                      key={
                        method.value
                      }
                      value={
                        method.value
                      }
                    >
                      {method.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Fecha y hora
              </label>

              <input
                type="datetime-local"
                value={paidAt}
                onChange={(event) =>
                  setPaidAt(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
              />
            </div>

          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Nota
            </label>

            <input
              type="text"
              value={paymentNotes}
              onChange={(event) =>
                setPaymentNotes(
                  event.target.value
                )
              }
              placeholder="Ej: 50% reserva"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
            />
          </div>

          {paymentMessage && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {paymentMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={adding}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-60"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            Registrar pago
          </button>

        </form>
      </div>

      {/* FACTURACIÓN */}
      <form
        onSubmit={
          handleSaveInvoice
        }
        className="mt-8 border-t border-gray-100 pt-8 dark:border-white/10"
      >

        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#0A9396]" />

          <h3 className="font-bold text-gray-900 dark:text-white">
            Facturación
          </h3>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Estado
            </label>

            <select
              value={invoiceStatus}
              onChange={(event) =>
                setInvoiceStatus(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
            >
              {INVOICE_STATUS.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              N° de factura
            </label>

            <input
              type="text"
              disabled={
                invoiceStatus !==
                "invoiced"
              }
              value={invoiceNumber}
              onChange={(event) =>
                setInvoiceNumber(
                  event.target.value
                )
              }
              placeholder="Ej: 0001-00001234"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 disabled:opacity-50 dark:border-white/15 dark:bg-[#001219]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Fecha de factura
            </label>

            <input
              type="datetime-local"
              disabled={
                invoiceStatus !==
                "invoiced"
              }
              value={invoiceDate}
              onChange={(event) =>
                setInvoiceDate(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 disabled:opacity-50 dark:border-white/15 dark:bg-[#001219]"
            />
          </div>

        </div>

        {invoiceMessage && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {invoiceMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={
            savingInvoice
          }
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#0A9396]/30 px-5 py-3 text-sm font-semibold text-[#0A9396] transition hover:bg-[#0A9396]/10 disabled:opacity-60"
        >
          {savingInvoice ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}

          Guardar facturación
        </button>

      </form>
    </section>
  )
}