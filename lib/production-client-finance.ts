import { createClient } from "@/lib/supabase/server"

/**
 * Payment totals are resolved by a SECURITY DEFINER RPC which verifies
 * auth.uid() is the owner of each production. It never returns details,
 * payment methods or amounts for colleagues with shared access.
 */
export async function getOwnerPaymentTotals(
  ownedProductionIds: string[]
): Promise<Map<string, number> | null> {
  if (ownedProductionIds.length === 0) return new Map()

  const supabase = await createClient()
  const { data, error } = await supabase.rpc(
    "client_production_paid_totals",
    { p_production_ids: ownedProductionIds }
  )

  if (error) {
    console.error("Error consultando estado de pagos:", error.message)
    return null
  }

  const totals = new Map<string, number>()
  for (const row of data || []) {
    const amount = Number(row.paid_amount)
    if (!Number.isFinite(amount)) continue
    totals.set(row.production_id, amount)
  }

  return totals
}

export const formatArs = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount)
