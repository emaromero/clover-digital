import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EditProductionForm from "@/components/edit-production-form"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminProductionPage({
  params,
}: PageProps) {
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
    .order("full_name", {
      ascending: true,
    })

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
    .eq("production_id", id)
    .order("created_at", {
      ascending: true,
    })

  return (
    <EditProductionForm
      production={production}
      clients={profiles || []}
      initialFiles={files || []}
    />
  )
}