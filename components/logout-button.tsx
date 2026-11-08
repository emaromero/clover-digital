"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const router =
    useRouter()

  const handleLogout =
    async () => {
      const supabase =
        createClient()

      await supabase.auth.signOut()

      router.push("/")
      router.refresh()
    }

  return (
    <button
      type="button"
      onClick={
        handleLogout
      }
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
    >
      <LogOut className="h-4 w-4" />

      Cerrar sesión
    </button>
  )
}