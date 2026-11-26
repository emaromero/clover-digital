"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

type Classification = {
  package_code:string
  property_size:string
  drone_addon:boolean
  extra_vertical_reels:number
  extra_talking_reels:number
  eligible_original_amount:number
  discount_amount:number
  travel_expenses:number
  notes:string|null
}
type Contract = {
  group_id:string
  title:string
  contract_amount:number
  member_count:number
  classification:Classification|null
}
type Preview = {
  reason:string
  eligible:boolean
  coins_to_award:number
  gross_coins:number
  points_to_award:number
  paid_amount:number
  contract_amount:number
  delivered_members:number
  members:number
}
const reasons:Record<string,string> = {
  insufficient_members:"La contratación necesita al menos dos propiedades.",
  owner_mismatch:"Las propiedades no tienen el mismo titular.",
  amounts_changed:"Los importes de las propiedades no coinciden con el contrato.",
  missing_classification:"Falta guardar la clasificación.",
  classification_owner_mismatch:"Cambió el titular de la contratación.",
  classification_amount_mismatch:"El importe clasificado no coincide con el contrato.",
  not_all_delivered:"Todavía faltan propiedades por entregar.",
  delivery_dates_missing:"Faltan fechas de entrega.",
  not_fully_paid:"Todavía falta cobrar parte del contrato.",
  overpaid:"Los pagos exceden el importe contratado.",
  unknown_package:"El paquete no figura en el catálogo.",
  zero_coins:"El cálculo dio cero Coins.",
  already_awarded:"La contratación ya tiene recompensas registradas.",
  launch_date_not_configured:"Todavía no se configuró la fecha de lanzamiento.",
  before_launch:"La contratación es anterior al lanzamiento.",
  program_disabled:"Rewards está desactivado.",
  eligible:"Cumple los requisitos de acreditación.",
}
const money=(n:number)=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:2}).format(n)
const inputClass="mt-1 min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-white/15 dark:bg-[#001219] dark:text-white"

