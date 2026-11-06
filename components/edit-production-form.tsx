"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  FileVideo2,
  FolderOpen,
  Link2,
  Loader2,
  Plus,
  Save,
  Trash2,
  UserRound,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Client {
  id: string
  full_name: string | null
  email: string | null
}

interface Production {
  id: string
  user_id: string | null
  client_name: string | null
  client_email: string | null
  property_name: string
  property_address: string | null
  production_date: string | null
  status: string
  services: string[]
  total_amount: number | null
  estimated_delivery_at: string | null
  delivered_at: string | null
  available_until: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface ProductionFile {
  id: string
  production_id: string
  label: string
  file_type: string
  url: string
  expires_at: string | null
  created_at: string
}

interface Props {
  production: Production
  clients: Client[]
  initialFiles: ProductionFile[]
}

const SERVICES = [
  "Fotos HDR",
  "Video horizontal",
  "Video vertical",
  "Reel hablado",
  "Drone",
  "Fotos con logo",
]

const FILE_TYPES = [
  {
    value: "full_delivery",
    label: "Entrega completa / Google Drive",
  },
  {
    value: "wetransfer",
    label: "WeTransfer",
  },
  {
    value: "photos",
    label: "Fotos HDR",
  },
  {
    value: "branded_photos",
    label: "Fotos con logo",
  },
  {
    value: "horizontal_video",
    label: "Video horizontal",
  },
  {
    value: "vertical_video",
    label: "Video vertical",
  },
  {
    value: "talking_reel",
    label: "Reel hablado",
  },
  {
    value: "drone",
    label: "Drone",
  },
  {
    value: "other",
    label: "Otro",
  },
]

const toLocalInput = (
  value: string | null
) => {
  if (!value) return ""

  const date =
    new Date(value)

  const offset =
    date.getTimezoneOffset() *
    60000

  return new Date(
    date.getTime() - offset
  )
    .toISOString()
    .slice(0, 16)
}

const formatDate = (
  value: string | null
) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(new Date(value))
}

const formatDateTime = (
  value: string | null
) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value))
}

const getDefaultWeTransferExpiry =
  () => {
    const now =
      new Date()

    now.setHours(
      now.getHours() + 71
    )

    now.setMinutes(
      now.getMinutes() + 40
    )

    const offset =
      now.getTimezoneOffset() *
      60000

    return new Date(
      now.getTime() - offset
    )
      .toISOString()
      .slice(0, 16)
  }

