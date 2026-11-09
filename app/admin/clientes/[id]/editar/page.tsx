import Link from "next/link"

import {
  ArrowLeft,
  Pencil,
} from "lucide-react"

import {
  notFound,
  redirect,
} from "next/navigation"

import { createClient } from "@/lib/supabase/server"

import ClientAdminEditor from "@/components/client-admin-editor"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditarClientePage({
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
    data: profile,
  } =
    await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        office_id
      `)
      .eq(
        "id",
        id
      )
      .maybeSingle()

  if (!profile) {
    notFound()
  }

  const {
    data: taxData,
  } =
    await supabase
      .from(
        "client_tax_data"
      )
      .select(
        "tax_id"
      )
      .eq(
        "user_id",
        id
      )
      .maybeSingle()

  const {
    data: offices,
  } =
    await supabase
      .from(
        "client_offices"
      )
      .select(`
        id,
        name
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
        name
      `)
      .eq(
        "scope",
        "client"
      )
      .order(
        "name",
        {
          ascending: true,
        }
      )

  const {
    data: profileTagRows,
  } =
    await supabase
      .from(
        "profile_tags"
      )
      .select(
        "tag_id"
      )
      .eq(
        "user_id",
        id
      )

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">

      <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">

        <Link
          href={`/admin/clientes/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />

          Volver al cliente
        </Link>

        <div className="mt-8">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
            <Pencil className="h-5 w-5" />
          </div>

          <p className="mt-5 text-sm font-semibold text-[#0A9396]">
            Administración
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Editar cliente
          </h1>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Modificá los datos internos que usa Clover Digital para gestionar este cliente.
          </p>

        </div>

        <div className="mt-8">

          <ClientAdminEditor
            userId={
              profile.id
            }
            fullName={
              profile.full_name
            }
            email={
              profile.email
            }
            initialPhone={
              profile.phone
            }
            initialOfficeId={
              profile.office_id
            }
            initialTaxId={
              taxData?.tax_id ||
              null
            }
            initialTagIds={
              (
                profileTagRows ||
                []
              ).map(
                (item) =>
                  item.tag_id
              )
            }
            offices={
              offices || []
            }
            tags={
              tags || []
            }
          />

        </div>

      </div>

    </main>
  )
}