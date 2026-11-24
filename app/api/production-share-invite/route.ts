
import { NextResponse } from "next/server"
import { Resend } from "resend"

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
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : ""

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (
      typeof productionId !== "string" ||
      !uuidPattern.test(productionId) ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Datos de invitación inválidos." },
        { status: 400 }
      )
    }

    // La función SQL verifica que el usuario
    // sea el titular de la producción entregada.
    const { data: token, error: inviteError } =
      await supabase.rpc("create_production_share", {
        p_production_id: productionId,
        p_email: email,
      })

    if (inviteError || !token) {
      return NextResponse.json(
        {
          error:
            inviteError?.message ||
            "No pudimos crear la invitación.",
        },
        { status: 403 }
      )
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.cloverdigital.com.ar"
    ).replace(/\/$/, "")

    const inviteUrl = `${siteUrl}/compartida/${token}`

    const { data: production } = await supabase
      .from("productions")
      .select("property_name")
      .eq("id", productionId)
      .maybeSingle()

    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL

    if (!apiKey || !fromEmail) {
      return NextResponse.json({
        created: true,
        emailSent: false,
      })
    }

    const resend = new Resend(apiKey)

    const { error: mailError } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Te compartieron una producción de Clover Digital",
      text: [
        "Hola,",
        "",
        "Un agente inmobiliario te invitó a consultar una producción de Clover Digital.",
        "",
        production?.property_name
          ? `Propiedad: ${production.property_name}`
          : "",
        "",
        "Ingresá desde este enlace:",
        inviteUrl,
        "",
        "Deberás iniciar sesión o crear una cuenta con el correo electrónico que recibió esta invitación.",
        "",
        "El acceso es de solo lectura y podrá revocarse.",
        "La invitación vence dentro de 30 días.",
        "",
        "Clover Digital",
      ]
        .filter((line) => line !== undefined)
        .join("\n"),
    })

    return NextResponse.json({
      created: true,
      emailSent: !mailError,
    })
  } catch (error) {
    console.error("Error enviando invitación:", error)

    return NextResponse.json(
      { error: "No pudimos procesar la invitación." },
      { status: 500 }
    )
  }
}
