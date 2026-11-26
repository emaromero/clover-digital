"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Classification = {
  package_code?: string
  property_size?: string
  drone_addon?: boolean
  extra_vertical_reels?: number
  extra_talking_reels?: number
  eligible_original_amount?: number
  discount_amount?: number
  travel_expenses?: number
  notes?: string | null
}

type RewardPreview = {
  production_id: string
  owner_id: string | null
  status: string
  total_amount: number | null
  paid_amount: number
  gross_coins: number
  coins_to_award: number
  points_to_award: number
  already_awarded: boolean
  program_enabled: boolean
  accrual_starts_at: string | null
  eligible: boolean
  reason: string
}

const previewReasons: Record<string, string> = {
  missing_owner: "Falta asignar un titular.",
  missing_classification: "Primero guardá la clasificación.",
  unapproved_classification: "La clasificación todavía no está aprobada.",
  owner_changed: "Cambió el titular; hay que revisar la clasificación.",
  not_delivered: "La producción todavía no está entregada.",
  invalid_total: "El importe total no es válido.",
  not_fully_paid: "La producción todavía no está completamente abonada.",
  amounts_changed: "El importe no coincide con la clasificación guardada.",
  not_eligible: "No hay importe elegible para recompensas.",
  zero_coins: "La recompensa calculada es cero.",
  unknown_package: "No se reconoce el paquete configurado.",
  already_awarded: "Esta producción ya tiene una acreditación.",
  delivery_date_missing: "Falta la fecha de entrega.",
  launch_date_not_configured: "La fecha de lanzamiento todavía no está configurada.",
  before_launch: "Esta producción es anterior al lanzamiento de Rewards.",
  program_disabled: "Rewards sigue desactivado por seguridad.",
  eligible: "Cumple todos los requisitos para acreditación.",
}

type Props = {
  productionId: string
  productionAmount: number | null
  hasOwner: boolean
}

const inputClass =
  "mt-1 block w-full min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#0A9396] dark:border-white/15 dark:bg-[#001219] dark:text-white"

const money = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(n)

