import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { formatPortalActivity } from "@/lib/portal-activity"

import EditProductionForm from "@/components/edit-production-form"
import ProductionFinancePanel from "@/components/production-finance-panel"
import ProductionParticipantsManager from "@/components/production-participants-manager"
import ProductionTagsManager from "@/components/production-tags-manager"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminProductionPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  if (roleData?.role !== "admin") {
    redirect("/cuenta")
  }

  const { data: production } = await supabase
    .from("productions")
    .select(`
      id,
      user_id,
      client_name,
      client_email,
      property_name,
      property_address,
      production_date,
      status,
      services,
      total_amount,
      estimated_delivery_at,
      delivered_at,
      available_until,
      notes,
      invoice_status,
      invoice_number,
      invoice_date,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .maybeSingle()

  if (!production) {
    notFound()
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email
    `)
    .order("full_name", { ascending: true })

  const clients = profiles || []

  const { data: participantRows } = await supabase
    .from("production_users")
    .select("user_id")
    .eq("production_id", production.id)

  const participantIds = participantRows?.map((row) => row.user_id) || []

  if (production.user_id && !participantIds.includes(production.user_id)) {
    participantIds.unshift(production.user_id)
  }

  const orderedParticipantIds = production.user_id
    ? [
        production.user_id,
        ...participantIds.filter((userId) => userId !== production.user_id),
      ]
    : participantIds

  const { data: files } = await supabase
    .from("production_files")
    .select(`
      id,
      production_id,
      label,
      file_type,
      url,
      expires_at,
      created_at
    `)
    .eq("production_id", production.id)
    .order("created_at", { ascending: true })

  const { data: payments } = await supabase
    .from("production_payments")
    .select(`
      id,
      production_id,
      amount,
      paid_at,
      payment_method,
      notes,
      created_at
    `)
    .eq("production_id", production.id)
    .order("paid_at", { ascending: false })

  const { data: tags } = await supabase
    .from("tags")
    .select(`
      id,
      name
    `)
    .eq("scope", "production")
    .order("name", { ascending: true })

  const { data: productionTagRows } = await supabase
    .from("production_tags")
    .select("tag_id")
    .eq("production_id", production.id)

  const { data: activityRows, error: activityError } = await supabase
    .rpc("admin_production_activity", { p_production_id: production.id })

  const clientById = new Map(clients.map((client) => [client.id, client]))
  const activityByUser = new Map<string, {
    last_viewed_at: string | null
    last_clicked_at: string | null
    view_count: number
    click_count: number
  }>()

  if (Array.isArray(activityRows)) {
    for (const row of activityRows) {
      activityByUser.set(row.user_id, row)
    }
  }

  const activityUserIds = [
    ...new Set([...orderedParticipantIds, ...activityByUser.keys()]),
  ]

  return (
    <>
      <EditProductionForm
        production={production}
        initialFiles={files || []}
      />

      <div className="mx-auto -mt-8 grid max-w-5xl gap-6 px-4 pb-8 lg:grid-cols-2">
        <ProductionParticipantsManager
          productionId={production.id}
          clients={clients}
          initialUserIds={orderedParticipantIds}
          initialPrimaryUserId={production.user_id}
          pendingClientName={production.client_name}
          pendingClientEmail={production.client_email}
        />

        <ProductionTagsManager
          productionId={production.id}
          tags={tags || []}
          initialTagIds={(productionTagRows || []).map((item) => item.tag_id)}
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        <section className="mb-6 rounded-3xl border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#06222c] sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Actividad de la producción
          </h2>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Los clics registran la apertura del enlace desde el portal. La visualización o descarga en el servicio externo no se registra.
          </p>

          {activityError ? (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              No se pudo cargar la actividad.
            </p>
          ) : activityUserIds.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Todavía no hay clientes vinculados ni actividad registrada.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-gray-200 dark:divide-white/10">
              {activityUserIds.map((userId) => {
                const client = clientById.get(userId)
                const activity = activityByUser.get(userId)

                return (
                  <li key={userId} className="grid gap-2 py-3 sm:grid-cols-3 sm:gap-4">
                    <Link
                      href={`/admin/clientes/${userId}`}
                      className="min-w-0 break-words font-semibold text-[#0e5c6e] hover:underline dark:text-teal-300"
                    >
                      {client?.full_name || client?.email || "Cliente"}
                    </Link>

                    <div className="text-sm text-gray-700 dark:text-gray-200">
                      <span className="block font-medium">
                        Última vista {activity?.view_count ? `(${activity.view_count})` : ""}
                      </span>
                      {formatPortalActivity(activity?.last_viewed_at)}
                    </div>

                    <div className="text-sm text-gray-700 dark:text-gray-200">
                      <span className="block font-medium">
                        Último clic en material {activity?.click_count ? `(${activity.click_count})` : ""}
                      </span>
                      {formatPortalActivity(activity?.last_clicked_at)}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <ProductionFinancePanel
          productionId={production.id}
          totalAmount={production.total_amount}
          initialInvoiceStatus={production.invoice_status}
          initialInvoiceNumber={production.invoice_number}
          initialInvoiceDate={production.invoice_date}
          initialPayments={payments || []}
        />
      </div>
    </>
  )
}