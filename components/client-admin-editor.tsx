"use client"

import Link from "next/link"

import {
  Building2,
  Check,
  IdCard,
  Loader2,
  Phone,
  Save,
  Tag,
} from "lucide-react"

import {
  FormEvent,
  useState,
} from "react"

import { useRouter } from "next/navigation"

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
  fullName: string | null
  email: string | null
  initialPhone: string | null
  initialOfficeId: string | null
  initialTaxId: string | null
  initialTagIds: string[]
  offices: Office[]
  tags: TagItem[]
}

export default function ClientAdminEditor({
  userId,
  fullName,
  email,
  initialPhone,
  initialOfficeId,
  initialTaxId,
  initialTagIds,
  offices,
  tags,
}: Props) {
  const router =
    useRouter()

  const [
    phone,
    setPhone,
  ] =
    useState(
      initialPhone || ""
    )

  const [
    officeId,
    setOfficeId,
  ] =
    useState(
      initialOfficeId || ""
    )

  const [
    taxId,
    setTaxId,
  ] =
    useState(
      initialTaxId || ""
    )

  const [
    selectedTagIds,
    setSelectedTagIds,
  ] =
    useState<string[]>(
      initialTagIds
    )

  const [
    saving,
    setSaving,
  ] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
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

  const handleSubmit =
    async (
      event: FormEvent
    ) => {
      event.preventDefault()

      setErrorMessage("")

      const normalizedTaxId =
        taxId.replace(
          /\D/g,
          ""
        )

      if (
        normalizedTaxId &&
        (
          normalizedTaxId.length <
            7 ||
          normalizedTaxId.length >
            11
        )
      ) {
        setErrorMessage(
          "Revisá el CUIT, CUIL o DNI ingresado."
        )

        return
      }

      setSaving(true)

      const supabase =
        createClient()

      const {
        data: updatedProfile,
        error: profileError,
      } =
        await supabase
          .from("profiles")
          .update({
            phone:
              phone.trim() ||
              null,

            office_id:
              officeId ||
              null,
          })
          .eq(
            "id",
            userId
          )
          .select(
            "id"
          )
          .single()

      if (
        profileError ||
        !updatedProfile
      ) {
        console.error(
          profileError
        )

        setErrorMessage(
          "No pudimos actualizar los datos del cliente."
        )

        setSaving(false)

        return
      }

      const {
        error: taxError,
      } =
        await supabase
          .from(
            "client_tax_data"
          )
          .upsert(
            {
              user_id:
                userId,

              tax_id:
                normalizedTaxId ||
                null,

              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "user_id",
            }
          )

      if (taxError) {
        console.error(
          taxError
        )

        setErrorMessage(
          "No pudimos actualizar el CUIT, CUIL o DNI."
        )

        setSaving(false)

        return
      }

      const {
        error: deleteTagsError,
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

      if (deleteTagsError) {
        console.error(
          deleteTagsError
        )

        setErrorMessage(
          "No pudimos actualizar los tags."
        )

        setSaving(false)

        return
      }

      if (
        selectedTagIds.length >
        0
      ) {
        const {
          error: insertTagsError,
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

        if (insertTagsError) {
          console.error(
            insertTagsError
          )

          setErrorMessage(
            "Los datos se guardaron, pero hubo un problema actualizando los tags."
          )

          setSaving(false)

          return
        }
      }

      router.push(
        `/admin/clientes/${userId}`
      )

      router.refresh()
    }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8"
    >

      <div>

        <p className="text-sm font-semibold text-[#0A9396]">
          Cliente
        </p>

        <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {fullName ||
            "Sin nombre"}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {email ||
            "Sin email"}
        </p>

      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">

        <div>

          <div className="flex items-center gap-2">

            <Phone className="h-4 w-4 text-[#0A9396]" />

            <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Teléfono / WhatsApp
            </label>

          </div>

          <input
            type="tel"
            value={
              phone
            }
            onChange={(
              event
            ) =>
              setPhone(
                event.target.value
              )
            }
            placeholder="+54 9 11 1234 5678"
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
          />

          <p className="mt-2 text-xs text-gray-400">
            Para el enlace directo de WhatsApp, conviene guardarlo con código de país.
          </p>

        </div>

        <div>

          <div className="flex items-center gap-2">

            <Building2 className="h-4 w-4 text-[#0A9396]" />

            <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Oficina / inmobiliaria
            </label>

          </div>

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
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
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

          <Link
            href="/admin/configuracion"
            className="mt-2 inline-block text-xs font-semibold text-[#0A9396] hover:underline"
          >
            Administrar oficinas
          </Link>

        </div>

        <div>

          <div className="flex items-center gap-2">

            <IdCard className="h-4 w-4 text-[#0A9396]" />

            <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              CUIT / CUIL / DNI
            </label>

          </div>

          <input
            type="text"
            inputMode="numeric"
            value={
              taxId
            }
            onChange={(
              event
            ) =>
              setTaxId(
                event.target.value
              )
            }
            placeholder="Ej. 20392124730"
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
          />

          <p className="mt-2 text-xs text-gray-400">
            Podés escribirlo con o sin puntos o guiones. Se guarda solo el número.
          </p>

        </div>

      </div>

      <div className="mt-8 border-t border-gray-100 pt-6 dark:border-white/10">

        <div className="flex items-center gap-2">

          <Tag className="h-4 w-4 text-[#0A9396]" />

          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Tags del cliente
          </p>

        </div>

        <p className="mt-1 text-sm text-gray-500">
          Podés asignar todos los tags internos que necesites.
        </p>

        {tags.length ===
        0 ? (
          <div className="mt-4">

            <p className="text-sm text-gray-400">
              Todavía no hay tags de clientes.
            </p>

            <Link
              href="/admin/configuracion"
              className="mt-2 inline-block text-sm font-semibold text-[#0A9396] hover:underline"
            >
              Crear tags
            </Link>

          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">

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

      {errorMessage && (
        <p className="mt-6 text-sm font-semibold text-red-600 dark:text-red-400">
          {
            errorMessage
          }
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 dark:border-white/10 sm:flex-row sm:justify-end">

        <Link
          href={`/admin/clientes/${userId}`}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={
            saving
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-60"
        >

          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {saving
            ? "Guardando..."
            : "Guardar cambios"}

        </button>

      </div>

    </form>
  )
}