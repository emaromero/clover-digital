"use client"

import { useEffect, useMemo, useState } from "react"
import { Gift, Loader2, RefreshCw, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Referral = {
  id: string
  inviter: string
  invited: string
  status: string
  linked_at: string
  valid_until: string
  first_production_id: string | null
  credit_issued: boolean
}
type Overview = { enabled: boolean; referrals: Referral[]; discounts: number; credit_lots: number }
type Action = "discount" | "credit" | "spend" | "reverse" | "revoke"
type ClientOption = { id: string; full_name: string | null; email: string | null }
type ProductionOption = {
  id: string
  property_name: string | null
  property_address: string | null
  client_name: string | null
  production_date: string | null
  total_amount: number | null
  status: string | null
}
const money = (v: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(v)
const dateLabel = (value: string | null) => value
  ? new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date(value))
  : "Sin fecha"

export default function CloverInvitaAdmin() {
  const [data, setData] = useState<Overview | null>(null)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [productions, setProductions] = useState<ProductionOption[]>([])
  const [selected, setSelected] = useState("")
  const [production, setProduction] = useState("")
  const [owner, setOwner] = useState("")
  const [amount, setAmount] = useState("")
  const [kind, setKind] = useState<Action>("discount")
  const [clientSearch, setClientSearch] = useState("")
  const [productionSearch, setProductionSearch] = useState("")
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [confirm, setConfirm] = useState("")

  const load = async () => {
    const supabase = createClient()
    const [overviewResult, clientsResult, productionsResult] = await Promise.all([
      supabase.rpc("invita_admin_overview"),
      supabase.from("profiles").select("id, full_name, email").order("full_name", { ascending: true }).limit(500),
      supabase.from("productions").select("id, property_name, property_address, client_name, production_date, total_amount, status").order("production_date", { ascending: false, nullsFirst: false }).limit(500),
    ])
    if (overviewResult.error) throw new Error(overviewResult.error.message)
    if (clientsResult.error) throw new Error("No se pudo cargar la lista de clientes.")
    if (productionsResult.error) throw new Error("No se pudo cargar la lista de producciones.")
    setData(overviewResult.data as Overview)
    setClients((clientsResult.data || []) as ClientOption[])
    setProductions((productionsResult.data || []) as ProductionOption[])
  }

  useEffect(() => {
    let active = true
    const init = async () => {
      try {
        const supabase = createClient()
        const [overviewResult, clientsResult, productionsResult] = await Promise.all([
          supabase.rpc("invita_admin_overview"),
          supabase.from("profiles").select("id, full_name, email").order("full_name", { ascending: true }).limit(500),
          supabase.from("productions").select("id, property_name, property_address, client_name, production_date, total_amount, status").order("production_date", { ascending: false, nullsFirst: false }).limit(500),
        ])
        if (!active) return
        if (overviewResult.error) throw new Error(overviewResult.error.message)
        if (clientsResult.error) throw new Error("No se pudo cargar la lista de clientes.")
        if (productionsResult.error) throw new Error("No se pudo cargar la lista de producciones.")
        setData(overviewResult.data as Overview)
        setClients((clientsResult.data || []) as ClientOption[])
        setProductions((productionsResult.data || []) as ProductionOption[])
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "No se pudo cargar Clover Invita.")
      } finally {
        if (active) setChecking(false)
      }
    }
    void init()
    return () => { active = false }
  }, [])

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase()
    if (!q) return clients
    return clients.filter(c => `${c.full_name || ""} ${c.email || ""}`.toLowerCase().includes(q))
  }, [clients, clientSearch])

  const filteredProductions = useMemo(() => {
    const q = productionSearch.trim().toLowerCase()
    if (!q) return productions
    return productions.filter(p => `${p.property_name || ""} ${p.property_address || ""} ${p.client_name || ""}`.toLowerCase().includes(q))
  }, [productions, productionSearch])

  const selectedReferral = data?.referrals?.find(r => r.id === selected)
  const selectedProduction = productions.find(p => p.id === production)
  const selectedClient = clients.find(c => c.id === owner)

  const resetConfirmation = () => { setConfirm(""); setMessage(""); setError("") }

  const act = async () => {
    if (!data?.enabled || confirm !== "CONFIRMAR") return
    setLoading(true)
    setError("")
    setMessage("")
    try {
      const rpc = kind === "discount" ? "invita_admin_apply_discount"
        : kind === "credit" ? "invita_admin_issue_credit"
        : kind === "spend" ? "invita_admin_spend_credit"
        : kind === "revoke" ? "invita_admin_revoke_credit"
        : "invita_admin_reverse_spend"
      const params = kind === "discount" ? { p_referral_id: selected, p_production_id: production }
        : kind === "credit" || kind === "revoke" ? { p_referral_id: selected }
        : kind === "spend" ? { p_user_id: owner, p_production_id: production, p_amount_ars: Number(amount) }
        : { p_production_id: production }

      if ((kind === "discount" || kind === "credit" || kind === "revoke") && !selected)
        throw new Error("Seleccioná un referido.")
      if ((kind === "discount" || kind === "spend" || kind === "reverse") && !production)
        throw new Error("Seleccioná una producción.")
      if (kind === "spend" && (!owner || !Number.isFinite(Number(amount)) || Number(amount) <= 0))
        throw new Error("Seleccioná el cliente e ingresá un importe válido.")

      const { error: rpcError } = await createClient().rpc(rpc, params)
      if (rpcError) throw new Error(rpcError.message)

      const success: Record<Action, string> = {
        discount: "Descuento aplicado correctamente.",
        credit: "Crédito de $10.000 acreditado correctamente.",
        spend: "Crédito aplicado a la producción correctamente.",
        reverse: "Uso de crédito revertido correctamente.",
        revoke: "Crédito no utilizado revocado correctamente.",
      }
      setMessage(success[kind])
      setConfirm("")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo realizar la operación.")
    } finally {
      setLoading(false)
    }
  }

  const field = "mt-1 min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-white/10 dark:bg-[#001219] dark:text-white"
  const showReferral = kind === "discount" || kind === "credit" || kind === "revoke"
  const showProduction = kind === "discount" || kind === "spend" || kind === "reverse"
  const actionLabel: Record<Action, string> = {
    discount: "Aplicar 15% al recomendado",
    credit: "Acreditar $10.000 al recomendador",
    spend: "Usar crédito en futura producción",
    reverse: "Revertir uso antes del pago",
    revoke: "Revocar crédito no utilizado tras devolución",
  }

  return <section className="mt-8 rounded-2xl border border-gray-200 p-5 dark:border-white/10 sm:p-6">
    <div className="flex items-center gap-3"><Gift className="h-5 w-5 text-[#0A9396]"/><h2 className="text-lg font-bold text-gray-900 dark:text-white">Clover Invita · Administración</h2></div>
    <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">Administrá invitaciones y créditos seleccionando clientes y producciones por nombre. Los identificadores quedan ocultos.</p>
    {checking ? <p className="mt-4 text-sm text-gray-500">Consultando...</p> :
      <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
        Estado: {data?.enabled ? "Habilitado" : "Desactivado"} · Referidos: {data?.referrals?.length ?? 0} · Créditos: {data?.credit_lots ?? 0} · Descuentos: {data?.discounts ?? 0}
      </p>}
    <button type="button" onClick={() => { setError(""); void load().catch(e => setError(e instanceof Error ? e.message : String(e))) }}
      className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 px-3 text-sm dark:border-white/10">
      <RefreshCw className="h-4 w-4"/>Actualizar
    </button>

    {!!data?.referrals?.length && <div className="mt-5 space-y-2">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Referidos registrados</h3>
      {data.referrals.map(r => <button key={r.id} type="button" onClick={() => { setSelected(r.id); if (r.first_production_id) setProduction(r.first_production_id); resetConfirmation() }}
        className={"block w-full rounded-xl border p-3 text-left text-sm dark:border-white/10 " + (selected === r.id ? "border-[#0A9396]" : "border-gray-200")}>
        <span className="font-semibold text-gray-900 dark:text-white">{r.invited}</span>
        <span className="text-gray-500"> · Invitó: {r.inviter} · {r.status} · {dateLabel(r.linked_at)}</span>
        {r.credit_issued && <span className="ml-2 text-emerald-600">Crédito emitido</span>}
      </button>)}
    </div>}

    <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/10">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Operaciones</h3>
      <p className="mt-2 text-xs leading-5 text-gray-500">Aplicar descuento: 15% sobre la primera producción confirmada, sin pagos. Emitir crédito: primera producción con descuento, entregada y cobrada, sin monto mínimo. Gastar crédito: máximo 25% de una producción futura. Revertir uso: solo antes del cobro.</p>
      <label className="mt-4 block text-sm text-gray-700 dark:text-gray-200">Acción
        <select className={field} value={kind} onChange={e => { setKind(e.target.value as Action); resetConfirmation() }}>
          {Object.entries(actionLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>

      {showReferral && <div className="mt-3">
        <label className="block text-sm text-gray-700 dark:text-gray-200">Referido</label>
        <select className={field} value={selected} onChange={e => { setSelected(e.target.value); resetConfirmation() }}>
          <option value="">Seleccioná un referido...</option>
          {(data?.referrals || []).map(r => <option key={r.id} value={r.id}>
            {r.invited} · Invitó: {r.inviter} · {r.status} · {dateLabel(r.linked_at)}
          </option>)}
        </select>
        {!data?.referrals?.length && <p className="mt-1 text-xs text-gray-500">Todavía no hay invitaciones registradas.</p>}
      </div>}

      {showProduction && <div className="mt-3">
        <label className="block text-sm text-gray-700 dark:text-gray-200">Producción</label>
        <div className="relative mt-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
          <input value={productionSearch} onChange={e => setProductionSearch(e.target.value)}
            className={field + " pl-9"} placeholder="Buscar por propiedad, dirección o cliente"/>
        </div>
        <select className={field} value={production} onChange={e => { setProduction(e.target.value); resetConfirmation() }}>
          <option value="">Seleccioná una producción...</option>
          {filteredProductions.map(p => <option key={p.id} value={p.id}>
            {(p.property_name || p.property_address || "Propiedad sin nombre")}
            {p.client_name ? ` · ${p.client_name}` : ""}
            {` · ${dateLabel(p.production_date)} · ${money(Number(p.total_amount || 0))}`}
          </option>)}
        </select>
        {selectedProduction && <p className="mt-1 text-xs text-gray-500">Seleccionada: {selectedProduction.property_name || selectedProduction.property_address || "Producción"} · {selectedProduction.status || "Sin estado"}</p>}
      </div>}

      {kind === "spend" && <>
        <div className="mt-3">
          <label className="block text-sm text-gray-700 dark:text-gray-200">Cliente titular del crédito</label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
            <input value={clientSearch} onChange={e => setClientSearch(e.target.value)}
              className={field + " pl-9"} placeholder="Buscar por nombre o email"/>
          </div>
          <select className={field} value={owner} onChange={e => { setOwner(e.target.value); resetConfirmation() }}>
            <option value="">Seleccioná un cliente...</option>
            {filteredClients.map(c => <option key={c.id} value={c.id}>{c.full_name || "Sin nombre"}{c.email ? ` · ${c.email}` : ""}</option>)}
          </select>
          {selectedClient && <p className="mt-1 text-xs text-gray-500">Titular seleccionado: {selectedClient.full_name || selectedClient.email}</p>}
        </div>
        <label className="mt-3 block text-sm text-gray-700 dark:text-gray-200">Crédito a utilizar (ARS)
          <input className={field} type="number" min={0.01} step={0.01} value={amount} onChange={e => { setAmount(e.target.value); resetConfirmation() }} placeholder={money(10000)}/>
        </label>
      </>}

      <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-200">Escribí CONFIRMAR para realizar el movimiento
        <input className={field} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="CONFIRMAR" autoComplete="off"/>
      </label>
      <button type="button" disabled={!data?.enabled || loading || confirm !== "CONFIRMAR"} onClick={() => void act()}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 text-sm font-semibold text-white disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Gift className="h-4 w-4"/>}Ejecutar movimiento
      </button>
      {!data?.enabled && <p className="mt-2 text-xs text-gray-500">Las operaciones están bloqueadas hasta el lanzamiento individual de Invita.</p>}
    </div>
    {message && <p role="status" className="mt-4 text-sm text-emerald-700">{message}</p>}
    {error && <p role="alert" className="mt-4 break-all text-sm text-red-600">{error}</p>}
  </section>
}
