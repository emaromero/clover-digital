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

      /*
       * Primero borramos las relaciones
       * actuales.
       */
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

      /*
       * Volvemos a guardar la selección.
       */
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

      /*
       * productions.user_id queda solamente
       * como referencia principal legacy.
       *
       * Los accesos reales dependen de
       * production_users.
       */
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
    <section className="rounded-3xl border border-gray-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] md:p-8">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A9396]/10 text-[#0A9396]">
          <Users className="h-5 w-5" />
        </div>

        <div>

          <p className="text-sm font-semibold text-[#0A9396]">
            Acceso
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            Clientes con acceso
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Todas las personas agregadas acá ven la misma producción y los mismos archivos.
          </p>

        </div>

      </div>

      {pendingClientEmail &&
        selectedUserIds.length ===
          0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">

          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Cliente pendiente de registro
          </p>

          <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/80">
            {pendingClientName ||
              "Sin nombre"}{" "}
            ·{" "}
            {
              pendingClientEmail
            }
          </p>

        </div>
      )}

      <div className="mt-6 space-y-3">

        {selectedClients.length ===
        0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500 dark:border-white/10">
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
                className="flex items-center gap-4 rounded-2xl border border-gray-200 p-4 dark:border-white/10"
              >

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0A9396]/10 text-sm font-bold text-[#0A9396]">
                  {(client.full_name ||
                    client.email ||
                    "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {client.full_name ||
                        "Sin nombre"}
                    </p>

                    {index ===
                      0 && (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-500 dark:bg-white/10 dark:text-gray-300">
                        Principal
                      </span>
                    )}

                  </div>

                  <p className="truncate text-sm text-gray-500">
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
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
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
        <div className="mt-6 border-t border-gray-100 pt-6 dark:border-white/10">

          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Agregar cliente
          </label>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">

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
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0A9396] dark:border-white/15 dark:bg-[#001219]"
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
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0A9396]/30 px-4 py-3 text-sm font-semibold text-[#0A9396] transition hover:bg-[#0A9396]/5 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />

              Agregar
            </button>

          </div>

        </div>
      )}

      {errorMessage && (
        <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
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
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:opacity-50"
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