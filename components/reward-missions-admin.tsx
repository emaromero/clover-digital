"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Mission = {
  id:string; title:string; description:string; tier_required:string; mission_type:string;
  target_count:number; bonus_coins:number; starts_at:string; ends_at:string;
  budget_cap_ars:number|null; payment_grace_days:number; status:string
}
const types = [
  {id:"production_count",name:"Cantidad de producciones"},
  {id:"complete_count",name:"Paquetes completos"},
  {id:"drone_count",name:"Producciones con drone"},
  {id:"reel_count",name:"Producciones con reel"},
]
const localIso=(date:Date)=>new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16)
export default function RewardMissionsAdmin() {
  const [missions,setMissions]=useState<Mission[]>([])
  const [loaded,setLoaded]=useState(false)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState("")
  const [message,setMessage]=useState("")
  const [title,setTitle]=useState("")
  const [description,setDescription]=useState("")
  const [tier,setTier]=useState("plus")
  const [type,setType]=useState("production_count")
  const [count,setCount]=useState("3")
  const [bonus,setBonus]=useState("5")
  const [budget,setBudget]=useState("10000")
  const [start,setStart]=useState(()=>localIso(new Date(Date.now()+86400000)))
  const [end,setEnd]=useState(()=>localIso(new Date(Date.now()+31*86400000)))
  useEffect(()=>{
    let live=true
    void createClient().rpc("reward_admin_list_missions").then(({data,error:fetchError})=>{
      if(!live)return
      if(fetchError)setError("El listado estará disponible al instalar el SQL 35: "+fetchError.message)
      else if(Array.isArray(data))setMissions(data as Mission[])
      setLoaded(true)
    })
    return ()=>{live=false}
  },[])
  const save=async()=>{
    setError("");setMessage("")
    if(!title.trim()||!start||!end||new Date(start)>=new Date(end)) {
      setError("Completá el título y verificá las fechas.");return
    }
    setSaving(true)
    const {data,error:saveError}=await createClient().rpc("reward_admin_save_mission_draft",{
      p_title:title.trim(),p_description:description.trim(),p_tier_required:tier,p_mission_type:type,
      p_target_count:Number(count),p_bonus_coins:Number(bonus),p_starts_at:new Date(start).toISOString(),
      p_ends_at:new Date(end).toISOString(),p_budget_cap_ars:Number(budget),
      p_payment_grace_days:15,p_mission_id:null,
    })
    if(saveError)setError(saveError.message)
    else {
      setMissions(old=>[data as Mission,...old])
      setMessage("Misión guardada como borrador. No se activó ni generó Coins.")
      setTitle("");setDescription("")
    }
    setSaving(false)
  }
  const field="mt-1 min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-white/10 dark:bg-[#001219] dark:text-white"
  return <section className="mt-8 rounded-2xl border border-gray-200 p-5 dark:border-white/10 sm:p-6">
    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Misiones · Administración</h2>
    <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">Podés crear borradores. No se activan misiones ni se acreditan Coins desde esta pantalla.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <label className="text-sm text-gray-700 dark:text-gray-200">Título
        <input className={field} value={title} onChange={e=>setTitle(e.target.value)} maxLength={100} placeholder="Ej. Tres producciones en un mes"/>
      </label>
      <label className="text-sm text-gray-700 dark:text-gray-200">Nivel requerido
        <select className={field} value={tier} onChange={e=>setTier(e.target.value)}>
          <option value="plus">Plus</option><option value="pro">Pro</option><option value="elite">Elite</option>
        </select>
      </label>
      <label className="text-sm text-gray-700 dark:text-gray-200">Tipo de objetivo
        <select className={field} value={type} onChange={e=>setType(e.target.value)}>
          {types.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label className="text-sm text-gray-700 dark:text-gray-200">Producciones requeridas
        <input className={field} type="number" min="1" max="100" step="1" value={count} onChange={e=>setCount(e.target.value)}/>
      </label>
      <label className="text-sm text-gray-700 dark:text-gray-200">Bonus Coins
        <input className={field} type="number" min="3" max="8" step="1" value={bonus} onChange={e=>setBonus(e.target.value)}/>
      </label>
      <label className="text-sm text-gray-700 dark:text-gray-200">Tope presupuestario (ARS)
        <input className={field} type="number" min="1" step="0.01" value={budget} onChange={e=>setBudget(e.target.value)}/>
      </label>
      <label className="text-sm text-gray-700 dark:text-gray-200">Desde
        <input className={field} type="datetime-local" value={start} onChange={e=>setStart(e.target.value)}/>
      </label>
      <label className="text-sm text-gray-700 dark:text-gray-200">Hasta
        <input className={field} type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)}/>
      </label>
    </div>
    <label className="mt-3 block text-sm text-gray-700 dark:text-gray-200">Descripción
      <textarea className={field} rows={2} value={description} maxLength={1500} onChange={e=>setDescription(e.target.value)}/>
    </label>
    <button type="button" onClick={()=>void save()} disabled={saving||!loaded}
      className="mt-4 min-h-11 rounded-xl bg-[#0e5c6e] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
      {saving?"Guardando...":"Guardar borrador"}
    </button>
    {error&&<p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-300">{error}</p>}
    {message&&<p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
    <h3 className="mt-7 text-sm font-semibold text-gray-900 dark:text-white">Misiones registradas</h3>
    {loaded&&missions.length===0&&<p className="mt-2 text-sm text-gray-500">Todavía no hay misiones.</p>}
    <div className="mt-2 divide-y divide-gray-100 dark:divide-white/10">
      {missions.map(m=><div key={m.id} className="py-3 text-sm">
        <p className="font-semibold text-gray-900 dark:text-white">{m.title}</p>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{m.status} · {m.bonus_coins} Coins · {m.target_count} producciones · {m.tier_required}</p>
      </div>)}
    </div>
  </section>
}
