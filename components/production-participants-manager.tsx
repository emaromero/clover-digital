"use client"

import {
  Check,
  Loader2,
  Plus,
  Users,
  X,
} from "lucide-react"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

interface Client {
  id: string
  full_name: string | null
  email: string | null
}

interface Props {
  productionId: string
  clients: Client[]
  initialUserIds: string[]
  initialPrimaryUserId: string | null
  pendingClientName: string | null
  pendingClientEmail: string | null
}

export default function ProductionParticipantsManager({
  productionId,
  clients,
  initialUserIds,
  initialPrimaryUserId,
  pendingClientName,
  pendingClientEmail,
}: Props) {
  const router =
    useRouter()

  const [
    selectedUserIds,
    setSelectedUserIds,
  ] =
    useState<string[]>(
      initialUserIds
    )

  const [
    clientToAdd,
    setClientToAdd,
  ] =
    useState("")

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

  const selectedClients =
    useMemo(
      () =>
        clients.filter(
          (client) =>
            selectedUserIds.includes(
              client.id
            )
        ),
      [
        clients,
        selectedUserIds,
      ]
    )

  const availableClients =
    useMemo(
      () =>
        clients.filter(
          (client) =>
            !selectedUserIds.includes(
              client.id
            )
        ),
      [
        clients,
        selectedUserIds,
      ]
    )

  useEffect(
    () => {
      if (
        availableClients.length ===
        0
      ) {
        setClientToAdd("")
        return
      }

      const stillAvailable =
        availableClients.some(
          (client) =>
            client.id ===
            clientToAdd
        )

      if (
        !stillAvailable
      ) {
        setClientToAdd(
          availableClients[0].id
        )
      }
    },
    [
      availableClients,
      clientToAdd,
    ]
  )

  const addClient =
    () => {
      if (
        !clientToAdd ||
        selectedUserIds.includes(
          clientToAdd
        )
      ) {
        return
      }

      setSelectedUserIds(
        (current) => [
          ...current,
          clientToAdd,
        ]
      )

      setSaved(false)
    }

  const removeClient =
    (
      userId: string
    ) => {
      setSelectedUserIds(
        (current) =>
          current.filter(
            (id) =>
              id !==
              userId
          )
      )

      setSaved(false)
    }

  const save =
    async () => {
      setSaving(true)
      setSaved(false)
      setErrorMessage("")

      const supabase =
        createClient()

      const {
        error: deleteError,
      } =
        await supabase
          .from(
            "production_users"
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

        setErrorMessage(
          "No pudimos actualizar los participantes."
        )

        setSaving(false)

        return
      }

      if (
        selectedUserIds.length >
        0
      ) {
        const {
          error: insertError,
        } =
          await supabase
            .from(
              "production_users"
            )
            .insert(
              selectedUserIds.map(
                (userId) => ({
                  production_id:
                    productionId,

                  user_id:
                    userId,
                })
              )
            )

        if (insertError) {
          console.error(
            insertError
          )

          setErrorMessage(
            "No pudimos guardar todos los participantes."
          )

          setSaving(false)

          return
        }
      }

      const primaryUserId =
        selectedUserIds[0] ||
        null

      const primaryClient =
        clients.find(
          (client) =>
            client.id ===
            primaryUserId
        )

      const hadPendingClient =
        !initialPrimaryUserId &&
        Boolean(
          pendingClientEmail
        )

      const updateData =
        primaryUserId
          ? {
              user_id:
                primaryUserId,

              client_name:
                primaryClient
                  ?.full_name ||
                null,

              client_email:
                primaryClient
                  ?.email ||
                null,

              updated_at:
                new Date().toISOString(),
            }
          : hadPendingClient
            ? {
                user_id:
                  null,

                client_name:
                  pendingClientName,

                client_email:
                  pendingClientEmail,

                updated_at:
                  new Date().toISOString(),
              }
            : {
                user_id:
                  null,

                client_name:
                  null,

                client_email:
                  null,

                updated_at:
                  new Date().toISOString(),
              }

      const {
        error: productionError,
      } =
        await supabase
          .from(
            "productions"
          )
          .update(
            updateData
          )
          .eq(
            "id",
            productionId
          )

      if (productionError) {
        console.error(
          productionError
        )

        setErrorMessage(
          "Los participantes se guardaron, pero no pudimos actualizar el cliente principal."
        )

        setSaving(false)

        return
      }

      setSaving(false)
      setSaved(true)

      router.refresh()

      window.setTimeout(
        () => {
          setSaved(false)
        },
        1800
      )
    }

  return (
    <section className="rounded-3xl border border-gray-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#06222c] sm:p-6 md:p-8">

      <div className="flex items-start gap-3 sm:gap-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A9396]/10 text-[#0A9396] sm:h-11 sm:w-11 sm:rounded-2xl">
          <Users className="h-5 w-5" />
        </div>

        <div>

          <p className="text-xs font-semibold text-[#0A9396] sm:text-sm">
            Acceso
          </p>

          <h2 className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white sm:mt-1 sm:text-xl">
            Clientes con acceso
          </h2>

          <p className="mt-1.5 text-xs leading-5 text-gray-500 dark:text-gray-400 sm:mt-2 sm:text-sm">
            Todas las personas agregadas ven la misma producción y los mismos archivos.
          </p>

        </div>

      </div>

      {pendingClientEmail &&
        selectedUserIds.length ===
          0 && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-500/20 dark:bg-amber-500/10 sm:mt-6 sm:p-4">

          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 sm:text-sm">
            Cliente pendiente de registro
          </p>

          <p className="mt-1 break-words text-xs text-amber-700/80 dark:text-amber-300/80 sm:text-sm">
            {pendingClientName ||
              "Sin nombre"}{" "}
            ·{" "}
            {
              pendingClientEmail
            }
          </p>

        </div>
      )}

      <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-3">

        {selectedClients.length ===
        0 ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 sm:rounded-2xl sm:border sm:border-dashed sm:border-gray-200 sm:p-5 sm:text-sm dark:sm:border-white/10">
            Todavía no hay usuarios registrados con acceso.
          </div>
        ) : (
          selectedClients.map(
            (
              client,
              index
            ) => (
              <div
                key={
                  client.id
                }
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-white/10 sm:gap-4 sm:rounded-2xl sm:p-4"
              >

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/10 text-xs font-bold text-[#0A9396] sm:h-9 sm:w-9 sm:text-sm">
                  {(client.full_name ||
                    client.email ||
                    "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">

                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                      {client.full_name ||
                        "Sin nombre"}
                    </p>

                    {index ===
                      0 && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-white/10 dark:text-gray-300 sm:py-1 sm:text-[11px]">
                        Principal
                      </span>
                    )}

                  </div>

                  <p className="truncate text-xs text-gray-500 sm:text-sm">
                    {
                      client.email
                    }
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeClient(
                      client.id
                    )
                  }
                  aria-label={`Quitar a ${client.full_name || client.email}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10 sm:h-9 sm:w-9 sm:rounded-xl"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>
            )
          )
        )}

      </div>

      {availableClients.length >
        0 && (
        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-white/10 sm:mt-6 sm:pt-6">

          <label className="text-xs font-medium text-gray-700 dark:text-gray-200 sm:text-sm">
            Agregar cliente
          </label>

          <div className="mt-2 flex flex-col gap-2.5 sm:flex-row sm:gap-3">

            <select
              value={
                clientToAdd
              }
              onChange={(
                event
              ) =>
                setClientToAdd(
                  event.target.value
                )
              }
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219] sm:px-4 sm:py-3"
            >

              {availableClients.map(
                (
                  client
                ) => (
                  <option
                    key={
                      client.id
                    }
                    value={
                      client.id
                    }
                  >
                    {client.full_name ||
                      "Sin nombre"}{" "}
                    —{" "}
                    {client.email ||
                      "Sin email"}
                  </option>
                )
              )}

            </select>

            <button
              type="button"
              onClick={
                addClient
              }
              disabled={
                !clientToAdd
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0A9396]/30 px-4 py-2.5 text-sm font-semibold text-[#0A9396] transition hover:bg-[#0A9396]/5 disabled:opacity-50 sm:py-3"
            >
              <Plus className="h-4 w-4" />

              Agregar
            </button>

          </div>

        </div>
      )}

      {errorMessage && (
        <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400 sm:mt-4 sm:text-sm">
          {
            errorMessage
          }
        </p>
      )}

      <button
        type="button"
        disabled={
          saving
        }
        onClick={
          save
        }
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50 sm:mt-6 sm:px-5 sm:py-3"
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
            : "Guardar accesos"}

      </button>

    </section>
  )
}