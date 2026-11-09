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
    <section className="rounded-3xl border border-gray-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#06222c] sm:p-6">

      <div className="flex items-start gap-3 sm:gap-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396] sm:h-11 sm:w-11 sm:rounded-2xl">
          <Tag className="h-5 w-5" />
        </div>

        <div>

          <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-base">
            Tags internos
          </h2>

          <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
            Organización interna de esta producción.
          </p>

        </div>

      </div>

      {tags.length ===
      0 ? (
        <p className="mt-4 text-xs text-gray-400 sm:mt-5 sm:text-sm">
          Todavía no hay tags de producciones.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">

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
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition sm:gap-2 sm:px-3 sm:py-2 sm:text-xs ${
                    active
                      ? "border-[#0A9396] bg-[#0A9396]/10 text-[#0A9396]"
                      : "border-gray-200 text-gray-500 hover:border-[#0A9396]/40 dark:border-white/10 dark:text-gray-300"
                  }`}
                >

                  {active && (
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-60 sm:mt-5"
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
          className={`mt-2 text-xs font-medium sm:mt-3 sm:text-sm ${
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