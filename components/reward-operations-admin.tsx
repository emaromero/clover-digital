"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ShieldCheck, Loader2, Search, AlertTriangle } from "lucide-react"

type Operation = "production" | "contract" | "coupon" | "referral" | "reversal"
const operations: {id:Operation; label:string; info:string}[] = [
  {id:"production",label:"Acreditar producción",info:"Revisa entrega, pago, clasificación y duplicados."},
  {id:"contract",label:"Acreditar contratación",info:"Una sola recompensa para todas las propiedades del contrato."},
  {id:"coupon",label:"Confirmar cupón",info:"Verifica titular, vigencia y descuento antes de confirmar el uso."},
  {id:"referral",label:"Liquidar referido",info:"Revisa la primera contratación antes de conceder el crédito."},
  {id:"reversal",label:"Revisar devolución",info:"Detecta Coins acreditados, reservados y puntos antes de cualquier ajuste."},
]
const rpcPreview:Record<Operation,string> = {
  production:"reward_admin_preview_production",
  contract:"reward_admin_preview_contract",
  coupon:"reward_admin_preview_coupon_use",
  referral:"reward_admin_preview_referral",
  reversal:"reward_admin_preview_reversal",
}
const rpcAward:Partial<Record<Operation,string>> = {
  production:"reward_admin_award_production",
  contract:"reward_admin_award_contract",
  coupon:"reward_admin_confirm_coupon_use",
  referral:"reward_admin_settle_referral",
}
const isUUID=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
const reasons:Record<string,string>={
  eligible:"Cumple los requisitos",
  program_disabled:"Rewards está desactivado",
  launch_date_not_configured:"Fecha de inicio no configurada",
  before_launch:"La entrega es anterior a la fecha de inicio",
  not_delivered:"Falta entregar la producción",
  not_all_delivered:"Falta entregar una o más propiedades",
  not_fully_paid:"El cobro no está completo",
  already_awarded:"Ya tiene una acreditación",
  missing_classification:"Falta la clasificación administrativa",
  owner_changed:"Cambió el titular",
  amounts_changed:"Los importes no coinciden con la clasificación",
  shared_contract_requires_separate_review:"La contratación compartida requiere revisión específica",
  eligible_for_admin_review:"Cumple las condiciones preliminares; requiere aprobación",
  no_production:"El referido aún no tiene producciones",
  already_credited:"El referido ya fue liquidado",
  coupon_expired:"El cupón está vencido",
  coupon_not_issued:"El cupón no está disponible",
  production_not_confirmed:"La producción todavía no está confirmada",
  cannot_combine_with_credits:"No se puede combinar con créditos",
}
const formatted=(value:unknown)=>JSON.stringify(value,null,2)

