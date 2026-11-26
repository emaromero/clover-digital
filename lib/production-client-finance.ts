import { createClient } from "@supabase/supabase-js"

/**
 * Use only after the caller has verified that every production belongs
 * to the authenticated agent. Never accept arbitrary IDs from a browser.
 *
 * Uses the server-side service key so payment totals work even when
 * production_payments is correctly restricted by RLS to administrators.
 * No payment method, notes or individual payment records are returned.
 */
export async function getOwnerPaymentTotals(
  ownedProductionIds: string[]
): Promise<Map<string, number> | null> {
  if (ownedProductionIds.length === 0) return new Map()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return null
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await admin
    .from("production_payments")
    .select("production_id, amount")
    .in("production_id", ownedProductionIds)

  if (error) {
    console.error("Error consultando importes cobrados:", error.message)
    return null
  }

  const totals = new Map<string, number>()
  for (const row of data || []) {
    const amount = Number(row.amount)
    if (!Number.isFinite(amount)) continue
    totals.set(
      row.production_id,
      (totals.get(row.production_id) || 0) + amount
    )
  }

  return totals
}

export const formatArs = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount)
