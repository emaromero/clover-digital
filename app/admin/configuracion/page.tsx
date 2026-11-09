import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowLeft,
  Settings2,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

import AdminClassificationSettings from "@/components/admin-classification-settings"

export default async function AdminConfiguracionPage() {
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
    data: offices,
  } =
    await supabase
      .from(
        "client_offices"
      )
      .select(`
        id,
        name,
        created_at
      `)
      .order(
        "name",
        {
          ascending: true,
        }
      )

  const {
    data: tags,
  } =
    await supabase
      .from("tags")
      .select(`
        id,
        name,
        scope,
        created_at
      `)
      .order(
        "name",
        {
          ascending: true,
        }
      )

  const allTags =
    tags || []

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />

          Volver a administración
        </Link>

        <div className="mt-8">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
            <Settings2 className="h-6 w-6" />
          </div>

          <p className="mt-5 text-sm font-semibold text-[#0A9396]">
            Configuración interna
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Oficinas y tags
          </h1>

          <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
            Administrá las oficinas inmobiliarias y las etiquetas internas que usa Clover Digital para organizar clientes y producciones.
          </p>

        </div>

        <div className="mt-8">

          <AdminClassificationSettings
            initialOffices={
              offices || []
            }
            initialClientTags={
              allTags.filter(
                (tag) =>
                  tag.scope ===
                  "client"
              )
            }
            initialProductionTags={
              allTags.filter(
                (tag) =>
                  tag.scope ===
                  "production"
              )
            }
          />

        </div>

      </div>

    </main>
  )
}