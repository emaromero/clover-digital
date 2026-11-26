"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Offer = {
  coins:number
  discount_ars:number
  minimum_order_ars:number
  available:boolean
}
type Options = {
  program_enabled:boolean
  available_coins:number
  offers:Offer[]
}
const money=(value:number)=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(value)

export default function RewardCouponStore() {
  const [options,setOptions]=useState<Options|null>(null)
  const [error,setError]=useState("")
  const [message,setMessage]=useState("")
  const [busy,setBusy]=useState<number|null>(null)
  useEffect(()=>{
    let active=true
    void createClient().rpc("reward_my_coupon_options").then(({data,error:rpcError})=>{
      if(!active)return
      if(rpcError)setError("No se pudieron consultar los cupones.")
      else if(data&&typeof data==="object")setOptions(data as Options)
    })
    return()=>{active=false}
  },[])
  const issue=async(coins:number)=>{
    if(!options?.program_enabled)return
    setBusy(coins);setError("");setMessage("")
    const {data,error:rpcError}=await createClient().rpc("reward_issue_coupon",{p_coins:coins})
    if(rpcError)setError(rpcError.message)
    else if(data) {
      setMessage("Cupón emitido. Podés solicitar su aplicación a una nueva producción elegible antes del vencimiento.")
      const {data:next}=await createClient().rpc("reward_my_coupon_options")
      if(next&&typeof next==="object")setOptions(next as Options)
    }
    setBusy(null)
  }
  if(!options&&!error)return <p className="mt-6 text-sm text-gray-500">Consultando opciones de canje...</p>
  return <section className="mt-7 rounded-2xl border border-gray-200 p-5 dark:border-white/10 sm:p-6">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Canjear Coins</h2>
    <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-300">
      Convertí Coins en cupones para futuras contrataciones. Se aplican a producciones elegibles,
      no se combinan con créditos de referidos y tienen una vigencia de 30 días.
    </p>
    {options&&<>
      <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
        Disponible: {Number(options.available_coins).toLocaleString("es-AR",{maximumFractionDigits:2})} Coins
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {options.offers.map(offer=><div key={offer.coins} className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <p className="text-2xl font-bold text-[#0A9396]">{money(offer.discount_ars)}</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{offer.coins} Coins</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Producciones desde {money(offer.minimum_order_ars)}.
          </p>
          <button type="button" onClick={()=>void issue(offer.coins)}
            disabled={!options.program_enabled||!offer.available||busy!==null}
            className="mt-4 min-h-11 w-full rounded-xl bg-[#0e5c6e] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {busy===offer.coins?"Procesando...":"Canjear"}
          </button>
        </div>)}
      </div>
      {!options.program_enabled&&<p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Los canjes estarán disponibles cuando se lance Clover Rewards.
      </p>}
    </>}
    {error&&<p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    {message&&<p role="status" className="mt-3 text-sm text-emerald-700">{message}</p>}
  </section>
}
