"use client"

import { useEffect, useState } from "react"
import { Copy, Gift, Loader2, UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Referral = { id:string; status:string; linked_at:string; valid_until:string; credit_issued:boolean }
type Data = { enabled:boolean; code:string|null; credit_available_ars:number; referrals:Referral[]; my_invitation:{status:string}|null }
const money=(v:number)=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(v)
export default function CloverInvita() {
  const [data,setData]=useState<Data|null>(null)
  const [loading,setLoading]=useState(true)
  const [working,setWorking]=useState(false)
  const [input,setInput]=useState("")
  const [message,setMessage]=useState("")
  const [error,setError]=useState("")
  const reload=async()=>{
    const {data:res,error:rpcError}=await createClient().rpc("invita_my_dashboard")
    if(rpcError)throw new Error(rpcError.message)
    setData(res as Data)
  }
  useEffect(()=>{
    let active=true
    const fetch=async()=>{
      try{
        const {data:res,error:rpcError}=await createClient().rpc("invita_my_dashboard")
        if(rpcError)throw new Error(rpcError.message)
        if(active)setData(res as Data)
      }catch(err){if(active)setError(err instanceof Error?err.message:"No se pudo consultar Invita.")}
      finally{if(active)setLoading(false)}
    }
    const params=new URLSearchParams(window.location.search)
    const invite=params.get("invite")
    if(invite)setInput(invite.toUpperCase())
    void fetch()
    return()=>{active=false}
  },[])
  const getCode=async()=>{
    setWorking(true);setMessage("");setError("")
    try{
      const {data:res,error:rpcError}=await createClient().rpc("invita_my_code")
      if(rpcError)throw new Error(rpcError.message)
      if(!(res as {enabled?:boolean}).enabled)throw new Error("Invita todavía no está habilitado.")
      await reload()
    }catch(err){setError(err instanceof Error?err.message:"Error al generar el código.")}
    finally{setWorking(false)}
  }
  const claim=async()=>{
    setWorking(true);setMessage("");setError("")
    try{
      const {error:rpcError}=await createClient().rpc("invita_claim",{p_code:input.trim().toUpperCase()})
      if(rpcError)throw new Error(rpcError.message)
      setMessage("Invitación vinculada. El descuento se verificará antes de tu primera contratación.")
      setInput("");await reload()
    }catch(err){setError(err instanceof Error?err.message:"No se pudo vincular.")}
    finally{setWorking(false)}
  }
  if(loading)return <p className="mt-7 text-sm text-gray-500">Consultando Clover Invita...</p>
  return <section className="mt-7 rounded-2xl border border-gray-200 p-5 dark:border-white/10 sm:p-6">
    <div className="flex items-center gap-3"><Gift className="h-6 w-6 text-[#0A9396]"/><h2 className="text-xl font-bold text-gray-900 dark:text-white">Clover Invita</h2></div>
    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
      Invitá a un nuevo cliente: recibe 15% de descuento en su primera contratación, hasta $15.000.
      Si su contratación original alcanza $90.000 y se entrega y cobra completamente, recibís $10.000
      de crédito para producciones futuras.
    </p>
    {!data?.enabled?<p className="mt-4 text-sm font-medium text-gray-500">Clover Invita todavía no está habilitado.</p>:<>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
          <p className="text-xs text-gray-500">Tu crédito disponible</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{money(Number(data.credit_available_ars)||0)}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
          <p className="text-xs text-gray-500">Recomendaciones vinculadas</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{data.referrals?.length??0}</p>
        </div>
      </div>
      {data.code?<div className="mt-5 rounded-xl border border-gray-200 p-4 dark:border-white/10">
        <p className="text-xs text-gray-500">Tu código personal</p>
        <p className="mt-1 font-mono text-lg font-bold tracking-wide text-gray-900 dark:text-white">{data.code}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={()=>void navigator.clipboard.writeText(data.code!)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm dark:border-white/10"><Copy className="h-4 w-4"/>Copiar código</button>
          <button onClick={()=>void navigator.clipboard.writeText("https://www.cloverdigital.com.ar/rewards?invite="+encodeURIComponent(data.code!))}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0e5c6e] px-3 text-sm font-semibold text-white"><Copy className="h-4 w-4"/>Copiar enlace</button>
        </div>
      </div>:<button onClick={()=>void getCode()} disabled={working}
        className="mt-5 min-h-11 rounded-xl bg-[#0e5c6e] px-4 text-sm font-semibold text-white disabled:opacity-50">
        {working?<Loader2 className="inline h-4 w-4 animate-spin"/>:"Generar mi código"}
      </button>}
      <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/10">
        <label htmlFor="invita-code" className="text-sm font-semibold text-gray-900 dark:text-white">
          ¿Te recomendaron? Vinculá tu código antes de tu primera contratación.
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <input id="invita-code" value={input} onChange={e=>setInput(e.target.value)} maxLength={32}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-white/10 dark:bg-[#001219] dark:text-white"
            placeholder="Código de invitación"/>
          <button onClick={()=>void claim()} disabled={working||input.trim().length<6||Boolean(data.my_invitation)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0A9396]/40 px-4 text-sm font-semibold text-[#0A9396] disabled:opacity-50">
            <UserPlus className="h-4 w-4"/>Vincular
          </button>
        </div>
        {data.my_invitation&&<p className="mt-2 text-sm text-[#0A9396]">Tu invitación ya está vinculada ({data.my_invitation.status}).</p>}
      </div>
      {!!data.referrals?.length&&<div className="mt-6 border-t border-gray-100 pt-5 text-sm dark:border-white/10">
        <h3 className="font-semibold text-gray-900 dark:text-white">Tus recomendaciones</h3>
        {data.referrals.map(r=><div key={r.id} className="flex justify-between gap-2 border-b border-gray-100 py-3 dark:border-white/10">
          <span className="text-gray-600 dark:text-gray-300">{new Date(r.linked_at).toLocaleDateString("es-AR")}</span>
          <span className="font-medium text-gray-900 dark:text-white">{r.credit_issued?"Crédito generado":r.status==="linked"?"Pendiente":"Estado: "+r.status}</span>
        </div>)}
      </div>}
      <p className="mt-4 text-xs leading-5 text-gray-500">La invitación tiene 90 días de vigencia. El crédito dura 6 meses y puede utilizarse hasta el 25% de una producción, sin combinarlo con Coins.</p>
    </>}
    {message&&<p role="status" className="mt-3 text-sm text-emerald-700">{message}</p>}
    {error&&<p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
  </section>
}