export default function RewardProductionClassification({
  productionId,
  productionAmount,
  hasOwner,
}: Props) {
  const total = Number(productionAmount ?? 0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [preview, setPreview] = useState<RewardPreview | null>(null)
  const [existing, setExisting] = useState(false)
  const [packageCode, setPackageCode] = useState("completo")
  const [size, setSize] = useState("estandar")
  const [drone, setDrone] = useState(false)
  const [vertical, setVertical] = useState("0")
  const [talking, setTalking] = useState("0")
  const [original, setOriginal] = useState(String(total))
  const [discount, setDiscount] = useState("0")
  const [travel, setTravel] = useState("0")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    let live = true
    const load = async () => {
      const { data, error: fetchError } = await createClient().rpc(
        "reward_admin_get_classification",
        { p_production_id: productionId }
      )
      if (!live) return
      if (fetchError) {
        setError("No pudimos consultar la clasificación: " + fetchError.message)
      } else {
        const row = data as Classification | null
        if (row && Object.keys(row).length) {
          setExisting(true)
          setPackageCode(row.package_code || "completo")
          setSize(row.property_size || "estandar")
          setDrone(Boolean(row.drone_addon))
          setVertical(String(row.extra_vertical_reels ?? 0))
          setTalking(String(row.extra_talking_reels ?? 0))
          setOriginal(String(row.eligible_original_amount ?? total))
          setDiscount(String(row.discount_amount ?? 0))
          setTravel(String(row.travel_expenses ?? 0))
          setNotes(row.notes ?? "")
        }
      }
      setLoading(false)
    }
    void load()
    return () => { live = false }
  }, [productionId, total])

  const originalAmount = Number(original)
  const discountAmount = Number(discount)
  const travelAmount = Number(travel)
  const net = originalAmount - discountAmount
  const reconciled = [originalAmount, discountAmount, travelAmount].every(Number.isFinite)
    && originalAmount >= 0 && discountAmount >= 0
    && travelAmount >= 0 && discountAmount <= originalAmount
    && Math.abs(net + travelAmount - total) < 0.01
  const integerExtras = [vertical, talking].every((value) => {
    const numeric = Number(value)
    return Number.isInteger(numeric) && numeric >= 0 && numeric <= 20
  })

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess("")
    setPreview(null)
    if (!hasOwner || !reconciled || !integerExtras || productionAmount == null) {
      setError("Revisá el titular, los importes y las cantidades antes de guardar.")
      return
    }
    setSaving(true)
    try {
      const { error: saveError } = await createClient().rpc(
        "reward_admin_set_classification",
        {
          p_production_id: productionId,
          p_package_code: packageCode,
          p_property_size: size,
          p_drone_addon: drone,
          p_extra_vertical_reels: Number(vertical),
          p_extra_talking_reels: Number(talking),
          p_eligible_original_amount: originalAmount,
          p_discount_amount: discountAmount,
          p_travel_expenses: travelAmount,
          p_notes: notes.trim() || null,
        }
      )
      if (saveError) throw new Error(saveError.message)
      setExisting(true)
      setSuccess("Clasificación guardada. No se acreditaron Coins ni puntos.")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar la clasificación.")
    } finally {
      setSaving(false)
    }
  }

  const simulate = async () => {
    setError("")
    setSuccess("")
    setPreview(null)
    if (!existing) {
      setError("Primero guardá la clasificación para simular los beneficios.")
      return
    }
    setSimulating(true)
    try {
      const { data, error: previewError } = await createClient().rpc(
        "reward_admin_preview_production",
        { p_production_id: productionId }
      )
      if (previewError) throw new Error(previewError.message)
      if (!data || typeof data !== "object") {
        throw new Error("La simulación no devolvió resultados.")
      }
      setPreview(data as RewardPreview)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo simular la recompensa.")
    } finally {
      setSimulating(false)
    }
  }

  return (
    <section className="mb-6 rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c] sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#0A9396]/10 p-3 text-[#0A9396]">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Clasificación · Clover Rewards</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-300">
            Solo administración. Esta clasificación prepara el cálculo futuro, pero no acredita beneficios.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Consultando clasificación...
        </div>
      ) : (
        <form onSubmit={(event) => void save(event)} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Paquete
              <select className={inputClass} value={packageCode} onChange={e => setPackageCode(e.target.value)}>
                <option value="esenciales">Esenciales</option>
                <option value="redes">Redes sociales</option>
                <option value="completo">Completo</option>
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Tamaño de propiedad
              <select className={inputClass} value={size} onChange={e => setSize(e.target.value)}>
                <option value="estandar">Estándar</option>
                <option value="ampliada">Ampliada</option>
                <option value="grande">Grande</option>
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Reels verticales adicionales
              <input className={inputClass} type="number" min="0" max="20" step="1" value={vertical} onChange={e => setVertical(e.target.value)}/>
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Reels hablados adicionales
              <input className={inputClass} type="number" min="0" max="20" step="1" value={talking} onChange={e => setTalking(e.target.value)}/>
            </label>
          </div>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            <input type="checkbox" checked={drone} onChange={e => setDrone(e.target.checked)} className="h-4 w-4 accent-[#0A9396]" />
            Drone adicional incluido
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Importe audiovisual original (ARS)
              <input className={inputClass} type="number" min="0" step="0.01" value={original} onChange={e => setOriginal(e.target.value)} />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Descuento aplicado (ARS)
              <input className={inputClass} type="number" min="0" step="0.01" value={discount} onChange={e => setDiscount(e.target.value)} />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Viáticos (ARS)
              <input className={inputClass} type="number" min="0" step="0.01" value={travel} onChange={e => setTravel(e.target.value)} />
            </label>
          </div>
          <div className={`rounded-xl p-3 text-sm ${reconciled ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200" : "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200"}`}>
            Valor registrado: {money(total)} · Importe elegible neto: {Number.isFinite(net) ? money(net) : "Inválido"}
            <p className="mt-1 text-xs">
              {reconciled ? "La clasificación coincide con el total de esta producción." : "El neto más viáticos debe coincidir exactamente con el total registrado."}
            </p>
          </div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Observaciones internas
            <textarea className={inputClass} rows={2} maxLength={1000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional. No visible para clientes." />
          </label>
          {error && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}
          {success && <p role="status" className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4"/>{success}</p>}
          {!hasOwner && <p role="alert" className="text-sm text-amber-700">Esta producción no tiene titular asignado.</p>}
          <button type="submit" disabled={saving || !hasOwner || !reconciled || !integerExtras || productionAmount == null}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:cursor-not-allowed disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Guardando..." : existing ? "Actualizar clasificación" : "Guardar clasificación"}
          </button>

          <div className="border-t border-gray-100 pt-5 dark:border-white/10">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Simulación de recompensas
            </h3>
            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              Se calcula usando la clasificación guardada y los pagos actuales, no los cambios sin guardar.
              No acredita Coins, puntos ni descuentos.
            </p>
            <button
              type="button"
              onClick={() => void simulate()}
              disabled={simulating || saving || !existing}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0A9396]/30 px-4 py-2.5 text-sm font-semibold text-[#0A9396] hover:bg-[#0A9396]/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {simulating && <Loader2 className="h-4 w-4 animate-spin" />}
              {simulating ? "Calculando..." : "Simular recompensas"}
            </button>
            {preview && (
              <div role="status" className="mt-4 rounded-xl bg-gray-50 p-4 text-sm dark:bg-white/[0.03]">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Number(preview.coins_to_award).toLocaleString("es-AR", {maximumFractionDigits: 2})} Coins estimados
                  {" · "}
                  {preview.points_to_award} {preview.points_to_award === 1 ? "punto" : "puntos"} Club habilitados
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Total cobrado: {money(Number(preview.paid_amount || 0))}
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Estado: {previewReasons[preview.reason] ?? preview.reason}
                </p>
                {!preview.eligible && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    La simulación es informativa: no se puede acreditar mientras este requisito esté pendiente.
                  </p>
                )}
              </div>
            )}
          </div>
        </form>
      )}
    </section>
  )
}
