"use client"

import {
  useState,
} from "react"

import {
  Building2,
  Check,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Office {
  id: string
  name: string
  created_at?: string
}

interface TagItem {
  id: string
  name: string
  scope:
    | "client"
    | "production"
  created_at?: string
}

interface Props {
  initialOffices: Office[]
  initialClientTags: TagItem[]
  initialProductionTags: TagItem[]
}

export default function AdminClassificationSettings({
  initialOffices,
  initialClientTags,
  initialProductionTags,
}: Props) {
  const [
    offices,
    setOffices,
  ] =
    useState<Office[]>(
      initialOffices
    )

  const [
    clientTags,
    setClientTags,
  ] =
    useState<TagItem[]>(
      initialClientTags
    )

  const [
    productionTags,
    setProductionTags,
  ] =
    useState<TagItem[]>(
      initialProductionTags
    )

  const [
    newOffice,
    setNewOffice,
  ] =
    useState("")

  const [
    newClientTag,
    setNewClientTag,
  ] =
    useState("")

  const [
    newProductionTag,
    setNewProductionTag,
  ] =
    useState("")

  const [
    loadingKey,
    setLoadingKey,
  ] =
    useState<string | null>(
      null
    )

  const [
    message,
    setMessage,
  ] =
    useState("")

  const sortByName = <
    T extends {
      name: string
    },
  >(
    items: T[]
  ) =>
    [...items].sort(
      (
        a,
        b
      ) =>
        a.name.localeCompare(
          b.name,
          "es"
        )
    )

  const createOffice =
    async () => {
      const name =
        newOffice.trim()

      if (!name) {
        return
      }

      setLoadingKey(
        "new-office"
      )

      setMessage("")

      const supabase =
        createClient()

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "client_offices"
          )
          .insert({
            name,
          })
          .select(
            "id, name, created_at"
          )
          .single()

      if (
        error ||
        !data
      ) {
        console.error(
          error
        )

        setMessage(
          "No pudimos crear la oficina. Revisá que no exista otra con el mismo nombre."
        )

        setLoadingKey(null)

        return
      }

      setOffices(
        (current) =>
          sortByName([
            ...current,
            data,
          ])
      )

      setNewOffice("")
      setLoadingKey(null)
    }

  const createTag =
    async (
      scope:
        | "client"
        | "production"
    ) => {
      const value =
        scope ===
        "client"
          ? newClientTag
          : newProductionTag

      const name =
        value.trim()

      if (!name) {
        return
      }

      const key =
        `new-${scope}`

      setLoadingKey(key)
      setMessage("")

      const supabase =
        createClient()

      const {
        data,
        error,
      } =
        await supabase
          .from("tags")
          .insert({
            name,
            scope,
          })
          .select(
            "id, name, scope, created_at"
          )
          .single()

      if (
        error ||
        !data
      ) {
        console.error(
          error
        )

        setMessage(
          "No pudimos crear el tag. Revisá que no exista otro con el mismo nombre."
        )

        setLoadingKey(null)

        return
      }

      if (
        scope ===
        "client"
      ) {
        setClientTags(
          (current) =>
            sortByName([
              ...current,
              data as TagItem,
            ])
        )

        setNewClientTag("")
      } else {
        setProductionTags(
          (current) =>
            sortByName([
              ...current,
              data as TagItem,
            ])
        )

        setNewProductionTag("")
      }

      setLoadingKey(null)
    }

  const renameOffice =
    async (
      office: Office
    ) => {
      const name =
        window.prompt(
          "Nuevo nombre de la oficina:",
          office.name
        )?.trim()

      if (
        !name ||
        name === office.name
      ) {
        return
      }

      const key =
        `office-${office.id}`

      setLoadingKey(key)
      setMessage("")

      const supabase =
        createClient()

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "client_offices"
          )
          .update({
            name,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            office.id
          )
          .select(
            "id, name, created_at"
          )
          .single()

      if (
        error ||
        !data
      ) {
        console.error(
          error
        )

        setMessage(
          "No pudimos renombrar la oficina."
        )

        setLoadingKey(null)

        return
      }

      setOffices(
        (current) =>
          sortByName(
            current.map(
              (item) =>
                item.id ===
                office.id
                  ? data
                  : item
            )
          )
      )

      setLoadingKey(null)
    }

  const renameTag =
    async (
      tag: TagItem
    ) => {
      const name =
        window.prompt(
          "Nuevo nombre del tag:",
          tag.name
        )?.trim()

      if (
        !name ||
        name === tag.name
      ) {
        return
      }

      const key =
        `tag-${tag.id}`

      setLoadingKey(key)
      setMessage("")

      const supabase =
        createClient()

      const {
        data,
        error,
      } =
        await supabase
          .from("tags")
          .update({
            name,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            tag.id
          )
          .select(
            "id, name, scope, created_at"
          )
          .single()

      if (
        error ||
        !data
      ) {
        console.error(
          error
        )

        setMessage(
          "No pudimos renombrar el tag."
        )

        setLoadingKey(null)

        return
      }

      const updater = (
        current:
          TagItem[]
      ) =>
        sortByName(
          current.map(
            (item) =>
              item.id ===
                tag.id
                ? data as TagItem
                : item
          )
        )

      if (
        tag.scope ===
        "client"
      ) {
        setClientTags(
          updater
        )
      } else {
        setProductionTags(
          updater
        )
      }

      setLoadingKey(null)
    }

  const deleteOffice =
    async (
      office: Office
    ) => {
      const confirmed =
        window.confirm(
          `¿Eliminar "${office.name}"? Los clientes asociados quedarán sin oficina, pero no se eliminará ningún cliente.`
        )

      if (!confirmed) {
        return
      }

      const key =
        `office-${office.id}`

      setLoadingKey(key)
      setMessage("")

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from(
            "client_offices"
          )
          .delete()
          .eq(
            "id",
            office.id
          )

      if (error) {
        console.error(
          error
        )

        setMessage(
          "No pudimos eliminar la oficina."
        )

        setLoadingKey(null)

        return
      }

      setOffices(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              office.id
          )
      )

      setLoadingKey(null)
    }

  const deleteTag =
    async (
      tag: TagItem
    ) => {
      const confirmed =
        window.confirm(
          `¿Eliminar el tag "${tag.name}"? Se quitará también de todos los lugares donde esté asignado.`
        )

      if (!confirmed) {
        return
      }

      const key =
        `tag-${tag.id}`

      setLoadingKey(key)
      setMessage("")

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from("tags")
          .delete()
          .eq(
            "id",
            tag.id
          )

      if (error) {
        console.error(
          error
        )

        setMessage(
          "No pudimos eliminar el tag."
        )

        setLoadingKey(null)

        return
      }

      if (
        tag.scope ===
        "client"
      ) {
        setClientTags(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                tag.id
            )
        )
      } else {
        setProductionTags(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                tag.id
            )
        )
      }

      setLoadingKey(null)
    }

  const Collection = ({
    title,
    description,
    icon,
    items,
    newValue,
    setNewValue,
    onCreate,
    onRename,
    onDelete,
    loadingPrefix,
    placeholder,
  }: {
    title: string
    description: string
    icon: React.ReactNode
    items: Array<{
      id: string
      name: string
    }>
    newValue: string
    setNewValue: (
      value: string
    ) => void
    onCreate:
      () => void
    onRename: (
      item: any
    ) => void
    onDelete: (
      item: any
    ) => void
    loadingPrefix: string
    placeholder: string
  }) => {
    return (
      <section className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
            {
              icon
            }
          </div>

          <div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {
                title
              }
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {
                description
              }
            </p>

          </div>

        </div>

        <div className="mt-6 flex gap-2">

          <input
            type="text"
            value={
              newValue
            }
            onChange={(
              event
            ) =>
              setNewValue(
                event.target.value
              )
            }
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                "Enter"
              ) {
                event.preventDefault()

                onCreate()
              }
            }}
            placeholder={
              placeholder
            }
            className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
          />

          <button
            type="button"
            onClick={
              onCreate
            }
            disabled={
              Boolean(
                loadingKey
              ) ||
              !newValue.trim()
            }
            className="inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50"
          >

            {loadingKey ===
            loadingPrefix ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            Crear

          </button>

        </div>

        {items.length ===
        0 ? (
          <p className="mt-6 text-sm text-gray-400">
            Todavía no hay elementos creados.
          </p>
        ) : (
          <div className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 dark:divide-white/10 dark:border-white/10">

            {items.map(
              (item) => {
                const busy =
                  loadingKey ===
                    `office-${item.id}` ||
                  loadingKey ===
                    `tag-${item.id}`

                return (
                  <div
                    key={
                      item.id
                    }
                    className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-[#001219]"
                  >

                    <Check className="h-4 w-4 shrink-0 text-[#0A9396]" />

                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {
                        item.name
                      }
                    </p>

                    <button
                      type="button"
                      disabled={
                        Boolean(
                          loadingKey
                        )
                      }
                      onClick={() =>
                        onRename(
                          item
                        )
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-[#0A9396] disabled:opacity-50 dark:hover:bg-white/5"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Pencil className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={
                        Boolean(
                          loadingKey
                        )
                      }
                      onClick={() =>
                        onDelete(
                          item
                        )
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </div>
                )
              }
            )}

          </div>
        )}

      </section>
    )
  }

  return (
    <>

      {message && (
        <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">

          <p>
            {
              message
            }
          </p>

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">

        <Collection
          title="Oficinas"
          description="Inmobiliarias, sucursales u oficinas a las que pertenecen tus clientes."
          icon={
            <Building2 className="h-5 w-5" />
          }
          items={
            offices
          }
          newValue={
            newOffice
          }
          setNewValue={
            setNewOffice
          }
          onCreate={
            createOffice
          }
          onRename={
            renameOffice
          }
          onDelete={
            deleteOffice
          }
          loadingPrefix="new-office"
          placeholder="Ej. RE/MAX Parque"
        />

        <Collection
          title="Tags de clientes"
          description="Características internas del cliente. Un cliente puede tener varios."
          icon={
            <Tag className="h-5 w-5" />
          }
          items={
            clientTags
          }
          newValue={
            newClientTag
          }
          setNewValue={
            setNewClientTag
          }
          onCreate={() =>
            createTag(
              "client"
            )
          }
          onRename={
            renameTag
          }
          onDelete={
            deleteTag
          }
          loadingPrefix="new-client"
          placeholder="Ej. Frecuente"
        />

        <Collection
          title="Tags de producciones"
          description="Estados o características internas de una producción concreta."
          icon={
            <Tag className="h-5 w-5" />
          }
          items={
            productionTags
          }
          newValue={
            newProductionTag
          }
          setNewValue={
            setNewProductionTag
          }
          onCreate={() =>
            createTag(
              "production"
            )
          }
          onRename={
            renameTag
          }
          onDelete={
            deleteTag
          }
          loadingPrefix="new-production"
          placeholder="Ej. Entrega urgente"
        />

      </div>

    </>
  )
}