export default function RewardContractsAdmin() {
  const [contracts,setContracts]=useState<Contract[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState("")
  const [selected,setSelected]=useState("")
  const [packageCode,setPackageCode]=useState("completo")
  const [propertySize,setPropertySize]=useState("estandar")
  const [drone,setDrone]=useState(false)
  const [vertical,setVertical]=useState("0")
  const [talking,setTalking]=useState("0")
  const [original,setOriginal]=useState("")
  const [discount,setDiscount]=useState("0")
  const [travel,setTravel]=useState("0")
  const [notes,setNotes]=useState("")
  const [saved,setSaved]=useState(false)
  const [busy,setBusy]=useState(false)
  const [preview,setPreview]=useState<Preview|null>(null)
  const [message,setMessage]=useState("")

  useEffect(()=>{
    let active=true
    const load=async()=>{
      const {data,error:rpcError}=await createClient().rpc("reward_admin_list_contracts")
      if(!active)return
      if(rpcError)setError("El listado de contratos todavía no está disponible: "+rpcError.message)
      else if(Array.isArray(data))setContracts(data as Contract[])
      else setError("La consulta devolvió un resultado inesperado.")
      setLoading(false)
    }
    void load()
    return ()=>{active=false}
  },[])

  const choose=(id:string)=>{
    setSelected(id)
    setPreview(null)
    setError("")
    setMessage("")
    const contract=contracts.find(c=>c.group_id===id)
    if(!contract)return
    const c=contract.classification
    setPackageCode(c?.package_code??"completo")
    setPropertySize(c?.property_size??"estandar")
    setDrone(Boolean(c?.drone_addon))
    setVertical(String(c?.extra_vertical_reels??0))
    setTalking(String(c?.extra_talking_reels??0))
    setOriginal(String(c?.eligible_original_amount??contract.contract_amount))
    setDiscount(String(c?.discount_amount??0))
    setTravel(String(c?.travel_expenses??0))
    setNotes(c?.notes??"")
    setSaved(Boolean(c))
  }
  const contract=contracts.find(c=>c.group_id===selected)
  const reconciles=Boolean(contract)&&[original,discount,travel].every(x=>x.trim()!==""&&Number.isFinite(Number(x)))&&
    Number(original)>0&&Number(discount)>=0&&Number(travel)>=0&&Number(discount)<Number(original)&&
    Math.abs(Number(original)-Number(discount)+Number(travel)-Number(contract?.contract_amount))<=0.01
  const extrasValid=[vertical,talking].every(x=>x.trim()!==""&&Number.isInteger(Number(x))&&Number(x)>=0&&Number(x)<=20)
  const save=async()=>{
    if(!contract||!reconciles||!extrasValid)return
    setBusy(true);setError("");setMessage("");setPreview(null)
    const {data,error:rpcError}=await createClient().rpc("reward_admin_set_contract_classification",{
      p_group_id:contract.group_id,p_package_code:packageCode,p_property_size:propertySize,
      p_drone_addon:drone,p_extra_vertical_reels:Number(vertical),p_extra_talking_reels:Number(talking),
      p_eligible_original_amount:Number(original),p_discount_amount:Number(discount),
      p_travel_expenses:Number(travel),p_notes:notes.trim()||null
    })
    if(rpcError)setError(rpcError.message)
    else {setSaved(true);setMessage("Clasificación guardada. No se acreditaron recompensas.")
      setContracts(old=>old.map(c=>c.group_id===contract.group_id?{...c,classification:data as Classification}:c))
    }
    setBusy(false)
  }
  const simulate=async()=>{
    if(!contract)return
    setBusy(true);setError("");setMessage("");setPreview(null)
    const {data,error:rpcError}=await createClient().rpc("reward_admin_preview_contract",{p_group_id:contract.group_id})
    if(rpcError)setError(rpcError.message)
    else if(data&&typeof data==="object")setPreview(data as Preview)
    else setError("No se pudo obtener la simulación.")
    setBusy(false)
  }
  return <section className="mt-8 rounded-2xl border border-gray-200 p-5 dark:border-white/10">
    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Contrataciones compartidas</h2>
    <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-300">Clasificación y simulación administrativa. No acredita Coins ni puntos.</p>
    {loading?<p className="mt-4 flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin"/>Consultando contratos...</p>:<>
      {contracts.length===0&&!error&&<p className="mt-4 text-sm text-gray-500">No hay contrataciones compartidas registradas.</p>}
      {contracts.length>0&&<div className="mt-4 space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Contratación
          <select className={inputClass} value={selected} onChange={e=>choose(e.target.value)}>
            <option value="">Seleccioná un contrato</option>
            {contracts.map(c=><option key={c.group_id} value={c.group_id}>{c.title} · {money(Number(c.contract_amount))}</option>)}
          </select>
        </label>
        {contract&&<>
          <p className="text-sm text-gray-500 dark:text-gray-300">{contract.member_count} propiedades · Valor total {money(Number(contract.contract_amount))}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-gray-700 dark:text-gray-200">Paquete
              <select className={inputClass} value={packageCode} onChange={e=>setPackageCode(e.target.value)}>
                <option value="esenciales">Esenciales</option><option value="redes">Redes sociales</option><option value="completo">Completo</option>
              </select>
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-200">Tamaño
              <select className={inputClass} value={propertySize} onChange={e=>setPropertySize(e.target.value)}>
                <option value="estandar">Estándar</option><option value="ampliada">Ampliada</option><option value="grande">Grande</option>
              </select>
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-200">Reels verticales adicionales
              <input className={inputClass} type="number" min="0" max="20" step="1" value={vertical} onChange={e=>setVertical(e.target.value)}/>
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-200">Reels hablados adicionales
              <input className={inputClass} type="number" min="0" max="20" step="1" value={talking} onChange={e=>setTalking(e.target.value)}/>
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-200">Importe audiovisual original
              <input className={inputClass} type="number" min="0" step="0.01" value={original} onChange={e=>setOriginal(e.target.value)}/>
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-200">Descuento
              <input className={inputClass} type="number" min="0" step="0.01" value={discount} onChange={e=>setDiscount(e.target.value)}/>
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-200">Viáticos
              <input className={inputClass} type="number" min="0" step="0.01" value={travel} onChange={e=>setTravel(e.target.value)}/>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input type="checkbox" checked={drone} onChange={e=>setDrone(e.target.checked)}/> Incluye drone adicional
          </label>
          <label className="block text-sm text-gray-700 dark:text-gray-200">Observaciones internas
            <textarea className={inputClass} rows={2} maxLength={1000} value={notes} onChange={e=>setNotes(e.target.value)}/>
          </label>
          <p className={`text-xs ${reconciles?"text-emerald-600":"text-amber-600"}`}>
            {reconciles?"Los importes coinciden con el contrato.":"El audiovisual original menos descuentos más viáticos debe coincidir con el contrato."}
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={busy||!reconciles||!extrasValid} onClick={()=>void save()}
              className="min-h-11 rounded-xl bg-[#0e5c6e] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Guardar clasificación</button>
            <button type="button" disabled={busy||!saved} onClick={()=>void simulate()}
              className="min-h-11 rounded-xl border border-[#0A9396]/40 px-4 py-2 text-sm font-semibold text-[#0A9396] disabled:opacity-50">Simular contrato</button>
          </div>
          {message&&<p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
          {preview&&<div className="rounded-xl bg-gray-50 p-4 text-sm dark:bg-white/[0.03]">
            <p className="font-semibold text-gray-900 dark:text-white">
              {Number(preview.coins_to_award).toLocaleString("es-AR",{maximumFractionDigits:2})} Coins estimados · {preview.points_to_award} puntos habilitados
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Cobrado: {money(Number(preview.paid_amount))} de {money(Number(preview.contract_amount))} · Entregadas: {preview.delivered_members}/{preview.members}</p>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{reasons[preview.reason]??preview.reason}</p>
            <p className="mt-2 text-xs text-gray-500">Simulación sin acreditación. El programa permanece desactivado.</p>
          </div>}
        </>}
      </div>}
    </>}
    {error&&<p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-300">{error}</p>}
  </section>
}