export default function EditProductionForm({
  production,
  clients,
  initialFiles,
}: Props) {
  const router =
    useRouter()

  const [
    clientId,
    setClientId,
  ] =
    useState(
      production.user_id ||
        ""
    )

  const [
    propertyName,
    setPropertyName,
  ] =
    useState(
      production.property_name
    )

  const [
    propertyAddress,
    setPropertyAddress,
  ] =
    useState(
      production.property_address ||
        ""
    )

  const [
    productionDate,
    setProductionDate,
  ] =
    useState(
      toLocalInput(
        production.production_date
      )
    )

  const [
    status,
    setStatus,
  ] =
    useState(
      production.status
    )

  const [
    services,
    setServices,
  ] =
    useState<string[]>(
      production.services ||
        []
    )

  const [
    totalAmount,
    setTotalAmount,
  ] =
    useState(
      production.total_amount?.toString() ||
        ""
    )

  const [
    estimatedDelivery,
    setEstimatedDelivery,
  ] =
    useState(
      toLocalInput(
        production.estimated_delivery_at
      )
    )

  const [
    notes,
    setNotes,
  ] =
    useState(
      production.notes ||
        ""
    )

  const [
    files,
    setFiles,
  ] =
    useState<
      ProductionFile[]
    >(
      initialFiles
    )

  const [
    fileType,
    setFileType,
  ] =
    useState(
      "full_delivery"
    )

  const [
    fileLabel,
    setFileLabel,
  ] =
    useState("")

  const [
    fileUrl,
    setFileUrl,
  ] =
    useState("")

  const [
    fileExpiresAt,
    setFileExpiresAt,
  ] =
    useState("")

  const [
    saving,
    setSaving,
  ] =
    useState(false)

  const [
    addingFile,
    setAddingFile,
  ] =
    useState(false)

  const [
    message,
    setMessage,
  ] =
    useState("")

  const [
    fileMessage,
    setFileMessage,
  ] =
    useState("")

  const isPendingClient =
    !production.user_id &&
    Boolean(
      production.client_email
    )

  const toggleService = (
    service: string
  ) => {
    setServices(
      (current) =>
        current.includes(
          service
        )
          ? current.filter(
              (item) =>
                item !== service
            )
          : [
              ...current,
              service,
            ]
    )
  }

  const handleFileTypeChange = (
    nextType: string
  ) => {
    setFileType(
      nextType
    )

    if (
      nextType ===
      "wetransfer"
    ) {
      setFileExpiresAt(
        getDefaultWeTransferExpiry()
      )
    } else {
      setFileExpiresAt("")
    }
  }

  const handleSubmit =
    async (
      event: React.FormEvent
    ) => {
      event.preventDefault()

      if (
        !propertyName.trim()
      ) {
        setMessage(
          "Ingresá el nombre de la propiedad."
        )
        return
      }

      setSaving(true)
      setMessage("")

      const supabase =
        createClient()

      const productionDateISO =
        productionDate
          ? new Date(
              productionDate
            ).toISOString()
          : null

      const estimatedDeliveryISO =
        estimatedDelivery
          ? new Date(
              estimatedDelivery
            ).toISOString()
          : null

      const selectedClient =
        clientId
          ? clients.find(
              (client) =>
                client.id === clientId
            )
          : null

      let deliveredAt =
        production.delivered_at

      let availableUntil =
        production.available_until

      if (
        status ===
          "delivered" &&
        !deliveredAt
      ) {
        const deliveredDate =
          new Date()

        const expiryDate =
          new Date(
            deliveredDate
          )

        expiryDate.setDate(
          expiryDate.getDate() +
            90
        )

        deliveredAt =
          deliveredDate.toISOString()

        availableUntil =
          expiryDate.toISOString()
      }

      const {
        error,
      } =
        await supabase
          .from(
            "productions"
          )
          .update({
            user_id:
              clientId ||
              null,

            client_name:
              selectedClient?.full_name ||
              production.client_name,

            client_email:
              selectedClient?.email ||
              production.client_email,

            property_name:
              propertyName.trim(),

            property_address:
              propertyAddress.trim() ||
              null,

            production_date:
              productionDateISO,

            status,

            services,

            total_amount:
              totalAmount
                ? Number(
                    totalAmount
                  )
                : null,

            estimated_delivery_at:
              estimatedDeliveryISO,

            delivered_at:
              deliveredAt,

            available_until:
              availableUntil,

            notes:
              notes.trim() ||
              null,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            production.id
          )

      if (error) {
        console.error(
          error
        )

        setMessage(
          "No pudimos guardar los cambios."
        )

        setSaving(false)
        return
      }

      setMessage(
        "Cambios guardados correctamente."
      )

      setSaving(false)

      router.refresh()
    }

  const handleAddFile =
    async (
      event: React.FormEvent
    ) => {
      event.preventDefault()

      if (
        !fileUrl.trim()
      ) {
        setFileMessage(
          "Ingresá el enlace."
        )
        return
      }

      let parsedUrl: URL

      try {
        parsedUrl =
          new URL(
            fileUrl.trim()
          )
      } catch {
        setFileMessage(
          "Ingresá un enlace válido."
        )
        return
      }

      if (
        parsedUrl.protocol !==
          "https:" &&
        parsedUrl.protocol !==
          "http:"
      ) {
        setFileMessage(
          "El enlace debe comenzar con http:// o https://"
        )
        return
      }

      if (
        fileType ===
          "wetransfer" &&
        !fileExpiresAt
      ) {
        setFileMessage(
          "Indicá cuándo vence el WeTransfer."
        )
        return
      }

      setAddingFile(true)
      setFileMessage("")

      const defaultLabel =
        FILE_TYPES.find(
          (item) =>
            item.value ===
            fileType
        )?.label ||
        "Material"

      const expiresAtISO =
        fileType ===
          "wetransfer" &&
        fileExpiresAt
          ? new Date(
              fileExpiresAt
            ).toISOString()
          : null

      const supabase =
        createClient()

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "production_files"
          )
          .insert({
            production_id:
              production.id,

            file_type:
              fileType,

            label:
              fileLabel.trim() ||
              defaultLabel,

            url:
              fileUrl.trim(),

            expires_at:
              expiresAtISO,
          })
          .select(`
            id,
            production_id,
            label,
            file_type,
            url,
            expires_at,
            created_at
          `)
          .single()

      if (
        error ||
        !data
      ) {
        console.error(
          error
        )

        setFileMessage(
          "No pudimos agregar el material."
        )

        setAddingFile(false)
        return
      }

      setFiles(
        (current) => [
          ...current,
          data,
        ]
      )

      setFileLabel("")
      setFileUrl("")
      setFileExpiresAt("")

      setFileMessage(
        "Material agregado correctamente."
      )

      setAddingFile(false)
    }

  const handleDeleteFile =
    async (
      fileId: string
    ) => {
      const confirmed =
        window.confirm(
          "¿Querés eliminar este enlace de la producción?"
        )

      if (!confirmed) {
        return
      }

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase
          .from(
            "production_files"
          )
          .delete()
          .eq(
            "id",
            fileId
          )

      if (error) {
        console.error(
          error
        )

        setFileMessage(
          "No pudimos eliminar el enlace."
        )

        return
      }

      setFiles(
        (current) =>
          current.filter(
            (file) =>
              file.id !== fileId
          )
      )

      setFileMessage(
        "Enlace eliminado."
      )
    }

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">

        <Link
          href="/admin/producciones"
          className="inline-flex items-center gap-2 text-sm text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a producciones
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold text-[#0A9396]">
            Clover Digital
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            {production.property_name}
          </h1>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Editá la producción y gestioná su material de entrega.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-8 space-y-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8"
        >

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Cliente
            </label>

            {isPendingClient ? (
              <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {production.client_name ||
                        "Cliente sin cuenta"}
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-600 dark:text-gray-300">
                      {production.client_email}
                    </p>

                    <div className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      Pendiente de registro
                    </div>

                    <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      Cuando esta persona se registre en Clover Digital con este mismo email, la producción se vinculará automáticamente a su cuenta.
                    </p>
                  </div>

                </div>
              </div>
            ) : (
              <select
                value={
                  clientId
                }
                onChange={(
                  event
                ) =>
                  setClientId(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              >
                <option value="">
                  Sin cliente vinculado
                </option>

                {clients.map(
                  (client) => (
                    <option
                      key={client.id}
                      value={client.id}
                    >
                      {client.full_name ||
                        "Sin nombre"}{" "}
                      —{" "}
                      {client.email}
                    </option>
                  )
                )}
              </select>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Nombre de la propiedad
              </label>

              <input
                type="text"
                value={
                  propertyName
                }
                onChange={(
                  event
                ) =>
                  setPropertyName(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Dirección completa
              </label>

              <input
                type="text"
                value={
                  propertyAddress
                }
                onChange={(
                  event
                ) =>
                  setPropertyAddress(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              />
            </div>

          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Fecha y hora de producción
              </label>

              <div className="relative mt-2">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="datetime-local"
                  value={
                    productionDate
                  }
                  onChange={(
                    event
                  ) =>
                    setProductionDate(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Estado
              </label>

              <select
                value={
                  status
                }
                onChange={(
                  event
                ) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              >
                <option value="confirmed">
                  Confirmada
                </option>
                <option value="completed">
                  Realizada
                </option>
                <option value="editing">
                  En edición
                </option>
                <option value="delivered">
                  Entregada
                </option>
                <option value="archived">
                  Archivada
                </option>
                <option value="cancelled">
                  Cancelada
                </option>
              </select>
            </div>

          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Servicios
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {SERVICES.map(
                (service) => {
                  const active =
                    services.includes(
                      service
                    )

                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() =>
                        toggleService(
                          service
                        )
                      }
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                        active
                          ? "border-[#0A9396] bg-[#0A9396]/10 text-[#0A9396]"
                          : "border-gray-200 text-gray-600 hover:border-[#0A9396]/40 dark:border-white/10 dark:text-gray-300"
                      }`}
                    >
                      {service}
                    </button>
                  )
                }
              )}

            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Valor total
              </label>

              <input
                type="number"
                min="0"
                value={
                  totalAmount
                }
                onChange={(
                  event
                ) =>
                  setTotalAmount(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Entrega estimada
              </label>

              <input
                type="datetime-local"
                value={
                  estimatedDelivery
                }
                onChange={(
                  event
                ) =>
                  setEstimatedDelivery(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
              />
            </div>

          </div>

          {production.delivered_at && (
            <div className="grid gap-4 rounded-2xl bg-emerald-50 p-5 dark:bg-emerald-500/10 md:grid-cols-2">
              <div>
                <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
                  Entregada
                </p>

                <p className="mt-1 font-semibold text-emerald-800 dark:text-emerald-300">
                  {formatDate(
                    production.delivered_at
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
                  Material disponible hasta
                </p>

                <p className="mt-1 font-semibold text-emerald-800 dark:text-emerald-300">
                  {formatDate(
                    production.available_until
                  )}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Notas internas
            </label>

            <textarea
              rows={5}
              value={notes}
              onChange={(
                event
              ) =>
                setNotes(
                  event.target.value
                )
              }
              className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes(
                  "correctamente"
                )
                  ? "text-[#0A9396]"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 dark:border-white/10 sm:flex-row sm:justify-end">

            <Link
              href="/admin/producciones"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Volver
            </Link>

            <button
              type="submit"
              disabled={
                saving
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </button>

          </div>

        </form>

        <section className="mt-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
              <FolderOpen className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#0A9396]">
                Entrega
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                Material de la producción
              </h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Agregá los enlaces que después estarán disponibles para el cliente.
              </p>
            </div>

          </div>

          <div className="mt-6 space-y-3">

            {files.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-white/10">
                Todavía no cargaste material.
              </div>
            ) : (
              files.map(
                (file) => {
                  const expired =
                    file.expires_at
                      ? new Date(
                          file.expires_at
                        ).getTime() <=
                        Date.now()
                      : false

                  return (
                    <div
                      key={file.id}
                      className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 dark:border-white/10 sm:flex-row sm:items-center"
                    >

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396]">
                        {file.file_type.includes(
                          "video"
                        ) ||
                        file.file_type ===
                          "talking_reel" ? (
                          <FileVideo2 className="h-5 w-5" />
                        ) : (
                          <Link2 className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-semibold text-gray-900 dark:text-white">
                            {file.label}
                          </p>

                          {file.expires_at && (
                            <span
                              className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                                expired
                                  ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                              }`}
                            >
                              {expired
                                ? "Vencido"
                                : `Vence ${formatDateTime(
                                    file.expires_at
                                  )}`}
                            </span>
                          )}

                        </div>

                        <p className="mt-1 truncate text-xs text-gray-400">
                          {file.url}
                        </p>

                      </div>

                      <div className="flex gap-2">

                        {!expired && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                          >
                            Abrir
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteFile(
                              file.id
                            )
                          }
                          className="inline-flex items-center justify-center rounded-xl border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
                          aria-label="Eliminar enlace"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>
                    </div>
                  )
                }
              )
            )}

          </div>

          <form
            onSubmit={
              handleAddFile
            }
            className="mt-6 rounded-2xl bg-gray-50 p-5 dark:bg-white/[0.03]"
          >

            <div className="grid gap-4 md:grid-cols-2">

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Tipo
                </label>

                <select
                  value={
                    fileType
                  }
                  onChange={(
                    event
                  ) =>
                    handleFileTypeChange(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
                >
                  {FILE_TYPES.map(
                    (type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Nombre visible
                </label>

                <input
                  type="text"
                  value={fileLabel}
                  onChange={(
                    event
                  ) =>
                    setFileLabel(
                      event.target.value
                    )
                  }
                  placeholder="Opcional"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
                />
              </div>

            </div>

            <div className="mt-4">

              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Enlace
              </label>

              <input
                type="url"
                required
                value={fileUrl}
                onChange={(
                  event
                ) =>
                  setFileUrl(
                    event.target.value
                  )
                }
                placeholder="https://drive.google.com/..."
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
              />

            </div>

            {fileType ===
              "wetransfer" && (
              <div className="mt-4">

                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Vencimiento de WeTransfer
                </label>

                <input
                  type="datetime-local"
                  value={fileExpiresAt}
                  onChange={(
                    event
                  ) =>
                    setFileExpiresAt(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
                />

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Clover propone automáticamente 71 h 40 min desde ahora. Podés corregirlo si el enlace ya fue creado antes.
                </p>

              </div>
            )}

            {fileMessage && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {fileMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={
                addingFile
              }
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white hover:bg-[#001219] disabled:opacity-60"
            >
              {addingFile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}

              Agregar material
            </button>

          </form>

        </section>
      </div>
    </main>
  )
}