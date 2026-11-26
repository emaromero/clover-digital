import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Only share-link metadata is returned to the owner.
 * Visitor identities, timestamps and tracking counters never enter
 * the owner-facing client response.
 *
 * Database migration restricts the original activity RPC to backend use.
 * Run it before deploying this route.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const productionId = url.searchParams.get("productionId")

  if (!productionId || !UUID.test(productionId)) {
    return NextResponse.json({ error: "Producción inválida." }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Iniciá sesión." }, { status: 401 })
  }

  const { data: production } = await supabase
    .from("productions")
    .select("id, user_id")
    .eq("id", productionId)
    .maybeSingle()

  if (!production || production.user_id !== user.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 })
  }

  const { data, error } = await supabase.rpc(
    "list_production_share_links_safe",
    { p_production_id: productionId }
  )

  if (error) {
    return NextResponse.json(
      { error: "No pudimos consultar los enlaces." },
      { status: 500 }
    )
  }

  const links = new Map<
    string,
    {
      share_token: string
      created_at: string
      expires_at: string
      revoked_at: string | null
    }
  >()

  for (const item of (data || []) as Array<Record<string, unknown>>) {
    if (
      typeof item.share_token !== "string" ||
      typeof item.created_at !== "string" ||
      typeof item.expires_at !== "string"
    ) {
      continue
    }

    links.set(item.share_token, {
      share_token: item.share_token,
      created_at: item.created_at,
      expires_at: item.expires_at,
      revoked_at:
        typeof item.revoked_at === "string" ? item.revoked_at : null,
    })
  }

  return NextResponse.json(
    { links: [...links.values()] },
    { headers: { "Cache-Control": "private, no-store" } }
  )
}