export default function RewardOperationsAdmin({enabled}:{enabled:boolean}) {
  const [kind,setKind]=useState<Operation>("production")
  const [first,setFirst]=useState("")
  const [second,setSecond]=useState("")
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState("")
  const [result,setResult]=useState<Record<string,unknown>|null>(null)
  const [previewed,setPreviewed]=useState(false)
  const [confirmation,setConfirmation]=useState("")
  const [completed,setCompleted]=useState(false)
  const [discountVerified,setDiscountVerified]=useState(false)
  const current=operations.find(o=>o.id===kind)!
  const validFirst=kind==="reversal"?/^(production|contract):[0-9a-f-]{36}$/i.test(first.trim()):isUUID(first.trim())
  const valid=validFirst&&(kind!=="coupon"||isUUID(second.trim()))
  const params=()=>{
    if(kind==="production")return {p_production_id:first.trim()}
    if(kind==="contract")return {p_group_id:first.trim()}
    if(kind==="coupon")return {p_coupon_id:first.trim(),p_production_id:second.trim()}
    if(kind==="referral")return {p_referral_id:first.trim()}
    return {p_source_key:first.trim()}
  }
  const reset=(k:Operation)=>{
    setKind(k);setFirst("");setSecond("");setResult(null);setError("")
    setPreviewed(false);setConfirmation("");setCompleted(false);setDiscountVerified(false)
  }
  const simulate=async()=>{
    if(!valid)return
    setLoading(true);setError("");setResult(null);setPreviewed(false);setCompleted(false);setConfirmation("")
    try{
      const supabase=createClient()
      const {data,error:rpcError}=await supabase.rpc(rpcPreview[kind],params())
      if(rpcError)throw new Error(rpcError.message)
      if(!data||typeof data!=="object"||Array.isArray(data))throw new Error("La función no devolvió un diagnóstico válido.")
      setResult(data as Record<string,unknown>)
      setPreviewed(true)
    }catch(err){setError(err instanceof Error?err.message:"No se pudo evaluar la operación.")}
    finally{setLoading(false)}
  }
  const perform=async()=>{
    if(!enabled||!previewed||!valid||!rpcAward[kind]||confirmation!=="CONFIRMAR"||completed||!safeToExecute||(kind==="referral"&&!discountVerified))return
    setLoading(true);setError("")
    try{
      const actionParams = kind==="referral" ? {...params(),p_confirm_discount_recorded:discountVerified} : params()
      const {data,error:rpcError}=await createClient().rpc(rpcAward[kind]!,actionParams)
      if(rpcError)throw new Error(rpcError.message)
      setResult(data as Record<string,unknown>)
      setCompleted(true)
      setPreviewed(false)
      setConfirmation("")
    }catch(err){setError(err instanceof Error?err.message:"No se pudo completar la operación.")}
    finally{setLoading(false)}
  }
  const safeToExecute=Boolean(result)&&(
    kind==="referral" ? result?.reason==="eligible_for_admin_review" :
    kind==="coupon" ? result?.reason==="eligible" && result?.eligible===true :
    kind==="production"||kind==="contract" ? result?.reason==="eligible" && result?.eligible===true :
    false
  )
  return <section className="mt-8 rounded-2xl border border-gray-200 p-5 dark:border-white/10 sm:p-6">
    <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#0A9396]"/>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Centro de operaciones Rewards</h2>
    </div>
    <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-300">
      Consultá la elegibilidad y los bloqueos antes de cualquier acreditación o canje. El diagnóstico no modifica saldos.
    </p>
    <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${enabled?"bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200":"bg-gray-50 text-gray-700 dark:bg-white/[0.04] dark:text-gray-300"}`}>
      {enabled?"El programa figura activo. Las operaciones requieren confirmación explícita.":"Rewards está desactivado. Solo están disponibles las consultas de diagnóstico."}
    </div>
    <div className="mt-5 grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
        Tipo de operación
        <select value={kind} onChange={e=>reset(e.target.value as Operation)}
          className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-white/10 dark:bg-[#001219] dark:text-white">
          {operations.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </label>
      <label className="block min-w-0 text-sm font-semibold text-gray-700 dark:text-gray-200">
        {kind==="production"?"ID de producción":kind==="contract"?"ID de contratación":kind==="coupon"?"ID de cupón":kind==="referral"?"ID del referido":"Origen de recompensa"}
        <input value={first} onChange={e=>{setFirst(e.target.value);setResult(null);setPreviewed(false)}}
          placeholder={kind==="reversal"?"production:uuid o contract:uuid":"UUID"}
          spellCheck={false} autoComplete="off"
          className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 dark:border-white/10 dark:bg-[#001219] dark:text-white"/>
      </label>
    </div>
    {kind==="coupon"&&<label className="mt-3 block text-sm font-semibold text-gray-700 dark:text-gray-200">
      ID de producción que recibe el descuento
      <input value={second} onChange={e=>{setSecond(e.target.value);setResult(null);setPreviewed(false)}}
        placeholder="UUID" spellCheck={false} autoComplete="off"
        className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 dark:border-white/10 dark:bg-[#001219] dark:text-white"/>
    </label>}
    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{current.info}</p>
    <button type="button" onClick={()=>void simulate()} disabled={!valid||loading}
      className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
      {loading?<Loader2 className="h-4 w-4 animate-spin"/>:<Search className="h-4 w-4"/>}Analizar operación
    </button>
    {result&&<div className="mt-5 rounded-xl border border-gray-200 p-4 dark:border-white/10">
      <p className="font-semibold text-gray-900 dark:text-white">{completed?"Operación ejecutada":"Resultado del diagnóstico"}</p>
      {typeof result.reason==="string"&&<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {reasons[result.reason]??result.reason}
      </p>}
      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-700 dark:bg-[#001219] dark:text-gray-200">{formatted(result)}</pre>
    </div>}
    {previewed&&enabled&&rpcAward[kind]&&safeToExecute&&<div className="mt-4 rounded-xl border border-amber-200 p-4 dark:border-amber-500/30">
      <p className="flex items-start gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4 shrink-0"/>La siguiente acción puede generar un movimiento económico.
      </p>
      <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">Confirmá únicamente luego de revisar el diagnóstico y la documentación. El servidor volverá a validar los requisitos.</p>
      <label className="mt-3 block text-sm text-gray-700 dark:text-gray-200">
        Escribí CONFIRMAR
        <input value={confirmation} onChange={e=>setConfirmation(e.target.value)}
          className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-white/10 dark:bg-[#001219] dark:text-white"/>
      </label>
      {kind==="referral"&&<label className="mt-3 flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
        <input type="checkbox" checked={discountVerified} onChange={e=>setDiscountVerified(e.target.checked)}
          className="mt-1 h-4 w-4"/>
        Verifiqué que el descuento del nuevo cliente está registrado y conciliado con su contratación.
      </label>}
      <button type="button" onClick={()=>void perform()} disabled={loading||confirmation!=="CONFIRMAR"||(kind==="referral"&&!discountVerified)}
        className="mt-3 min-h-11 rounded-xl bg-amber-700 px-4 text-sm font-semibold text-white disabled:opacity-50">
        Ejecutar operación
      </button>
    </div>}
    {kind==="reversal"&&previewed&&<p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
      Los ajustes y reembolsos requieren expediente, verificación y confirmación separada. No se ejecutan desde este panel.
    </p>}
    {error&&<p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-300">{error}</p>}
  </section>
}
