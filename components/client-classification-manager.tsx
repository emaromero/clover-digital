"use client"

import {
  useState,
} from "react"

import {
  Building2,
  Check,
  Loader2,
  Tag,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Office {
  id: string
  name: string
}

interface TagItem {
  id: string
  name: string
}

interface Props {
  userId: string
  offices: Office[]
  tags: TagItem[]
  initialOfficeId:
    | string
    | null
  initialTagIds: string[]
}

export default function ClientClassificationManager({
  userId,
  offices,
  tags,
  initialOfficeId,
  initialTagIds,
}: Props) {
  const [
    officeId,
    setOfficeId,
  ] =
    useState(
      initialOfficeId ||
        ""
    )

  const [
    selectedTagIds,
    setSelectedTagIds,
  ] =
    useState<string[]>(
      initialTagIds
    )

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    message,
    setMessage,
  ] =
    useState("")

  const toggleTag = (
    tagId: string
  ) => {
    setSelectedTagIds(
      (current) =>
        current.includes(
          tagId
        )
          ? current.filter(
              (id) =>
                id !==
                tagId
            )
          : [
              ...current,
              tagId,
            ]
    )
  }

  const save =
    async () => {
      setLoading(true)
      setMessage("")

      const supabase =
        createClient()

      const {
        data:
          updatedProfile,
        error:
          profileError,
      } =
        await supabase
          .from("profiles")
          .update({
            office_id:
              officeId ||
              null,
          })
          .eq(
            "id",
            userId
          )
          .select(
            "id, office_id"
          )
          .single()

      if (
        profileError ||
        !updatedProfile
      ) {
        console.error(
          profileError
        )

        setMessage(
          "No pudimos guardar la oficina."
        )

        setLoading(false)

        return
      }

      const {
        error:
          deleteError,
      } =
        await supabase
          .from(
            "profile_tags"
          )
          .delete()
          .eq(
            "user_id",
            userId
          )

      if (deleteError) {
        console.error(
          deleteError
        )

        setMessage(
          "No pudimos actualizar los tags."
        )

        setLoading(false)

        return
      }

      if (
        selectedTagIds.length >
        0
      ) {
        const {
          error:
            insertError,
        } =
          await supabase
            .from(
              "profile_tags"
            )
            .insert(
              selectedTagIds.map(
                (tagId) => ({
                  user_id:
                    userId,

                  tag_id:
                    tagId,
                })
              )
            )

        if (insertError) {
          console.error(
            insertError
          )

          setMessage(
            "La oficina se guardó, pero no pudimos actualizar todos los tags."
          )

          setLoading(false)

          return
        }
      }

      setMessage(
        "Datos internos guardados."
      )

      setLoading(false)
    }

  return (
    <section className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
          <Building2 className="h-5 w-5" />
        </div>

        <div>

          <h2 className="font-bold text-gray-900 dark:text-white">
            Organización interna
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Oficina y tags visibles únicamente para administración.
          </p>

        </div>

      </div>

      <div className="mt-6">

        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Oficina / inmobiliaria
        </label>

        <select
          value={
            officeId
          }
          onChange={(
            event
          ) =>
            setOfficeId(
              event.target.value
            )
          }
          className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
        >

          <option value="">
            Sin oficina
          </option>

          {offices.map(
            (office) => (
              <option
                key={
                  office.id
                }
                value={
                  office.id
                }
              >
                {
                  office.name
                }
              </option>
            )
          )}

        </select>

      </div>

      <div className="mt-6">

        <div className="flex items-center gap-2">

          <Tag className="h-4 w-4 text-[#0A9396]" />

          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Tags del cliente
          </p>

        </div>

        {tags.length ===
        0 ? (
          <p className="mt-3 text-sm text-gray-400">
            Todavía no creaste tags de clientes.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">

            {tags.map(
              (tag) => {
                const active =
                  selectedTagIds.includes(
                    tag.id
                  )

                return (
                  <button
                    key={
                      tag.id
                    }
                    type="button"
                    onClick={() =>
                      toggleTag(
                        tag.id
                      )
                    }
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      active
                        ? "border-[#0A9396] bg-[#0A9396]/10 text-[#0A9396]"
                        : "border-gray-200 text-gray-500 hover:border-[#0A9396]/40 dark:border-white/10 dark:text-gray-300"
                    }`}
                  >

                    {active && (
                      <Check className="h-3.5 w-3.5" />
                    )}

                    {
                      tag.name
                    }

                  </button>
                )
              }
            )}

          </div>
        )}

      </div>

      <button
        type="button"
        onClick={
          save
        }
        disabled={
          loading
        }
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-60"
      >

        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}

        Guardar organización

      </button>

      {message && (
        <p
          className={`mt-3 text-sm font-medium ${
            message ===
            "Datos internos guardados."
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {
            message
          }
        </p>
      )}

    </section>
  )
}