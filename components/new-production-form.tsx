"use client"

import {
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  useRouter,
} from "next/navigation"

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  Filter,
  Loader2,
  Mail,
  Save,
  Search,
  Tag,
  UserRound,
  UserPlus,
  Users,
  X,
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

interface Client {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  office_id: string | null
  office_name: string | null
  tag_ids: string[]
}

interface Props {
  clients: Client[]
  offices: Office[]
  clientTags: TagItem[]
  productionTags: TagItem[]
}

const SERVICES = [
  "Fotos HDR",
  "Video horizontal",
  "Video vertical",
  "Reel hablado",
  "Drone",
  "Fotos con logo",
]

type ClientMode =
  | "registered"
  | "pending"

export default function NewProductionForm({
  clients,
  offices,
  clientTags,
  productionTags,
}: Props) {
  const router =
    useRouter()

  const [
    clientMode,
    setClientMode,
  ] =
    useState<ClientMode>(
      "registered"
    )

  const [
    selectedClientIds,
    setSelectedClientIds,
  ] =
    useState<string[]>(
      []
    )

  const [
    clientSearch,
    setClientSearch,
  ] =
    useState("")

  const [
    officeFilter,
    setOfficeFilter,
  ] =
    useState("all")

  const [
    clientTagFilter,
    setClientTagFilter,
  ] =
    useState("all")

  const [
    selectedProductionTagIds,
    setSelectedProductionTagIds,
  ] =
    useState<string[]>(
      []
    )

  const [
    pendingClientName,
    setPendingClientName,
  ] =
    useState("")

  const [
    pendingClientEmail,
    setPendingClientEmail,
  ] =
    useState("")

  const [
    propertyName,
    setPropertyName,
  ] =
    useState("")

  const [
    propertyAddress,
    setPropertyAddress,
  ] =
    useState("")

  const [
    productionDate,
    setProductionDate,
  ] =
    useState("")

  const [
    status,
    setStatus,
  ] =
    useState(
      "confirmed"
    )

  const [
    services,
    setServices,
  ] =
    useState<string[]>(
      []
    )

  const [
    totalAmount,
    setTotalAmount,
  ] =
    useState("")

  const [
    estimatedDelivery,
    setEstimatedDelivery,
  ] =
    useState("")

  const [
    notes,
    setNotes,
  ] =
    useState("")

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

  const hasClientFilter =
    clientSearch
      .trim()
      .length >
      0 ||
    officeFilter !==
      "all" ||
    clientTagFilter !==
      "all"

  const selectedClients =
    useMemo(
      () =>
        selectedClientIds
          .map(
            (id) =>
              clients.find(
                (client) =>
                  client.id ===
                  id
              )
          )
          .filter(
            Boolean
          ) as Client[],
      [
        clients,
        selectedClientIds,
      ]
    )

  const filteredClients =
    useMemo(
      () => {
        if (
          !hasClientFilter
        ) {
          return []
        }

        const search =
          clientSearch
            .trim()
            .toLowerCase()

        return clients.filter(
          (client) => {
            const matchesOffice =
              officeFilter ===
                "all" ||
              client.office_id ===
                officeFilter

            const matchesTag =
              clientTagFilter ===
                "all" ||
              client.tag_ids.includes(
                clientTagFilter
              )

            const text =
              [
                client.full_name ||
                  "",
                client.email ||
                  "",
                client.office_name ||
                  "",
              ]
                .join(" ")
                .toLowerCase()

            const matchesSearch =
              !search ||
              text.includes(
                search
              )

            return (
              matchesOffice &&
              matchesTag &&
              matchesSearch
            )
          }
        )
      },
      [
        clients,
        clientSearch,
        officeFilter,
        clientTagFilter,
        hasClientFilter,
      ]
    )

  const toggleClient = (
    clientId: string
  ) => {
    setSelectedClientIds(
      (current) =>
        current.includes(
          clientId
        )
          ? current.filter(
              (id) =>
                id !==
                clientId
            )
          : [
              ...current,
              clientId,
            ]
    )
  }

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
                item !==
                service
            )
          : [
              ...current,
              service,
            ]
    )
  }

  const toggleProductionTag = (
    tagId: string
  ) => {
    setSelectedProductionTagIds(
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
      event:
        React.FormEvent
    ) => {
      event.preventDefault()

      setMessage("")

      if (
        clientMode ===
          "registered" &&
        selectedClientIds.length ===
          0
      ) {
        setMessage(
          "Elegí al menos un cliente registrado."
        )

        return
      }

      if (
        clientMode ===
        "pending"
      ) {
        if (
          !pendingClientName.trim()
        ) {
          setMessage(
            "Ingresá el nombre del cliente."
          )

          return
        }

        if (
          !pendingClientEmail.trim()
        ) {
          setMessage(
            "Ingresá el email del cliente."
          )

          return
        }

        const validEmail =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            pendingClientEmail.trim()
          )

        if (!validEmail) {
          setMessage(
            "Ingresá un email válido."
          )

          return
        }
      }

      if (
        !propertyName.trim()
      ) {
        setMessage(
          "Ingresá el nombre de la propiedad."
        )

        return
      }

      setLoading(true)

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

      let finalUserId:
        | string
        | null = null

      let finalClientName:
        | string
        | null = null

      let finalClientEmail:
        | string
        | null = null

      if (
        clientMode ===
        "registered"
      ) {
        finalUserId =
          selectedClientIds[0]

        const primaryClient =
          clients.find(
            (client) =>
              client.id ===
              finalUserId
          )

        finalClientName =
          primaryClient?.full_name ||
          null

        finalClientEmail =
          primaryClient?.email ||
          null
      } else {
        finalClientName =
          pendingClientName
            .trim()

        finalClientEmail =
          pendingClientEmail
            .trim()
            .toLowerCase()
      }

      let deliveredAt:
        | string
        | null = null

      let availableUntil:
        | string
        | null = null

      if (
        status ===
        "delivered"
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
        data:
          createdProduction,
        error:
          productionError,
      } =
        await supabase
          .from(
            "productions"
          )
          .insert({
            user_id:
              finalUserId,

            client_name:
              finalClientName,

            client_email:
              finalClientEmail,

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
          .select("id")
          .single()

      if (
        productionError ||
        !createdProduction
      ) {
        console.error(
          productionError
        )

        setMessage(
          "No pudimos crear la producción."
        )

        setLoading(false)

        return
      }

      if (
        clientMode ===
          "registered"
      ) {
        const {
          error:
            membershipError,
        } =
          await supabase
            .from(
              "production_users"
            )
            .upsert(
              selectedClientIds.map(
                (userId) => ({
                  production_id:
                    createdProduction.id,

                  user_id:
                    userId,
                })
              ),
              {
                onConflict:
                  "production_id,user_id",
              }
            )

        if (
          membershipError
        ) {
          console.error(
            membershipError
          )

          setMessage(
            "La producción se creó, pero no pudimos vincular a todos los clientes."
          )

          setLoading(false)

          return
        }
      }

      if (
        selectedProductionTagIds.length >
        0
      ) {
        const {
          error:
            tagsError,
        } =
          await supabase
            .from(
              "production_tags"
            )
            .insert(
              selectedProductionTagIds.map(
                (tagId) => ({
                  production_id:
                    createdProduction.id,

                  tag_id:
                    tagId,
                })
              )
            )

        if (tagsError) {
          console.error(
            tagsError
          )

          setMessage(
            "La producción se creó, pero no pudimos guardar sus tags."
          )

          setLoading(false)

          return
        }
      }

      router.push(
        `/admin/producciones/${createdProduction.id}`
      )

      router.refresh()
    }

  return (
    <main className="min-h-screen bg-[#f5fafa] dark:bg-[#001219]">

      <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">

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
            Nueva producción
          </h1>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Creá una producción para uno o varios clientes registrados.
          </p>

        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-8 space-y-8 rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8"
        >

          {/* TIPO CLIENTE */}
          <div>

            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Cliente
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setClientMode(
                    "registered"
                  )
                }
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  clientMode ===
                  "registered"
                    ? "border-[#0A9396] bg-[#0A9396]/10"
                    : "border-gray-200 dark:border-white/10"
                }`}
              >
                <Users className="h-5 w-5 text-[#0A9396]" />

                <div>

                  <p className="font-semibold text-gray-900 dark:text-white">
                    Cliente registrado
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Uno o varios usuarios.
                  </p>

                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setClientMode(
                    "pending"
                  )
                }
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  clientMode ===
                  "pending"
                    ? "border-[#0A9396] bg-[#0A9396]/10"
                    : "border-gray-200 dark:border-white/10"
                }`}
              >
                <UserPlus className="h-5 w-5 text-[#0A9396]" />

                <div>

                  <p className="font-semibold text-gray-900 dark:text-white">
                    Cliente sin cuenta
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Se vinculará cuando se registre.
                  </p>

                </div>
              </button>

            </div>

          </div>

          {/* CLIENTE REGISTRADO */}
          {clientMode ===
            "registered" && (
            <div>

              <div className="flex flex-wrap items-end justify-between gap-4">

                <div>

                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Clientes con acceso
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Buscá el cliente que querés asociar.
                  </p>

                </div>

                {selectedClientIds.length >
                  0 && (
                  <span className="rounded-full bg-[#0A9396]/10 px-3 py-1 text-xs font-semibold text-[#0A9396]">
                    {
                      selectedClientIds.length
                    }{" "}
                    seleccionados
                  </span>
                )}

              </div>

              {/* SELECCIONADOS */}
              {selectedClients.length >
                0 && (
                <div className="mt-4 rounded-2xl border border-[#0A9396]/20 bg-[#0A9396]/5 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0A9396]">
                    Seleccionados
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {selectedClients.map(
                      (
                        client,
                        index
                      ) => (
                        <button
                          key={
                            client.id
                          }
                          type="button"
                          onClick={() =>
                            toggleClient(
                              client.id
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm dark:bg-[#06222c] dark:text-gray-200"
                        >

                          {client.avatar_url ? (
                            <img
                              src={
                                client.avatar_url
                              }
                              alt=""
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <UserRound className="h-4 w-4 text-gray-400" />
                          )}

                          {index ===
                            0 && (
                            <span className="text-[#0A9396]">
                              Principal ·
                            </span>
                          )}

                          {client.full_name ||
                            client.email ||
                            "Cliente"}

                          <X className="h-3.5 w-3.5" />

                        </button>
                      )
                    )}

                  </div>

                </div>
              )}

              {/* BUSCADOR */}
              <div className="mt-5 rounded-2xl border border-gray-200 p-4 dark:border-white/10">

                <div className="flex items-center gap-2">

                  <Filter className="h-4 w-4 text-[#0A9396]" />

                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Buscar y filtrar
                  </p>

                </div>

                <div className="mt-4 grid gap-3">

                  <div className="relative">

                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="search"
                      value={
                        clientSearch
                      }
                      onChange={(
                        event
                      ) =>
                        setClientSearch(
                          event.target.value
                        )
                      }
                      placeholder="Nombre, email u oficina"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
                    />

                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">

                    <div className="relative">

                      <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                      <select
                        value={
                          officeFilter
                        }
                        onChange={(
                          event
                        ) =>
                          setOfficeFilter(
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
                      >
                        <option value="all">
                          Todas las oficinas
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

                    <div className="relative">

                      <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                      <select
                        value={
                          clientTagFilter
                        }
                        onChange={(
                          event
                        ) =>
                          setClientTagFilter(
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
                      >
                        <option value="all">
                          Todos los tags
                        </option>

                        {clientTags.map(
                          (tag) => (
                            <option
                              key={
                                tag.id
                              }
                              value={
                                tag.id
                              }
                            >
                              {
                                tag.name
                              }
                            </option>
                          )
                        )}
                      </select>

                    </div>

                  </div>

                </div>

                {!hasClientFilter ? (
                  <p className="mt-4 text-sm text-gray-400">
                    Buscá por nombre o email, o seleccioná una oficina o tag para ver clientes.
                  </p>
                ) : (
                  <div className="mt-3 flex items-center justify-between gap-3">

                    <p className="text-xs text-gray-400">
                      {
                        filteredClients.length
                      }{" "}
                      {filteredClients.length ===
                      1
                        ? "resultado"
                        : "resultados"}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setClientSearch(
                          ""
                        )

                        setOfficeFilter(
                          "all"
                        )

                        setClientTagFilter(
                          "all"
                        )
                      }}
                      className="text-xs font-semibold text-[#0A9396] hover:underline"
                    >
                      Limpiar filtros
                    </button>

                  </div>
                )}

              </div>

              {/* RESULTADOS */}
              {hasClientFilter && (
                <>
                  {filteredClients.length ===
                  0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-white/10">

                      <Search className="mx-auto h-6 w-6 text-gray-300" />

                      <p className="mt-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        No encontramos clientes
                      </p>

                    </div>
                  ) : (
                    <div className="mt-4 grid max-h-[520px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">

                      {filteredClients.map(
                        (client) => {
                          const selected =
                            selectedClientIds.includes(
                              client.id
                            )

                          const index =
                            selectedClientIds.indexOf(
                              client.id
                            )

                          return (
                            <button
                              key={
                                client.id
                              }
                              type="button"
                              onClick={() =>
                                toggleClient(
                                  client.id
                                )
                              }
                              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                                selected
                                  ? "border-[#0A9396] bg-[#0A9396]/10"
                                  : "border-gray-200 hover:border-[#0A9396]/40 dark:border-white/10"
                              }`}
                            >

                              <div className="relative shrink-0">

                                {client.avatar_url ? (
                                  <img
                                    src={
                                      client.avatar_url
                                    }
                                    alt=""
                                    className="h-11 w-11 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-white/10">
                                    <UserRound className="h-5 w-5" />
                                  </div>
                                )}

                                {selected && (
                                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0A9396] text-white ring-2 ring-white dark:ring-[#06222c]">
                                    <Check className="h-3 w-3" />
                                  </div>
                                )}

                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-center gap-2">

                                  <p className="truncate font-semibold text-gray-900 dark:text-white">
                                    {client.full_name ||
                                      "Sin nombre"}
                                  </p>

                                  {index ===
                                    0 && (
                                    <span className="shrink-0 rounded-full bg-[#0A9396]/10 px-2 py-0.5 text-[10px] font-semibold text-[#0A9396]">
                                      Principal
                                    </span>
                                  )}

                                </div>

                                <p className="mt-1 truncate text-xs text-gray-500">
                                  {client.email ||
                                    "Sin email"}
                                </p>

                                {client.office_name && (
                                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                    <Building2 className="h-3 w-3" />

                                    {
                                      client.office_name
                                    }
                                  </p>
                                )}

                              </div>

                            </button>
                          )
                        }
                      )}

                    </div>
                  )}
                </>
              )}

            </div>
          )}

          {/* CLIENTE SIN CUENTA */}
          {clientMode ===
            "pending" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">

              <div className="flex items-start gap-3">

                <Mail className="mt-1 h-5 w-5 text-amber-600" />

                <div>

                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    Cliente pendiente de registro
                  </p>

                  <p className="mt-1 text-sm text-amber-800/70 dark:text-amber-200/70">
                    Cuando se registre con este email, la producción se vinculará automáticamente.
                  </p>

                </div>

              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Nombre y apellido
                  </label>

                  <input
                    type="text"
                    value={
                      pendingClientName
                    }
                    onChange={(
                      event
                    ) =>
                      setPendingClientName(
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
                  />

                </div>

                <div>

                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email
                  </label>

                  <input
                    type="email"
                    value={
                      pendingClientEmail
                    }
                    onChange={(
                      event
                    ) =>
                      setPendingClientEmail(
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
                  />

                </div>

              </div>

            </div>
          )}

          {/* PROPIEDAD */}
          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Nombre de la propiedad
              </label>

              <input
                type="text"
                required
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
                placeholder="Ej. Bucarelli 3354"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
              />

            </div>

            <div>

              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
                placeholder="Bucarelli 3354, CABA"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
              />

            </div>

          </div>

          {/* FECHA Y ESTADO */}
          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Fecha y hora
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
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 dark:border-white/15 dark:bg-[#001219]"
                />

              </div>

            </div>

            <div>

              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
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

          {/* SERVICIOS */}
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
                      key={
                        service
                      }
                      type="button"
                      onClick={() =>
                        toggleService(
                          service
                        )
                      }
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                        active
                          ? "border-[#0A9396] bg-[#0A9396]/10 text-[#0A9396]"
                          : "border-gray-200 text-gray-600 dark:border-white/10 dark:text-gray-300"
                      }`}
                    >
                      {
                        service
                      }
                    </button>
                  )
                }
              )}

            </div>

          </div>

          {/* TAGS PRODUCCIÓN */}
          <div>

            <div className="flex items-center gap-2">

              <Tag className="h-4 w-4 text-[#0A9396]" />

              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Tags internos de la producción
              </p>

            </div>

            <p className="mt-1 text-xs text-gray-500">
              Por ejemplo: Entrega urgente, Pendiente de pago o Requiere factura.
            </p>

            {productionTags.length ===
            0 ? (
              <p className="mt-3 text-sm text-gray-400">
                Todavía no creaste tags de producciones.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">

                {productionTags.map(
                  (tag) => {
                    const active =
                      selectedProductionTagIds.includes(
                        tag.id
                      )

                    return (
                      <button
                        key={
                          tag.id
                        }
                        type="button"
                        onClick={() =>
                          toggleProductionTag(
                            tag.id
                          )
                        }
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
                          active
                            ? "border-[#0A9396] bg-[#0A9396]/10 text-[#0A9396]"
                            : "border-gray-200 text-gray-500 dark:border-white/10 dark:text-gray-300"
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

          {/* VALOR */}
          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
                placeholder="90000"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
              />

            </div>

            <div>

              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
              />

            </div>

          </div>

          {/* NOTAS */}
          <div>

            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Notas internas
            </label>

            <textarea
              rows={5}
              value={
                notes
              }
              onChange={(
                event
              ) =>
                setNotes(
                  event.target.value
                )
              }
              className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-white/15 dark:bg-[#001219]"
            />

          </div>

          {message && (
            <p className="text-sm font-medium text-red-600">
              {
                message
              }
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 dark:border-white/10 sm:flex-row sm:justify-between">

            <Link
              href="/admin/configuracion"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0A9396]/30 px-4 py-3 text-sm font-semibold text-[#0A9396]"
            >
              <Building2 className="h-4 w-4" />

              Administrar oficinas y tags
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row">

              <Link
                href="/admin/producciones"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 dark:border-white/10 dark:text-gray-300"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={
                  loading
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />

                    Crear producción
                  </>
                )}

              </button>

            </div>

          </div>

        </form>

      </div>

    </main>
  )
}