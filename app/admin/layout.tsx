import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArchiveRestore,
  CircleDollarSign,
  FolderOpen,
  GraduationCap,
  Home,
  LayoutDashboard,
  UserRound,
  Users,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return (
    <div className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">

      <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#001219]/95">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">

          <Link
            href="/admin"
            className="flex shrink-0 items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396]">

              <LayoutDashboard className="h-5 w-5" />

            </div>

            <div className="hidden sm:block">

              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Clover Admin
              </p>

              <p className="text-xs text-gray-400">
                Administración
              </p>

            </div>

          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto">

            <Link
              href="/admin"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-[#0A9396]/10 hover:text-[#0A9396] dark:text-gray-300"
            >

              <Home className="h-4 w-4" />

              <span className="hidden xl:inline">
                Inicio
              </span>

            </Link>

            <Link
              href="/admin/producciones"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-[#0A9396]/10 hover:text-[#0A9396] dark:text-gray-300"
            >

              <FolderOpen className="h-4 w-4" />

              <span className="hidden lg:inline">
                Producciones
              </span>

            </Link>

            <Link
              href="/admin/clientes"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-[#0A9396]/10 hover:text-[#0A9396] dark:text-gray-300"
            >

              <Users className="h-4 w-4" />

              <span className="hidden lg:inline">
                Clientes
              </span>

            </Link>

            <Link
              href="/admin/finanzas"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-[#0A9396]/10 hover:text-[#0A9396] dark:text-gray-300"
            >

              <CircleDollarSign className="h-4 w-4" />

              <span className="hidden lg:inline">
                Finanzas
              </span>

            </Link>

            <Link
              href="/admin/recuperaciones"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-[#0A9396]/10 hover:text-[#0A9396] dark:text-gray-300"
            >

              <ArchiveRestore className="h-4 w-4" />

              <span className="hidden xl:inline">
                Recuperaciones
              </span>

            </Link>

            <Link
              href="/admin/academy"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-[#0A9396]/10 hover:text-[#0A9396] dark:text-gray-300"
            >

              <GraduationCap className="h-4 w-4" />

              <span className="hidden xl:inline">
                Academy
              </span>

            </Link>

            <Link
              href="/cuenta"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-[#0A9396]/10 hover:text-[#0A9396] dark:text-gray-300"
            >

              <UserRound className="h-4 w-4" />

              <span className="hidden xl:inline">
                Mi cuenta
              </span>

            </Link>

            <Link
              href="/"
              className="inline-flex shrink-0 items-center rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-[#0A9396]/30 hover:text-[#0A9396] dark:border-white/10 dark:text-gray-300"
            >
              Ver sitio
            </Link>

          </nav>

        </div>

      </header>

      {children}

    </div>
  )
}