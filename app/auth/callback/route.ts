
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)

  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")

  if (code) {
    const supabase = await createClient()

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return NextResponse.redirect(
        new URL("/ingresar?error=auth", requestUrl.origin)
      )
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isGoogleUser =
      user?.app_metadata?.provider === "google" ||
      user?.app_metadata?.providers?.includes("google")

    if (user && isGoogleUser) {
      const googleAvatar =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null

      const validAvatar =
        typeof googleAvatar === "string" &&
        googleAvatar.startsWith("https://")
          ? googleAvatar
          : null

      if (validAvatar) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .maybeSingle()

        if (profile?.avatar_url !== validAvatar) {
          await supabase
            .from("profiles")
            .update({
              avatar_url: validAvatar,
            })
            .eq("id", user.id)
        }
      }
    }
  }

  const safeNext =
    next && next.startsWith("/")
      ? next
      : "/cuenta"

  return NextResponse.redirect(
    new URL(safeNext, requestUrl.origin)
  )
}
