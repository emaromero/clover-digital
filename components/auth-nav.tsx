"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { UserRound } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface AuthNavProps {
  mobile?: boolean
}

export default function AuthNav({
  mobile = false,
}: AuthNavProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)
      setLoading(false)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div
        className={
          mobile
            ? "w-10 h-10"
            : "w-[150px] h-10"
        }
      />
    )
  }

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    ""

  const avatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null

  if (user) {
    if (mobile) {
      return (
        <Link
          href="/cuenta"
          aria-label="Mi cuenta"
          className="
            w-10
            h-10
            rounded-full
            overflow-hidden
            flex
            items-center
            justify-center
            bg-white/40
            dark:bg-white/10
            border
            border-white/50
            dark:border-white/10
            backdrop-blur-md
          "
        >
          {avatar ? (
            <img
              src={avatar}
              alt={fullName || "Mi cuenta"}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserRound className="w-5 h-5" />
          )}
        </Link>
      )
    }

    return (
      <Link
        href="/cuenta"
        className="
          flex
          items-center
          gap-2
          px-3
          py-2
          rounded-full
          hover:bg-white/30
          dark:hover:bg-white/10
          transition-colors
        "
      >
        {avatar ? (
          <img
            src={avatar}
            alt={fullName || "Mi cuenta"}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="
            w-8
            h-8
            rounded-full
            bg-[#0A9396]/15
            flex
            items-center
            justify-center
          ">
            <UserRound className="w-4 h-4 text-[#0A9396]" />
          </div>
        )}

        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Mi cuenta
        </span>
      </Link>
    )
  }

  if (mobile) {
    return (
      <Link
        href="/ingresar"
        aria-label="Ingresar"
        className="
          w-10
          h-10
          rounded-full
          flex
          items-center
          justify-center
          bg-white/25
          dark:bg-black/10
          backdrop-blur-md
        "
      >
        <UserRound className="w-5 h-5" />
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/ingresar"
        className="
          px-3
          py-2
          text-sm
          font-medium
          text-gray-700
          dark:text-gray-200
          hover:text-[#0A9396]
          transition-colors
        "
      >
        Ingresar
      </Link>

      <Link
        href="/registro"
        className="
          px-4
          py-2
          rounded-full
          bg-[#0e5c6e]
          text-white
          text-sm
          font-medium
          hover:bg-[#001219]
          transition-colors
        "
      >
        Registrarse
      </Link>
    </div>
  )
}