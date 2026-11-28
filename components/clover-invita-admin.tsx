"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Gift, Loader2, RefreshCw } from "lucide-react"

type Referral={
  id:string; inviter:string; invited:string; status:string;
  linked_at:string; valid_until:string; first_production_id:string|null; credit_issued:boolean
}
type Overview={enabled:boolean;referrals:Referral[];discounts:number;credit_lots:number}
type Action="discount"|"credit"|"spend"|"reverse"|"revoke"
const money=(v:number)=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:2}).format(v)
export default function CloverInvitaAdmin() {
 const [data,setData]=useState<Overview|null>(null)
 const [selected,setSelected]=useState("")
 const [production,setProduction]=useState("")
 const [owner,setOwner]=useState("")
 const [amount,setAmount]=useState("")
 const [kind,setKind]=useState<Action>("discount")
 const [checking,setChecking]=useState(true)
 const [loading,setLoading]=useState(false)
 const [message,setMessage]=useState("")
 const [error,setError]=useState("")
 const [confirm,setConfirm]=useState("")
 const reload=async()=>{
  const {data:res,error:rpcError}=await createClient().rpc("invita_admin_overview")
  if(rpcError)throw new Error(rpcError.message)
  setData(res as Overview)
 }
 useEffect(()=>{
  let active=true
  void createClient().rpc("invita_admin_overview").then(({data:res,error:rpcError})=>{
   if(!active)return
   if(rpcError)setError(rpcError.message);else setData(res as Overview)
   setChecking(false)
  })
  return()=>{active=false}
 },[])
 const act=async()=>{
  if(!data?.enabled||confirm!=="CONFIRMAR")return
  setLoading(true);setError("");setMessage("")
  try{
   const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
   const rpc=kind==="discount"?"invita_admin_apply_discount":
    kind==="credit"?"invita_admin_issue_credit":
    kind==="spend"?"invita_admin_spend_credit":kind==="revoke"?"invita_admin_revoke_credit":"invita_admin_reverse_spend"
   const params=kind==="discount"?{p_referral_id:selected,p_production_id:production}:
    kind==="credit"||kind==="revoke"?{p_referral_id:selected}:
    kind==="spend"?{p_user_id:owner,p_production_id:production,p_amount_ars:Number(amount)}:
    {p_production_id:production}
   if((kind==="discount"||kind==="credit"||kind==="revoke")&&!uuid.test(selected))throw new Error("Elegí un referido válido.")
   if(kind!=="credit"&&kind!=="revoke"&&!uuid.test(production))throw new Error("Ingresá el ID de producción.")
   if(kind==="spend"&&(!uuid.test(owner)||!Number.isFinite(Number(amount))||Number(amount)<=0))
     throw new Error("Ingresá el ID del cliente y un importe válido.")
   const {data:res,error:rpcError}=await createClient().rpc(rpc,params)
   if(rpcError)throw new Error(rpcError.message)
   setMessage("Operación registrada: "+JSON.stringify(res))
   setConfirm("")
   await reload()
  }catch(err){setError(err instanceof Error?err.message:"No se pudo realizar la operación.")}
  finally{setLoading(false)}
 }
 const field="mt-1 min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-white/10 dark:bg-[#001219] dark:text-white"
 return <section className="mt-8 rounded-2xl border border-gray-200 p-5 dark:border-white/10 sm:p-6">
  <div className="flex items-center gap-3"><Gift className="h-5 w-5 text-[#0A9396]"/><h2 className="text-lg font-bold text-gray-900 dark:text-white">Clover Invita · Administración</h2></div>
  <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">Independiente de Clover Rewards. Los movimientos actualizan los presupuestos solo antes de registrar pagos.</p>
  {checking?<p className="mt-4 text-sm text-gray-500">Consultando...</p>:
   <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
    Estado: {data?.enabled?"Habilitado":"Desactivado"} · Referidos: {data?.referrals?.length??0} · Créditos: {data?.credit_lots??0} · Descuentos: {data?.discounts??0}
   </p>}
  <button type="button" onClick={()=>{setError("");void reload().catch(e=>setError(String(e)))}}
   className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 px-3 text-sm dark:border-white/10">
   <RefreshCw className="h-4 w-4"/>Actualizar
  </button>
  {!!data?.referrals?.length&&<div className="mt-5 space-y-2">
   <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Referidos registrados</h3>
   {data.referrals.map(r=><button key={r.id} type="button" onClick={()=>{setSelected(r.id);setProduction(r.first_production_id||"")}}
   className={"block w-full rounded-xl border p-3 text-left text-sm dark:border-white/10 "+(selected===r.id?"border-[#0A9396]":"border-gray-200")}>
    <span className="font-semibold text-gray-900 dark:text-white">{r.invited}</span>
    <span className="text-gray-500"> · Invitó: {r.inviter} · {r.status}</span>
   </button>)}
  </div>}
  <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/10">
   <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Operaciones</h3>
   <p className="mt-2 text-xs leading-5 text-gray-500">Aplicar descuento: 15% sobre la primera producción confirmada, sin pagos. Emitir crédito: primera entrega cobrada y contratación original desde $90.000. Gastar crédito: máximo 25% de una producción futura. Revertir uso: solo antes del cobro.</p>
   <label className="mt-4 block text-sm text-gray-700 dark:text-gray-200">Acción
    <select className={field} value={kind} onChange={e=>{setKind(e.target.value as Action);setConfirm("");setMessage("")}}>
     <option value="discount">Aplicar 15% al recomendado</option>
     <option value="credit">Acreditar $10.000 al recomendador</option>
     <option value="spend">Usar crédito en futura producción</option>
     <option value="reverse">Revertir uso antes del pago</option>\n     <option value="revoke">Revocar crédito no utilizado tras devolución</option>
    </select>
   </label>
   {(kind==="discount"||kind==="credit"||kind==="revoke")&&<label className="mt-3 block text-sm text-gray-700 dark:text-gray-200">ID del referido
     <input className={field} value={selected} onChange={e=>setSelected(e.target.value)} placeholder="UUID del referido"/>
   </label>}
   {kind!=="credit"&&<label className="mt-3 block text-sm text-gray-700 dark:text-gray-200">ID de producción
    <input className={field} value={production} onChange={e=>setProduction(e.target.value)} placeholder="UUID de producción"/>
   </label>}
   {kind==="spend"&&<>
    <label className="mt-3 block text-sm text-gray-700 dark:text-gray-200">ID del cliente (titular del crédito)
     <input className={field} value={owner} onChange={e=>setOwner(e.target.value)} placeholder="UUID del usuario"/>
    </label>
    <label className="mt-3 block text-sm text-gray-700 dark:text-gray-200">Crédito a utilizar (ARS)
     <input className={field} type="number" min={0.01} step={0.01} value={amount} onChange={e=>setAmount(e.target.value)} placeholder={money(10000)}/>
    </label>
   </>}
   <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-200">Escribí CONFIRMAR para realizar el movimiento
    <input className={field} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="CONFIRMAR" autoComplete="off"/>
   </label>
   <button type="button" disabled={!data?.enabled||loading||confirm!=="CONFIRMAR"} onClick={()=>void act()}
    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 text-sm font-semibold text-white disabled:opacity-50">
    {loading?<Loader2 className="h-4 w-4 animate-spin"/>:<Gift className="h-4 w-4"/>}Ejecutar movimiento
   </button>
   {!data?.enabled&&<p className="mt-2 text-xs text-gray-500">Las operaciones están bloqueadas hasta el lanzamiento individual de Invita.</p>}
  </div>
  {message&&<p role="status" className="mt-4 break-all text-sm text-emerald-700">{message}</p>}
  {error&&<p role="alert" className="mt-4 break-all text-sm text-red-600">{error}</p>}
 </section>
}
