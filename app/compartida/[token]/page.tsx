
import Link from "next/link"
import type { Metadata } from "next"

import {
  ArrowLeft,
  FolderOpen,
  LockKeyhole,
  Share2,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import SharedMaterialLink from "@/components/shared-material-link"

interface Props {
  params: Promise<{
    token: string
  }>
}

interface SharedFile {
  id: string
  label: string
  file_type: string
  url: string
}

interface SharedProduction {
  id: string
  property_name: string
  property_address: string | null
  files: SharedFile[]
}

function validExternalUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Te compartieron una producción",
    description:
      "Accedé al material fotográfico y audiovisual de una propiedad compartida a través de Clover Digital.",

    openGraph: {
      title: "Te compartieron una producción | Clover Digital",
      description:
        "Consultá fotografías y videos de propiedades compartidas de forma privada a través de Clover Digital.",
      type: "website",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Clover Digital | Producciones inmobiliarias",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: "Te compartieron una producción | Clover Digital",
      description:
        "Accedé al material audiovisual compartido.",
      images: ["/og-image.jpg"],
    },
  }
}
export default async function SharedProductionPage({
  params,
}: Props) {
  const { token } = await params
  const supabase = await createClient()

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!uuidPattern.test(token)) {
    return <Unavailable />
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const next = `/compartida/${token}`

    return (
      <PageShell>
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#06222c]">
          <LockKeyhole className="mx-auto h-10 w-10 text-[#0A9396]" />

          <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
            Te compartieron una producción
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            Iniciá sesión o creá una cuenta para consultar el material.
            Podés ingresar con Google o con tu correo electrónico.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/ingresar?next=${encodeURIComponent(next)}`}
              className="rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white"
            >
              Iniciar sesión
            </Link>

            <Link
              href={`/registro?next=${encodeURIComponent(next)}`}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#0e5c6e] dark:border-white/15 dark:text-teal-300"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </PageShell>
    )
  }

  const { data, error } = await supabase.rpc(
    "get_shared_production",
    { p_token: token }
  )

  if (error || !data) {
    const needsVerification =
      error?.message?.toLowerCase().includes("verificar")

    return (
      <Unavailable
        message={
          needsVerification
            ? "Tu correo todavía no está verificado. Confirmalo para poder consultar esta producción."
            : undefined
        }
      />
    )
  }

  const production = data as SharedProduction

  const files = (production.files || []).filter(
    (file) => validExternalUrl(file.url)
  )

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#0A9396]">
          <Share2 className="h-4 w-4" />
          Producción compartida
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#06222c] sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {production.property_name}
          </h1>

          {production.property_address && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
              {production.property_address}
            </p>
          )}

          <div className="mt-6 border-t border-gray-100 pt-6 dark:border-white/10">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-[#0A9396]" />

              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Material disponible
              </h2>
            </div>

            {files.length === 0 ? (
              <p className="mt-5 text-sm text-gray-500">
                No hay material disponible para consultar.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {files.map((file) => (
                  <SharedMaterialLink
                    key={file.id}
                    token={token}
                    fileId={file.id}
                    href={file.url}
                    label={file.label}
                  />
                ))}
              </div>
            )}
          </div>

          <p className="mt-6 text-xs leading-5 text-gray-400">
            Acceso privado de solo lectura. Esta producción fue compartida
            mediante Clover Digital. Los enlaces externos pueden tener
            vencimientos propios.
          </p>
        </div>

        <Link
          href="/cuenta"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0A9396] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Ir a mi cuenta
        </Link>
      </div>
    </PageShell>
  )
}

function PageShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#f5fafa] px-4 py-10 dark:bg-[#001219] md:py-16">
      {children}
    </main>
  )
}

function Unavailable({
  message,
}: {
  message?: string
}) {
  return (
    <PageShell>
      <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#06222c]">
        <LockKeyhole className="mx-auto h-10 w-10 text-[#0A9396]" />

        <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
          No se puede acceder a esta producción
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {message ||
            "El enlace puede haber vencido, haber sido revocado o la producción ya no estar disponible."}
        </p>

        <Link
          href="/cuenta"
          className="mt-6 inline-block rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white"
        >
          Volver a mi cuenta
        </Link>
      </div>
    </PageShell>
  )
}
