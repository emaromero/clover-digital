import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function CuentaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Usuario"

  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null

  return (
    <main className="min-h-screen bg-[#B8D8D8]/30 dark:bg-[#001219] px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#06222c] p-8 shadow-xl">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#0A9396]/15 flex items-center justify-center text-2xl font-bold text-[#0A9396]">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-[#0A9396] mb-1">
                Clover Academy
              </p>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Hola, {fullName}
              </h1>

              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-white/10 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tu cuenta está lista
            </h2>

            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Próximamente vas a poder acceder desde acá a tus cursos,
              progreso, evaluaciones y certificados.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="text-sm text-[#0A9396] hover:underline"
            >
              ← Volver a Clover Digital
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}