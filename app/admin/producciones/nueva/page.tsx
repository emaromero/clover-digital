import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

import NewProductionForm from "@/components/new-production-form"

export default async function NuevaProduccionPage() {
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

  const {
    data: profiles,
  } =
    await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        office_id
      `)
      .order(
        "full_name",
        {
          ascending: true,
        }
      )

  const {
    data: offices,
  } =
    await supabase
      .from(
        "client_offices"
      )
      .select(`
        id,
        name
      `)
      .order(
        "name",
        {
          ascending: true,
        }
      )

  const {
    data: tags,
  } =
    await supabase
      .from("tags")
      .select(`
        id,
        name,
        scope
      `)
      .order(
        "name",
        {
          ascending: true,
        }
      )

  const {
    data: profileTags,
  } =
    await supabase
      .from(
        "profile_tags"
      )
      .select(`
        user_id,
        tag_id
      `)

  const allOffices =
    offices || []

  const officeMap =
    new Map(
      allOffices.map(
        (office) => [
          office.id,
          office.name,
        ]
      )
    )

  const tagIdsByUser =
    new Map<
      string,
      string[]
    >()

  for (
    const item of
    profileTags || []
  ) {
    const current =
      tagIdsByUser.get(
        item.user_id
      ) || []

    current.push(
      item.tag_id
    )

    tagIdsByUser.set(
      item.user_id,
      current
    )
  }

  const clients =
    (profiles || []).map(
      (profile) => ({
        id:
          profile.id,

        full_name:
          profile.full_name,

        email:
          profile.email,

        avatar_url:
          profile.avatar_url,

        office_id:
          profile.office_id,

        office_name:
          profile.office_id
            ? officeMap.get(
                profile.office_id
              ) || null
            : null,

        tag_ids:
          tagIdsByUser.get(
            profile.id
          ) || [],
      })
    )

  const allTags =
    tags || []

  return (
    <NewProductionForm
      clients={
        clients
      }
      offices={
        allOffices
      }
      clientTags={
        allTags
          .filter(
            (tag) =>
              tag.scope ===
              "client"
          )
          .map(
            (tag) => ({
              id:
                tag.id,

              name:
                tag.name,
            })
          )
      }
      productionTags={
        allTags
          .filter(
            (tag) =>
              tag.scope ===
              "production"
          )
          .map(
            (tag) => ({
              id:
                tag.id,

              name:
                tag.name,
            })
          )
      }
    />
  )
}