"use client"

import {
  useState,
} from "react"

import {
  Check,
  Loader2,
  Tag,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface TagItem {
  id: string
  name: string
}

interface Props {
  productionId: string
  tags: TagItem[]
  initialTagIds: string[]
}

export default function ProductionTagsManager({
  productionId,
  tags,
  initialTagIds,
}: Props) {
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
        error:
          deleteError,
      } =
        await supabase
          .from(
            "production_tags"
          )
          .delete()
          .eq(
            "production_id",
            productionId
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
              "production_tags"
            )
            .insert(
              selectedTagIds.map(
                (tagId) => ({
                  production_id:
                    productionId,

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
            "No pudimos guardar todos los tags."
          )

          setLoading(false)

          return
        }
      }

      setMessage(
        "Tags guardados."
      )

      setLoading(false)
    }

  return (
    <section className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c]">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
          <Tag className="h-5 w-5" />
        </div>

        <div>

          <h2 className="font-bold text-gray-900 dark:text-white">
            Tags internos
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Organización interna de esta producción.
          </p>

        </div>

      </div>

      {tags.length ===
      0 ? (
        <p className="mt-5 text-sm text-gray-400">
          Todavía no hay tags de producciones.
        </p>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">

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

      <button
        type="button"
        onClick={
          save
        }
        disabled={
          loading
        }
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-60"
      >

        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}

        Guardar tags

      </button>

      {message && (
        <p
          className={`mt-3 text-sm font-medium ${
            message ===
            "Tags guardados."
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