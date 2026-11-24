
"use client"

import { ExternalLink, FolderOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Props {
  token: string
  fileId: string
  href: string
  label: string
}

export default function SharedMaterialLink({
  token,
  fileId,
  href,
  label,
}: Props) {
  const recordClick = () => {
    void createClient().rpc("track_shared_material", {
      p_token: token,
      p_file_id: fileId,
    })
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={recordClick}
      onAuxClick={(event) => {
        if (event.button === 1) {
          recordClick()
        }
      }}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 p-4 transition hover:border-[#0A9396]/40 hover:bg-[#0A9396]/5 dark:border-white/10 dark:hover:bg-white/[0.03]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396]">
          <FolderOpen className="h-5 w-5" />
        </div>

        <span className="min-w-0 break-words text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </span>
      </div>

      <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#0e5c6e] px-3 py-2 text-xs font-semibold text-white group-hover:bg-[#001219]">
        Abrir
        <ExternalLink className="h-4 w-4" />
      </span>
    </a>
  )
}
