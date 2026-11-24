
"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

type ActivityType = "portal_visit" | "production_view"

type MaterialLink = {
  id: string
  url: string
}

interface Props {
  type: ActivityType
  productionId?: string
  materialLinks?: MaterialLink[]
}

export default function ClientActivityTracker({
  type,
  productionId,
  materialLinks = [],
}: Props) {
  const recorded = useRef(false)

  useEffect(() => {
    if (recorded.current) return
    recorded.current = true

    const supabase = createClient()
    let cancelled = false
    let removeListener: (() => void) | undefined

    const initialize = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || cancelled) return

      const recordEvent = async (
        eventType: "portal_visit" | "production_view" | "material_click",
        fileId?: string
      ) => {
        const { error } = await supabase
          .from("client_activity_events")
          .insert({
            user_id: user.id,
            production_id:
              eventType === "portal_visit"
                ? null
                : productionId ?? null,
            file_id: fileId ?? null,
            event_type: eventType,
          })

        if (error) {
          console.error(
            "Error al registrar actividad:",
            error.message
          )
        }
      }

      await recordEvent(type)

      if (
        type !== "production_view" ||
        !productionId ||
        cancelled
      ) {
        return
      }

      const linksByUrl = new Map(
        materialLinks.map((file) => [
          new URL(file.url, window.location.origin).href,
          file.id,
        ])
      )

      const handleMaterialClick = (event: MouseEvent) => {
        if (!(event.target instanceof Element)) return

        const anchor = event.target.closest("a[href]")
        if (!anchor) return

        const fileId = linksByUrl.get(
          (anchor as HTMLAnchorElement).href
        )

        if (!fileId) return

        void recordEvent("material_click", fileId)
      }

      document.addEventListener("click", handleMaterialClick)

      removeListener = () => {
        document.removeEventListener(
          "click",
          handleMaterialClick
        )
      }
    }

    void initialize()

    return () => {
      cancelled = true
      removeListener?.()
    }
  }, [type, productionId, materialLinks])

  return null
}
