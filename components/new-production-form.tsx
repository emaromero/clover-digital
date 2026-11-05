"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Save,
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
  "Planos",
]

export default function NewProductionForm({
  clients,
}: Props) {
  const router = useRouter()

  const [clientId, setClientId] = useState("")
  const [propertyName, setPropertyName] = useState("")
  const [propertyAddress, setPropertyAddress] = useState("")
  const [productionDate, setProductionDate] = useState("")
  const [status, setStatus] = useState("confirmed")
  const [services, setServices] = useState<string[]>([])
  const [totalAmount, setTotalAmount] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")
  const [notes, setNotes] = useState("")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const toggleService = (service: string) => {
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service]
    )
  }

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault()

    if (!clientId) {
      setMessage("Elegí un cliente.")
      return
    }

    if (!propertyName.trim()) {
      setMessage("Ingresá el nombre de la propiedad.")
      return
    }

    setLoading(true)
    setMessage("")

    const supabase = createClient()

    const productionDateISO =
      productionDate
        ? new Date(productionDate).toISOString()
        : null

    const estimatedDeliveryISO =
      estimatedDelivery
        ? new Date(estimatedDelivery).toISOString()
        : null

    const { error } = await supabase
      .from("productions")
      .insert({
        user_id: clientId,
        property_name: propertyName.trim(),
        property_address:
          propertyAddress.trim() || null,
        production_date: productionDateISO,
        status,
        services,
        total_amount: totalAmount
          ? Number(totalAmount)
          : null,
        estimated_delivery_at:
          estimatedDeliveryISO,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error(error)
      setMessage("No pudimos crear la producción.")
      setLoading(false)
      return
    }

    router.push("/admin/producciones")
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
            Creá una producción y asignala a un cliente registrado.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8"
        >

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Cliente
            </label>

            <select
              value={clientId}
              onChange={(event) =>
                setClientId(event.target.value)
              }
              required
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
            >
              <option value="">
                Elegir cliente
              </option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.full_name || "Sin nombre"} —{" "}
                  {client.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Nombre de la propiedad
              </label>

              <input
                type="text"
                required
                placeholder="Ej. Av. Cabildo 1873"
                value={propertyName}
                onChange={(event) =>
                  setPropertyName(event.target.value)
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
                placeholder="CABA, Buenos Aires"
                value={propertyAddress}
                onChange={(event) =>
                  setPropertyAddress(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              />
            </div>

          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Fecha y hora
              </label>

              <div className="relative mt-2">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="datetime-local"
                  value={productionDate}
                  onChange={(event) =>
                    setProductionDate(
                      event.target.value
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
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
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

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Servicios
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service) => {
                const active =
                  services.includes(service)

                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() =>
                      toggleService(service)
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
              })}
            </div>
          </div>

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
                value={totalAmount}
                onChange={(event) =>
                  setTotalAmount(event.target.value)
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
                value={estimatedDelivery}
                onChange={(event) =>
                  setEstimatedDelivery(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Notas internas
            </label>

            <textarea
              rows={4}
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
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
              disabled={loading}
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