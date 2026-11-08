"use client"

import {
  Check,
  IdCard,
  Loader2,
} from "lucide-react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Props {
  userId: string
  initialTaxId: string | null
}

export default function ClientTaxIdEditor({
  userId,
  initialTaxId,
}: Props) {
  const [
    taxId,
    setTaxId,
  ] =
    useState(
      initialTaxId || ""
    )

  const [
    saving,
    setSaving,
  ] =
    useState(false)

  const [
    saved,
    setSaved,
  ] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("")

  const handleSave =
    async () => {
      setErrorMessage("")
      setSaved(false)

      const normalized =
        taxId.replace(
          /\D/g,
          ""
        )

      if (
        normalized &&
        (
          normalized.length <
            7 ||
          normalized.length >
            11
        )
      ) {
        setErrorMessage(
          "Ingresá un CUIT o DNI válido."
        )

        return
      }

      setSaving(true)

      const supabase =
        createClient()

      const {
        error,
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
                normalized ||
                null,

              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "user_id",
            }
          )

      if (error) {
        console.error(
          error
        )

        setErrorMessage(
          "No pudimos guardar el CUIT o DNI."
        )

        setSaving(false)

        return
      }

      setTaxId(
        normalized
      )

      setSaving(false)
      setSaved(true)

      window.setTimeout(
        () => {
          setSaved(false)
        },
        1800
      )
    }

  return (
    <section className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
          <IdCard className="h-5 w-5" />
        </div>

        <div>

          <p className="text-sm font-semibold text-[#0A9396]">
            Facturación
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            CUIT o DNI
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Guardalo para tenerlo disponible cuando necesites emitir una factura.
          </p>

        </div>

      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">

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
          placeholder="Ej. 20123456789"
          className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
        />

        <button
          type="button"
          onClick={
            handleSave
          }
          disabled={
            saving
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50"
        >

          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : null}

          {saving
            ? "Guardando..."
            : saved
              ? "Guardado"
              : "Guardar"}

        </button>

      </div>

      {errorMessage && (
        <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
          {
            errorMessage
          }
        </p>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Podés escribirlo con o sin guiones. Se guarda solo el número.
      </p>

    </section>
  )
}