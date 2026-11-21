"use client"

import { useEffect, useRef, type ComponentProps } from "react"
import { createClient } from "@/lib/supabase/client"

type ActivityKind = "portal_visit" | "production_view" | "material_click"

async function recordActivity(kind: ActivityKind, productionId?: string, fileId?: string) {
  try {
    await createClient().rpc("record_portal_activity", {
      p_kind: kind,
      p_production_id: productionId ?? null,
      p_file_id: fileId ?? null,
    })
  } catch {
    // An unavailable activity log should never interrupt the client portal.
  }
}

export function PortalActivity({ productionId }: { productionId?: string }) {
  const lastRecorded = useRef<string | null>(null)

  useEffect(() => {
    const recordVisiblePage = () => {
      const page = productionId ?? "portal"

      if (document.visibilityState !== "visible" || lastRecorded.current === page) {
        return
      }

      lastRecorded.current = page
      void recordActivity(productionId ? "production_view" : "portal_visit", productionId)
    }

    recordVisiblePage()
    document.addEventListener("visibilitychange", recordVisiblePage)
    return () => document.removeEventListener("visibilitychange", recordVisiblePage)
  }, [productionId])

  return null
}

type MaterialLinkProps = ComponentProps<"a"> & { productionId: string; fileId: string }

export function TrackedMaterialLink({ productionId, fileId, ...props }: MaterialLinkProps) {
  return (
    <a
      {...props}
      onClick={() => void recordActivity("material_click", productionId, fileId)}
      onAuxClick={(event) => {
        if (event.button === 1) {
          void recordActivity("material_click", productionId, fileId)
        }
      }}
    />
  )
}