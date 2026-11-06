import Link from "next/link"
import {
  ArchiveRestore,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FolderOpen,
  GraduationCap,
  Mail,
  Phone,
  UserRound,
} from "lucide-react"
import {
  notFound,
  redirect,
} from "next/navigation"

import { createClient } from "@/lib/supabase/server"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  completed: "Realizada",
  editing: "En edición",
  delivered: "Entregada",
  archived: "Archivada",
  cancelled: "Cancelada",
}

export default async function AdminClientDetailPage({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      phone,
      avatar_url,
      created_at
    `)
    .eq("id", id)
    .maybeSingle()

  if (!profile) {
    notFound()
  }

  const { data: productions } = await supabase
    .from("productions")
    .select(`
      id,
      property_name,
      property_address,
      production_date,
      status,
      services,
      delivered_at,
      created_at
    `)
    .eq("user_id", id)
    .order("production_date", {
      ascending: false,
      nullsFirst: false,
    })

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      status,
      enrolled_at,
      courses (
        id,
        title,
        slug
      )
    `)
    .eq("user_id", id)
    .order("enrolled_at", {
      ascending: false,
    })

  const { data: recoveries } = await supabase
    .from("recovery_requests")
    .select(`
      id,
      production_id,
      status,
      requested_at
    `)
    .eq("user_id", id)
    .order("requested_at", {
      ascending: false,
    })

  const allProductions =
    productions || []

  const allEnrollments =
    enrollments || []

  const allRecoveries =
    recoveries || []

  const formatDate = (
    value?: string | null
  ) => {
    if (!value) return "-"

    return new Intl.DateTimeFormat(
      "es-AR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    ).format(new Date(value))
  }

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">

        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a clientes
        </Link>

        <section className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center">

            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396]">
                <UserRound className="h-8 w-8" />
              </div>
            )}

            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0A9396]">
                Cliente Clover
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {profile.full_name ||
                  "Sin nombre"}
              </h1>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 hover:text-[#0A9396]"
                  >
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </a>
                )}

                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="inline-flex items-center gap-2 hover:text-[#0A9396]"
                  >
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </a>
                )}

              </div>
            </div>

            <div className="text-sm text-gray-400">
              Registrado el{" "}
              {formatDate(
                profile.created_at
              )}
            </div>

          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">
            <FolderOpen className="h-5 w-5 text-[#0A9396]" />

            <p className="mt-4 text-sm text-gray-500">
              Producciones
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {allProductions.length}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">
            <GraduationCap className="h-5 w-5 text-[#0A9396]" />

            <p className="mt-4 text-sm text-gray-500">
              Inscripciones
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {allEnrollments.length}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">
            <ArchiveRestore className="h-5 w-5 text-[#0A9396]" />

            <p className="mt-4 text-sm text-gray-500">
              Recuperaciones
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {allRecoveries.length}
            </p>
          </div>

        </div>

        <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#06222c]">

          <div className="border-b border-gray-100 p-6 dark:border-white/10 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Producciones
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Historial de propiedades de este cliente.
            </p>
          </div>

          {allProductions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Este cliente todavía no tiene producciones.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {allProductions.map(
                (production) => (
                  <div
                    key={production.id}
                    className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:px-8"
                  >

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {production.property_name}
                      </p>

                      {production.property_address && (
                        <p className="mt-1 text-sm text-gray-500">
                          {production.property_address}
                        </p>
                      )}

                      {production.services?.length > 0 && (
                        <p className="mt-2 text-xs text-gray-400">
                          {production.services.join(
                            " · "
                          )}
                        </p>
                      )}
                    </div>

                    <div className="md:w-[140px]">
                      <p className="text-xs text-gray-400">
                        Fecha
                      </p>

                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(
                          production.production_date
                        )}
                      </p>
                    </div>

                    <div className="md:w-[140px]">
                      <p className="text-xs text-gray-400">
                        Estado
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {STATUS_LABELS[
                          production.status
                        ] ||
                          production.status}
                      </p>
                    </div>

                    <Link
                      href={`/admin/producciones/${production.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#0A9396] hover:underline"
                    >
                      Ver producción
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-[#0A9396]" />

            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">
                Clover Academy
              </h2>

              <p className="text-sm text-gray-500">
                Inscripciones del cliente.
              </p>
            </div>
          </div>

          {allEnrollments.length === 0 ? (
            <p className="mt-5 text-sm text-gray-500">
              Sin cursos asignados.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {allEnrollments.map(
                (enrollment) => {
                  const course =
                    Array.isArray(
                      enrollment.courses
                    )
                      ? enrollment.courses[0]
                      : enrollment.courses

                  return (
                    <div
                      key={enrollment.id}
                      className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {course?.title ||
                          "Curso"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Estado:{" "}
                        {enrollment.status}
                      </p>
                    </div>
                  )
                }
              )}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}