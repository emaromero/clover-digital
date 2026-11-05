import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import NewProductionForm from "@/components/new-production-form"

export default async function NuevaProduccionPage() {
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

  return (
    <NewProductionForm
      clients={profiles || []}
    />
  )
}