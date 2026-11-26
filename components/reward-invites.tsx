"use client"

import { useState } from "react"
import { Copy, Loader2, UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type InviteResult = { enabled?: boolean; code?: string | null }
type ClaimResult = { linked?: boolean; expires_at?: string }

export default function RewardInvites() {
  const [code, setCode] = useState("")
  const [newCode, setNewCode] = useState("")
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const getCode = async () => {
    setWorking(true); setError(""); setMessage("")
    try {
      const { data, error: rpcError } = await createClient().rpc("reward_my_invite_code")
      if (rpcError) throw new Error(rpcError.message)
      const result = data as InviteResult | null
      if (!result?.enabled || !result.code) throw new Error("La invitación todavía no está disponible.")
      setCode(result.code)
      setMessage("Tu código de invitación está listo.")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo consultar tu código.")
    } finally { setWorking(false) }
  }
  const claim = async () => {
    setWorking(true); setError(""); setMessage("")
    try {
      const { data, error: rpcError } = await createClient().rpc("reward_claim_invitation", { p_code: newCode.trim().toUpperCase() })
      if (rpcError) throw new Error(rpcError.message)
      if (!(data as ClaimResult | null)?.linked) throw new Error("No se pudo vincular la invitación.")
      setMessage("Invitación vinculada. Sujeta a verificación de la primera producción.")
      setNewCode("")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo vincular el código.")
    } finally { setWorking(false) }
  }

  return <section className="mt-7 rounded-2xl border border-gray-200 p-5 dark:border-white/10 sm:p-6">
    <div className="flex items-center gap-3">
      <UserPlus className="h-5 w-5 text-[#0A9396]" aria-hidden="true"/>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Clover Invita</h2>
    </div>
    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
      Invitá a alguien que todavía no haya contratado Clover Digital. El descuento y el crédito
      por recomendación requieren una primera producción elegible, entregada, cobrada y verificada.
    </p>
    <div className="mt-5 flex flex-wrap items-end gap-2">
      <button type="button" disabled={working} onClick={()=>void getCode()}
        className="min-h-11 rounded-xl bg-[#0e5c6e] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {working?<Loader2 className="inline h-4 w-4 animate-spin"/>:"Obtener mi código"}
      </button>
      {code&&<>
        <output className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold tracking-wide dark:border-white/10">{code}</output>
        <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm dark:border-white/10"
          onClick={()=>void navigator.clipboard.writeText(code)}><Copy className="h-4 w-4"/>Copiar</button>
      </>}
    </div>
    <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/10">
      <label htmlFor="claim-invite" className="block text-sm font-semibold text-gray-900 dark:text-white">
        ¿Te recomendaron Clover? Ingresá el código antes de tu primera producción.
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input id="claim-invite" autoComplete="off" value={newCode} maxLength={32}
          onChange={e=>setNewCode(e.target.value)}
          placeholder="Código de invitación"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-white/10 dark:bg-[#001219] dark:text-white"/>
        <button type="button" disabled={working||newCode.trim().length<6} onClick={()=>void claim()}
          className="min-h-11 rounded-xl border border-[#0A9396]/30 px-4 text-sm font-semibold text-[#0A9396] disabled:opacity-50">Vincular código</button>
      </div>
    </div>
    {error&&<p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-300">{error}</p>}
    {message&&<p role="status" className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
  </section>
}
