
import type React from "react"

import { createClient } from "@/lib/supabase/server"

import ClientActivityTracker from "@/components/client-activity-tracker"
import ProductionShareManager from "@/components/production-share-manager"

interface Props {
  children: React.ReactNode
  params: Promise<{
    id: string
  }>
}

export default async function ProductionTrackingLayout({
  children,
  params,
}: Props) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <>{children}</>
  }

  const { data: production } = await supabase
    .from("productions")
    .select(
      "id, user_id, property_name, status, available_until"
    )
    .eq("id", id)
    .maybeSingle()

  if (!production) {
    return <>{children}</>
  }

  const { data: files } = await supabase
    .from("production_files")
    .select("id, url")
    .eq("production_id", production.id)

  const materialLinks = (files || [])
    .filter((file) => Boolean(file.url))
    .map((file) => ({
      id: file.id,
      url: file.url,
    }))

  const isOwner = production.user_id === user.id

  const isAvailable =
    production.status === "delivered" &&
    (
      !production.available_until ||
      new Date(production.available_until).getTime() >
        Date.now()
    )

  return (
    <>
      <ClientActivityTracker
        type="production_view"
        productionId={production.id}
        materialLinks={materialLinks}
      />

      {children}

      {isOwner && isAvailable && (
        <div className="bg-[#f5fafa] dark:bg-[#001219]">
          <ProductionShareManager
            productionId={production.id}
            propertyName={production.property_name}
          />
        </div>
      )}
    </>
  )
}
