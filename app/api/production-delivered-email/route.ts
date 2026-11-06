import { NextResponse } from "next/server"
import { Resend } from "resend"

import { createClient } from "@/lib/supabase/server"

const resend = new Resend(
  process.env.RESEND_API_KEY
)

const escapeHtml = (
  value?: string | null
) => {
  if (!value) return ""

  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export async function POST(
  request: Request
) {
  try {
    const supabase =
      await createClient()

    const {
      data: { user },
    } =
      await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error: "No autorizado.",
        },
        {
          status: 401,
        }
      )
    }

    /*
     * Solo un administrador de Clover
     * puede disparar este email.
     */
    const { data: roleData } =
      await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()

    if (
      roleData?.role !== "admin"
    ) {
      return NextResponse.json(
        {
          error: "No autorizado.",
        },
        {
          status: 403,
        }
      )
    }

    const body =
      await request.json()

    const productionId =
      body.productionId

    if (!productionId) {
      return NextResponse.json(
        {
          error:
            "Falta la producción.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * Buscamos la producción.
     */
    const {
      data: production,
      error: productionError,
    } =
      await supabase
        .from("productions")
        .select(`
          id,
          user_id,
          property_name,
          property_address,
          production_date,
          status,
          delivered_at,
          available_until,
          delivered_email_sent_at
        `)
        .eq(
          "id",
          productionId
        )
        .maybeSingle()

    if (
      productionError ||
      !production
    ) {
      console.error(
        "Error buscando producción:",
        productionError
      )

      return NextResponse.json(
        {
          error:
            "No encontramos la producción.",
        },
        {
          status: 404,
        }
      )
    }

    /*
     * Solamente se manda
     * cuando está Entregada.
     */
    if (
      production.status !==
      "delivered"
    ) {
      return NextResponse.json({
        skipped: true,
        reason:
          "La producción no está entregada.",
      })
    }

    /*
     * Si ya se envió alguna vez,
     * no lo volvemos a enviar.
     */
    if (
      production.delivered_email_sent_at
    ) {
      return NextResponse.json({
        skipped: true,
        reason:
          "El email ya fue enviado.",
      })
    }

    /*
     * Verificamos que exista
     * material cargado.
     */
    const {
      count: filesCount,
      error: filesError,
    } =
      await supabase
        .from("production_files")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "production_id",
          production.id
        )

    if (filesError) {
      console.error(
        "Error verificando material:",
        filesError
      )
    }

    if (
      !filesCount ||
      filesCount <= 0
    ) {
      return NextResponse.json(
        {
          skipped: true,
          reason:
            "Todavía no hay material cargado.",
        },
        {
          status: 409,
        }
      )
    }

    /*
     * Buscamos los datos del cliente.
     */
    const {
      data: profile,
      error: profileError,
    } =
      await supabase
        .from("profiles")
        .select(`
          full_name,
          email
        `)
        .eq(
          "id",
          production.user_id
        )
        .maybeSingle()

    if (profileError) {
      console.error(
        "Error buscando cliente:",
        profileError
      )
    }

    if (!profile?.email) {
      return NextResponse.json(
        {
          error:
            "El cliente no tiene un email cargado.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !process.env.RESEND_API_KEY
    ) {
      return NextResponse.json(
        {
          error:
            "Resend no está configurado.",
        },
        {
          status: 500,
        }
      )
    }

    const fromEmail =
      process.env
        .RESEND_FROM_EMAIL ||
      "Clover Digital <onboarding@resend.dev>"

    const siteUrl =
      process.env
        .NEXT_PUBLIC_SITE_URL ||
      "https://cloverdigital.vercel.app"

    const productionUrl =
      `${siteUrl}/producciones/${production.id}`

    /*
     * Si el perfil dice
     * "Mariana Kuhn",
     * saludamos "Mariana".
     */
    const fullName =
      profile.full_name
        ?.trim() || ""

    const firstName =
      fullName
        .split(/\s+/)
        .filter(Boolean)[0] ||
      "Hola"

    const availableUntil =
      production.available_until
        ? new Intl.DateTimeFormat(
            "es-AR",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }
          ).format(
            new Date(
              production.available_until
            )
          )
        : null

    /*
     * EMAIL
     */
    const {
      data: emailData,
      error: emailError,
    } =
      await resend.emails.send({
        from:
          fromEmail,

        to:
          profile.email,

        subject:
          `Tu material ya está disponible — ${production.property_name}`,

        html: `
          <div
            style="
              margin:0;
              padding:32px 16px;
              background:#f3f8f8;
              font-family:Arial,Helvetica,sans-serif;
              color:#1f2937;
            "
          >
            <div
              style="
                max-width:620px;
                margin:0 auto;
                background:#ffffff;
                border:1px solid #e5e7eb;
                border-radius:22px;
                overflow:hidden;
              "
            >

              <div
                style="
                  padding:32px 32px 26px;
                "
              >
                <div
                  style="
                    margin-bottom:10px;
                    color:#0A9396;
                    font-size:13px;
                    font-weight:700;
                    letter-spacing:.06em;
                  "
                >
                  CLOVER DIGITAL
                </div>

                <h1
                  style="
                    margin:0;
                    color:#111827;
                    font-size:28px;
                    line-height:1.2;
                  "
                >
                  Tu material ya está disponible
                </h1>

                <p
                  style="
                    margin:18px 0 0;
                    color:#4b5563;
                    font-size:15px;
                    line-height:1.7;
                  "
                >
                  Hola ${escapeHtml(firstName)}, ¿cómo estás?
                </p>

                <p
                  style="
                    margin:10px 0 0;
                    color:#4b5563;
                    font-size:15px;
                    line-height:1.7;
                  "
                >
                  Ya está disponible el material audiovisual de
                  <strong>
                    ${escapeHtml(production.property_name)}
                  </strong>.
                </p>

                <p
                  style="
                    margin:10px 0 0;
                    color:#4b5563;
                    font-size:15px;
                    line-height:1.7;
                  "
                >
                  Podés acceder a la producción y descargar el material desde tu cuenta de Clover Digital.
                </p>

                <div
                  style="
                    margin:26px 0;
                    padding:20px;
                    background:#f8fafc;
                    border-radius:14px;
                  "
                >
                  <p
                    style="
                      margin:0 0 10px;
                      color:#374151;
                      font-size:14px;
                      line-height:1.6;
                    "
                  >
                    <strong>Propiedad:</strong>
                    ${escapeHtml(production.property_name)}
                  </p>

                  ${
                    production.property_address
                      ? `
                        <p
                          style="
                            margin:0 0 10px;
                            color:#374151;
                            font-size:14px;
                            line-height:1.6;
                          "
                        >
                          <strong>Dirección:</strong>
                          ${escapeHtml(production.property_address)}
                        </p>
                      `
                      : ""
                  }

                  ${
                    availableUntil
                      ? `
                        <p
                          style="
                            margin:0;
                            color:#374151;
                            font-size:14px;
                            line-height:1.6;
                          "
                        >
                          <strong>Disponible online hasta:</strong>
                          ${availableUntil}
                        </p>
                      `
                      : ""
                  }
                </div>

                <div
                  style="
                    margin:28px 0;
                  "
                >
                  <a
                    href="${productionUrl}"
                    style="
                      display:inline-block;
                      padding:14px 22px;
                      background:#0e5c6e;
                      color:#ffffff;
                      text-decoration:none;
                      border-radius:11px;
                      font-size:14px;
                      font-weight:700;
                    "
                  >
                    Ver mi producción
                  </a>
                </div>

                <p
                  style="
                    margin:0;
                    color:#4b5563;
                    font-size:14px;
                    line-height:1.7;
                  "
                >
                  El material permanecerá disponible online durante
                  <strong>90 días</strong>.
                  Te recomendamos descargar y conservar una copia.
                </p>

                <p
                  style="
                    margin:16px 0 0;
                    color:#4b5563;
                    font-size:14px;
                    line-height:1.7;
                  "
                >
                  Si tenés algún inconveniente con el acceso o la descarga, escribinos y lo resolvemos.
                </p>

                <p
                  style="
                    margin:22px 0 0;
                    color:#4b5563;
                    font-size:14px;
                    line-height:1.7;
                  "
                >
                  Muchas gracias por confiar en Clover Digital.
                </p>

                <p
                  style="
                    margin:8px 0 0;
                    color:#111827;
                    font-size:14px;
                    line-height:1.7;
                    font-weight:700;
                  "
                >
                  Equipo de Clover Digital
                </p>
              </div>

              <div
                style="
                  padding:18px 32px;
                  background:#f8fafc;
                  border-top:1px solid #e5e7eb;
                "
              >
                <p
                  style="
                    margin:0;
                    color:#9ca3af;
                    font-size:11px;
                    line-height:1.6;
                  "
                >
                  Este correo fue enviado automáticamente desde el portal de Clover Digital.
                </p>
              </div>

            </div>
          </div>
        `,
      })

    if (
      emailError ||
      !emailData
    ) {
      console.error(
        "Error enviando email:",
        emailError
      )

      return NextResponse.json(
        {
          error:
            "La producción está guardada, pero el email no pudo enviarse.",
        },
        {
          status: 500,
        }
      )
    }

    /*
     * Recién después de que
     * Resend confirme el envío
     * marcamos el email como enviado.
     */
    const sentAt =
      new Date().toISOString()

    const {
      error: updateError,
    } =
      await supabase
        .from("productions")
        .update({
          delivered_email_sent_at:
            sentAt,
        })
        .eq(
          "id",
          production.id
        )

    if (updateError) {
      console.error(
        "Email enviado pero no se pudo registrar delivered_email_sent_at:",
        updateError
      )
    }

    return NextResponse.json({
      sent: true,
      sentAt,
      emailId:
        emailData.id,
    })
  } catch (error) {
    console.error(
      "Production delivered email error:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Ocurrió un error inesperado.",
      },
      {
        status: 500,
      }
    )
  }
}