import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  FolderOpen,
  Plus,
  UserRound,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  completed: "Realizada",
  editing: "En edición",
  delivered: "Entregada",
  archived: "Archivada",
  cancelled: "Cancelada",
}

const STATUS_CLASSES: Record<string, string> = {
  confirmed:
    "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  completed:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  editing:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  delivered:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  archived:
    "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300",
  cancelled:
    "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300",
}

export default async function AdminProduccionesPage() {
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

  const { data: productions } = await supabase
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
      created_at,
      profiles:user_id (
        full_name,
        email,
        avatar_url
      )
    `)
    .order("production_date", {
      ascending: false,
      nullsFirst: false,
    })

  const rows = productions || []

  const formatDate = (date?: string | null) => {
    if (!date) return "A coordinar"

    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  const money = (value?: number | null) => {
    if (value === null || value === undefined) {
      return "-"
    }

    return `$ ${Number(value).toLocaleString("es-AR")}`
  }

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">

        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-[#0A9396] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a administración
          </Link>
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0A9396]">
              Clover Digital
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
              Producciones
            </h1>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Gestioná propiedades, clientes y estados de entrega.
            </p>
          </div>

          <Link
            href="/admin/producciones/nueva"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219]"
          >
            <Plus className="h-4 w-4" />
            Nueva producción
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-[#0A9396]" />

              <h2 className="font-semibold text-gray-900 dark:text-white">
                Todas las producciones
              </h2>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
                <FolderOpen className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                Todavía no hay producciones
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Creá la primera producción y asignala a un cliente.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {rows.map((production: any) => {
                const profile = Array.isArray(production.profiles)
                  ? production.profiles[0]
                  : production.profiles

                return (
                  <div
                    key={production.id}
                    className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:px-6"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">

                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt=""
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396]">
                          <UserRound className="h-5 w-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {production.property_name}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              STATUS_CLASSES[production.status] ||
                              STATUS_CLASSES.archived
                            }`}
                          >
                            {STATUS_LABELS[production.status] ||
                              production.status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          {profile?.full_name || "Sin nombre"} ·{" "}
                          {profile?.email || "Sin email"}
                        </p>

                        {production.property_address && (
                          <p className="mt-1 text-xs text-gray-400">
                            {production.property_address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-5 text-sm text-gray-500 md:w-[42%]">

                      <div>
                        <p className="text-xs text-gray-400">
                          Fecha
                        </p>

                        <p className="mt-1 font-medium text-gray-700 dark:text-gray-200">
                          {formatDate(production.production_date)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Servicios
                        </p>

                        <p className="mt-1 max-w-[220px] font-medium text-gray-700 dark:text-gray-200">
                          {production.services?.length
                            ? production.services.join(" · ")
                            : "Sin servicios"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Total
                        </p>

                        <p className="mt-1 font-medium text-gray-700 dark:text-gray-200">
                          {money(production.total_amount)}
                        </p>
                      </div>
                    </div>

                    <div className="md:ml-auto">
                      <Link
                        href={`/admin/producciones/${production.id}`}
                        className="text-sm font-semibold text-[#0A9396] hover:underline"
                      >
                        Ver producción
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}