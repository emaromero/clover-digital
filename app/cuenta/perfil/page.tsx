import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowLeft,
  UserRound,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

import ProfileForm from "@/components/profile-form"
import LogoutButton from "@/components/logout-button"

export default async function CuentaPerfilPage() {
  const supabase =
    await createClient()

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    redirect("/ingresar")
  }

  const metadataName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Usuario"

  const metadataAvatar =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null

  const {
    data: profile,
  } =
    await supabase
      .from("profiles")
      .select(`
        full_name,
        email,
        avatar_url,
        phone
      `)
      .eq(
        "id",
        user.id
      )
      .maybeSingle()

  const profileName =
    profile?.full_name ||
    metadataName

  const profileAvatar =
    profile?.avatar_url ||
    metadataAvatar

  const profilePhone =
    profile?.phone ||
    ""

  return (
    <main className="min-h-screen bg-[#f5fafa] px-4 py-6 dark:bg-[#001219] sm:py-10 md:py-16">

      <div className="mx-auto max-w-3xl">

        <Link
          href="/cuenta"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />

          Volver a mi cuenta
        </Link>

        <section className="mt-6 rounded-3xl border border-gray-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#06222c] sm:mt-8 sm:p-6 md:p-8">

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">

            {profileAvatar ? (
              <img
                src={
                  profileAvatar
                }
                alt={
                  profileName
                }
                className="h-14 w-14 shrink-0 rounded-full object-cover sm:h-16 sm:w-16"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/10 text-[#0A9396] sm:h-16 sm:w-16">

                <UserRound className="h-7 w-7" />

              </div>
            )}

            <div>

              <p className="text-sm font-semibold text-[#0A9396]">
                Mi perfil
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                Datos personales
              </h1>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Mantené actualizados tus datos personales y de contacto.
              </p>

            </div>

          </div>

          <div className="mt-6 border-t border-gray-100 pt-6 dark:border-white/10 sm:mt-8 sm:pt-8">

            <ProfileForm
              userId={
                user.id
              }
              initialName={
                profileName
              }
              email={
                user.email ||
                ""
              }
              initialAvatar={
                profileAvatar
              }
              initialPhone={
                profilePhone
              }
            />

          </div>

        </section>

        <div className="mt-8 flex justify-center">

          <LogoutButton />

        </div>

      </div>

    </main>
  )
}