import {
  notFound,
  redirect,
} from "next/navigation"

import { createClient } from "@/lib/supabase/server"

import EditProductionForm from "@/components/edit-production-form"
import ProductionFinancePanel from "@/components/production-finance-panel"
import ProductionParticipantsManager from "@/components/production-participants-manager"
import ProductionTagsManager from "@/components/production-tags-manager"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminProductionPage({
  params,
}: PageProps) {
  const { id } =
    await params

  const supabase =
    await createClient()

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const {
    data: roleData,
  } =
    await supabase
      .from("user_roles")
      .select("role")
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle()

  if (
    roleData?.role !==
    "admin"
  ) {
    redirect("/cuenta")
  }

  const {
    data: production,
  } =
    await supabase
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
      .eq(
        "id",
        id
      )
      .maybeSingle()

  if (!production) {
    notFound()
  }

  const {
    data: profiles,
  } =
    await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email
      `)
      .order(
        "full_name",
        {
          ascending: true,
        }
      )

  const clients =
    profiles || []

  const {
    data: participantRows,
  } =
    await supabase
      .from(
        "production_users"
      )
      .select(
        "user_id"
      )
      .eq(
        "production_id",
        production.id
      )

  const participantIds =
    participantRows?.map(
      (row) =>
        row.user_id
    ) || []

  if (
    production.user_id &&
    !participantIds.includes(
      production.user_id
    )
  ) {
    participantIds.unshift(
      production.user_id
    )
  }

  const orderedParticipantIds =
    production.user_id
      ? [
          production.user_id,
          ...participantIds.filter(
            (userId) =>
              userId !==
              production.user_id
          ),
        ]
      : participantIds

  const {
    data: files,
  } =
    await supabase
      .from(
        "production_files"
      )
      .select(`
        id,
        production_id,
        label,
        file_type,
        url,
        expires_at,
        created_at
      `)
      .eq(
        "production_id",
        production.id
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      )

  const {
    data: payments,
  } =
    await supabase
      .from(
        "production_payments"
      )
      .select(`
        id,
        production_id,
        amount,
        paid_at,
        payment_method,
        notes,
        created_at
      `)
      .eq(
        "production_id",
        production.id
      )
      .order(
        "paid_at",
        {
          ascending: false,
        }
      )

  const {
    data: tags,
  } =
    await supabase
      .from("tags")
      .select(`
        id,
        name
      `)
      .eq(
        "scope",
        "production"
      )
      .order(
        "name",
        {
          ascending: true,
        }
      )

  const {
    data: productionTagRows,
  } =
    await supabase
      .from(
        "production_tags"
      )
      .select(
        "tag_id"
      )
      .eq(
        "production_id",
        production.id
      )

  return (
    <>
      <EditProductionForm
        production={
          production
        }
        initialFiles={
          files || []
        }
      />

      <div className="mx-auto -mt-8 grid max-w-5xl gap-6 px-4 pb-8 lg:grid-cols-2">

        <ProductionParticipantsManager
          productionId={
            production.id
          }
          clients={
            clients
          }
          initialUserIds={
            orderedParticipantIds
          }
          initialPrimaryUserId={
            production.user_id
          }
          pendingClientName={
            production.client_name
          }
          pendingClientEmail={
            production.client_email
          }
        />

        <ProductionTagsManager
          productionId={
            production.id
          }
          tags={
            tags || []
          }
          initialTagIds={
            (
              productionTagRows ||
              []
            ).map(
              (item) =>
                item.tag_id
            )
          }
        />

      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16">

        <ProductionFinancePanel
          productionId={
            production.id
          }
          totalAmount={
            production.total_amount
          }
          invoiceStatus={
            production.invoice_status
          }
          invoiceNumber={
            production.invoice_number
          }
          invoiceDate={
            production.invoice_date
          }
          initialPayments={
            payments || []
          }
        />

      </div>
    </>
  )
}