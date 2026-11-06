"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Mail,
  Save,
  UserCheck,
  UserPlus,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Client {
  id: string
  full_name: string | null
  email: string | null
}

interface Props {
  clients: Client[]
}

const SERVICES = [
  "Fotos HDR",
  "Video horizontal",
  "Video vertical",
  "Reel hablado",
  "Drone",
  "Fotos con logo",
]

type ClientMode =
  | "registered"
  | "pending"

export default function NewProductionForm({
  clients,
}: Props) {
  const router =
    useRouter()

  const [
    clientMode,
    setClientMode,
  ] =
    useState<ClientMode>(
      "registered"
    )

  const [
    clientId,
    setClientId,
  ] =
    useState("")

  const [
    pendingClientName,
    setPendingClientName,
  ] =
    useState("")

  const [
    pendingClientEmail,
    setPendingClientEmail,
  ] =
    useState("")

  const [
    propertyName,
    setPropertyName,
  ] =
    useState("")

  const [
    propertyAddress,
    setPropertyAddress,
  ] =
    useState("")

  const [
    productionDate,
    setProductionDate,
  ] =
    useState("")

  const [
    status,
    setStatus,
  ] =
    useState(
      "confirmed"
    )

  const [
    services,
    setServices,
  ] =
    useState<string[]>(
      []
    )

  const [
    totalAmount,
    setTotalAmount,
  ] =
    useState("")

  const [
    estimatedDelivery,
    setEstimatedDelivery,
  ] =
    useState("")

  const [
    notes,
    setNotes,
  ] =
    useState("")

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    message,
    setMessage,
  ] =
    useState("")

  const toggleService = (
    service: string
  ) => {
    setServices(
      (current) =>
        current.includes(
          service
        )
          ? current.filter(
              (item) =>
                item !==
                service
            )
          : [
              ...current,
              service,
            ]
    )
  }

  const handleSubmit =
    async (
      event: React.FormEvent
    ) => {
      event.preventDefault()

      setMessage("")

      /*
       * Validaciones cliente
       */
      if (
        clientMode ===
          "registered" &&
        !clientId
      ) {
        setMessage(
          "Elegí un cliente registrado."
        )
        return
      }

      if (
        clientMode ===
        "pending"
      ) {
        if (
          !pendingClientName.trim()
        ) {
          setMessage(
            "Ingresá el nombre del cliente."
          )
          return
        }

        if (
          !pendingClientEmail.trim()
        ) {
          setMessage(
            "Ingresá el email del cliente."
          )
          return
        }

        const validEmail =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            pendingClientEmail.trim()
          )

        if (!validEmail) {
          setMessage(
            "Ingresá un email válido."
          )
          return
        }
      }

      if (
        !propertyName.trim()
      ) {
        setMessage(
          "Ingresá el nombre de la propiedad."
        )
        return
      }

      setLoading(true)

      const supabase =
        createClient()

      const productionDateISO =
        productionDate
          ? new Date(
              productionDate
            ).toISOString()
          : null

      const estimatedDeliveryISO =
        estimatedDelivery
          ? new Date(
              estimatedDelivery
            ).toISOString()
          : null

      /*
       * Si es cliente registrado,
       * recuperamos también nombre
       * y email para guardarlos como
       * copia dentro de la producción.
       */
      let finalUserId:
        | string
        | null = null

      let finalClientName:
        | string
        | null = null

      let finalClientEmail:
        | string
        | null = null

      if (
        clientMode ===
        "registered"
      ) {
        const selectedClient =
          clients.find(
            (client) =>
              client.id ===
              clientId
          )

        finalUserId =
          clientId

        finalClientName =
          selectedClient
            ?.full_name ||
          null

        finalClientEmail =
          selectedClient
            ?.email ||
          null
      } else {
        finalUserId =
          null

        finalClientName =
          pendingClientName
            .trim()

        finalClientEmail =
          pendingClientEmail
            .trim()
            .toLowerCase()
      }

      /*
       * Si se crea directamente
       * como entregada, calculamos
       * fecha de entrega + 90 días.
       */
      let deliveredAt:
        | string
        | null = null

      let availableUntil:
        | string
        | null = null

      if (
        status ===
        "delivered"
      ) {
        const deliveredDate =
          new Date()

        const expiryDate =
          new Date(
            deliveredDate
          )

        expiryDate.setDate(
          expiryDate.getDate() +
            90
        )

        deliveredAt =
          deliveredDate.toISOString()

        availableUntil =
          expiryDate.toISOString()
      }

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "productions"
          )
          .insert({
            user_id:
              finalUserId,

            client_name:
              finalClientName,

            client_email:
              finalClientEmail,

            property_name:
              propertyName.trim(),

            property_address:
              propertyAddress.trim() ||
              null,

            production_date:
              productionDateISO,

            status,

            services,

            total_amount:
              totalAmount
                ? Number(
                    totalAmount
                  )
                : null,

            estimated_delivery_at:
              estimatedDeliveryISO,

            delivered_at:
              deliveredAt,

            available_until:
              availableUntil,

            notes:
              notes.trim() ||
              null,

            updated_at:
              new Date().toISOString(),
          })
          .select("id")
          .single()

      if (
        error ||
        !data
      ) {
        console.error(
          error
        )

        setMessage(
          "No pudimos crear la producción."
        )

        setLoading(false)
        return
      }

      /*
       * Entramos directamente
       * a la producción creada
       * para cargar el material.
       */
      router.push(
        `/admin/producciones/${data.id}`
      )

      router.refresh()
    }

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">

        <Link
          href="/admin/producciones"
          className="inline-flex items-center gap-2 text-sm text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />

          Volver a producciones
        </Link>

        <div className="mt-8">

          <p className="text-sm font-semibold text-[#0A9396]">
            Clover Digital
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Nueva producción
          </h1>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Creá una producción para un cliente registrado o cargá sus datos aunque todavía no tenga cuenta.
          </p>

        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-8 space-y-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8"
        >

          {/* TIPO DE CLIENTE */}
          <div>

            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Cliente
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setClientMode(
                    "registered"
                  )
                }
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  clientMode ===
                  "registered"
                    ? "border-[#0A9396] bg-[#0A9396]/10"
                    : "border-gray-200 hover:border-[#0A9396]/40 dark:border-white/10"
                }`}
              >

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    clientMode ===
                    "registered"
                      ? "bg-[#0A9396] text-white"
                      : "bg-gray-100 text-gray-500 dark:bg-white/10"
                  }`}
                >
                  <UserCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Cliente registrado
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    Ya tiene una cuenta en Clover Digital.
                  </p>
                </div>

              </button>

              <button
                type="button"
                onClick={() =>
                  setClientMode(
                    "pending"
                  )
                }
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  clientMode ===
                  "pending"
                    ? "border-[#0A9396] bg-[#0A9396]/10"
                    : "border-gray-200 hover:border-[#0A9396]/40 dark:border-white/10"
                }`}
              >

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    clientMode ===
                    "pending"
                      ? "bg-[#0A9396] text-white"
                      : "bg-gray-100 text-gray-500 dark:bg-white/10"
                  }`}
                >
                  <UserPlus className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Cliente sin cuenta
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    Todavía no se registró en Clover Digital.
                  </p>
                </div>

              </button>

            </div>
          </div>

          {/* CLIENTE REGISTRADO */}
          {clientMode ===
            "registered" && (
            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Cliente registrado
              </label>

              <select
                value={
                  clientId
                }
                onChange={(
                  event
                ) =>
                  setClientId(
                    event.target
                      .value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              >
                <option value="">
                  Elegir cliente
                </option>

                {clients.map(
                  (client) => (
                    <option
                      key={
                        client.id
                      }
                      value={
                        client.id
                      }
                    >
                      {client.full_name ||
                        "Sin nombre"}{" "}
                      —{" "}
                      {client.email}
                    </option>
                  )
                )}

              </select>

            </div>
          )}

          {/* CLIENTE PENDIENTE */}
          {clientMode ===
            "pending" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  <Mail className="h-5 w-5" />
                </div>

                <div>

                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    Cliente pendiente de registro
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-800/70 dark:text-amber-200/70">
                    Podés cargar todas sus producciones ahora. Cuando se registre en Clover Digital con este mismo email, se vincularán automáticamente a su cuenta.
                  </p>

                </div>

              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Nombre y apellido
                  </label>

                  <input
                    type="text"
                    value={
                      pendingClientName
                    }
                    onChange={(
                      event
                    ) =>
                      setPendingClientName(
                        event.target
                          .value
                      )
                    }
                    placeholder="Ej. Mariana Kuhn"
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email
                  </label>

                  <input
                    type="email"
                    value={
                      pendingClientEmail
                    }
                    onChange={(
                      event
                    ) =>
                      setPendingClientEmail(
                        event.target
                          .value
                      )
                    }
                    placeholder="cliente@email.com"
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
                  />

                </div>

              </div>

            </div>
          )}

          {/* PROPIEDAD */}
          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Nombre de la propiedad
              </label>

              <input
                type="text"
                required
                placeholder="Ej. Bucarelli 3354"
                value={
                  propertyName
                }
                onChange={(
                  event
                ) =>
                  setPropertyName(
                    event.target
                      .value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Dirección completa
              </label>

              <input
                type="text"
                placeholder="Bucarelli 3354, CABA"
                value={
                  propertyAddress
                }
                onChange={(
                  event
                ) =>
                  setPropertyAddress(
                    event.target
                      .value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              />

            </div>

          </div>

          {/* FECHA / ESTADO */}
          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Fecha y hora
              </label>

              <div className="relative mt-2">

                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="datetime-local"
                  value={
                    productionDate
                  }
                  onChange={(
                    event
                  ) =>
                    setProductionDate(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
                />

              </div>

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Estado
              </label>

              <select
                value={
                  status
                }
                onChange={(
                  event
                ) =>
                  setStatus(
                    event.target
                      .value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              >

                <option value="confirmed">
                  Confirmada
                </option>

                <option value="completed">
                  Realizada
                </option>

                <option value="editing">
                  En edición
                </option>

                <option value="delivered">
                  Entregada
                </option>

                <option value="archived">
                  Archivada
                </option>

                <option value="cancelled">
                  Cancelada
                </option>

              </select>

            </div>

          </div>

          {/* SERVICIOS */}
          <div>

            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Servicios
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {SERVICES.map(
                (service) => {
                  const active =
                    services.includes(
                      service
                    )

                  return (
                    <button
                      key={
                        service
                      }
                      type="button"
                      onClick={() =>
                        toggleService(
                          service
                        )
                      }
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                        active
                          ? "border-[#0A9396] bg-[#0A9396]/10 text-[#0A9396]"
                          : "border-gray-200 text-gray-600 hover:border-[#0A9396]/40 dark:border-white/10 dark:text-gray-300"
                      }`}
                    >
                      {service}
                    </button>
                  )
                }
              )}

            </div>
          </div>

          {/* PRECIO / ENTREGA */}
          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Valor total
              </label>

              <input
                type="number"
                min="0"
                step="1"
                placeholder="90000"
                value={
                  totalAmount
                }
                onChange={(
                  event
                ) =>
                  setTotalAmount(
                    event.target
                      .value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Entrega estimada
              </label>

              <input
                type="datetime-local"
                value={
                  estimatedDelivery
                }
                onChange={(
                  event
                ) =>
                  setEstimatedDelivery(
                    event.target
                      .value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              />

            </div>

          </div>

          {/* NOTAS */}
          <div>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Notas internas
            </label>

            <textarea
              rows={4}
              value={
                notes
              }
              onChange={(
                event
              ) =>
                setNotes(
                  event.target
                    .value
                )
              }
              placeholder="Observaciones de la producción..."
              className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
            />

          </div>

          {message && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {message}
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 dark:border-white/10 sm:flex-row sm:justify-end">

            <Link
              href="/admin/producciones"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={
                loading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-60"
            >

              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Crear producción
                </>
              )}

            </button>

          </div>

        </form>

      </div>
    </main>
  )
}