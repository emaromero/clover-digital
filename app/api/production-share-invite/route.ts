
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Debés iniciar sesión." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const productionId = body.productionId

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (
      typeof productionId !== "string" ||
      !uuidPattern.test(productionId)
    ) {
      return NextResponse.json(
        { error: "Producción inválida." },
        { status: 400 }
      )
    }

    const { data: token, error } = await supabase.rpc(
      "create_production_share_link",
      {
        p_production_id: productionId,
      }
    )

    if (error || !token) {
      return NextResponse.json(
        {
          error: error?.message || "No pudimos generar el enlace.",
        },
        { status: 403 }
      )
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.cloverdigital.com.ar"
    ).replace(/\/$/, "")

    return NextResponse.json({
      created: true,
      token,
      inviteUrl: `${siteUrl}/compartida/${token}`,
    })
  } catch (error) {
    console.error("Error generando enlace compartido:", error)

    return NextResponse.json(
      { error: "No pudimos generar el enlace." },
      { status: 500 }
    )
  }
}
