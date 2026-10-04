"use client"

import { useMemo, useState } from "react"

const WHATSAPP = "5491164473603"

const TIPOS = [
  { n: "Propiedad estándar", d: "Departamentos y PH de tamaño habitual, sin grandes exteriores ni múltiples amenities.", p: [70000, 70000, 90000] },
  { n: "Propiedad ampliada", d: "Departamentos grandes, PH y casas con más espacios, terrazas, jardines o sectores adicionales.", p: [90000, 90000, 115000] },
  { n: "Propiedad grande", d: "Casas de gran cobertura: múltiples ambientes, exteriores amplios, pileta, quincho, varias plantas.", p: [115000, 115000, 140000] },
]

const PAQUETES = [
  { n: "Esenciales", d: "Fotos HDR + video recorrido para portal" },
  { n: "Redes sociales", d: "Fotos HDR + video vertical para redes" },
  { n: "Completo", d: "Fotos HDR + video vertical + video recorrido para portal" },
]

const EXTRAS = [
  { id: "drone", d: "Fotografía aérea + video aéreo", dAd: "Fotografía aérea + clips de video para incorporar al material" },
  { id: "reel", n: "Reel hablado", d: "Grabación vertical con micrófono + edición + subtítulos. Máximo 60 segundos", p: 45000 },
  { id: "vert", n: "Video vertical para RRSS", d: "Grabación + edición de video vertical. Máximo 60 segundos", p: 30000 },
]

const HORAS = ["Mañana", "Mediodía", "Tarde"]
const DRONE_SOLO = 90000
const DRONE_ADICIONAL = 55000

const money = (n: number) => "$ " + n.toLocaleString("es-AR")

const optBase =
  "text-left rounded-lg border-2 p-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e5c6e]"
const optOff =
  "bg-white dark:bg-[#06222c] border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-[#0e5c6e]"
const optOn = "bg-[#0e5c6e] border-[#001219] dark:border-white text-white"

export default function Cotizador() {
  const [tipo, setTipo] = useState<number | null>(null)
  const [paq, setPaq] = useState<number | null>(null)
  const [extras, setExtras] = useState<Record<string, boolean>>({})
  const [hora, setHora] = useState<string | null>(null)
  const [f, setF] = useState({ nombre: "", empresa: "", dir: "", fecha: "" })

  const lineas = useMemo(() => {
    const L: [string, number][] = []
    if (tipo !== null && paq !== null) L.push([`${TIPOS[tipo].n} · ${PAQUETES[paq].n}`, TIPOS[tipo].p[paq]])
    if (extras.drone) L.push(paq !== null ? ["Drone adicional", DRONE_ADICIONAL] : ["Drone", DRONE_SOLO])
    EXTRAS.forEach((x) => {
      if (x.id !== "drone" && extras[x.id]) L.push([x.n as string, x.p as number])
    })
    return L
  }, [tipo, paq, extras])

  const total = lineas.reduce((a, l) => a + l[1], 0)

  const enviar = () => {
    const msg =
      "¡Hola Clover Digital! Quiero solicitar una reserva.\n\n" +
      lineas.map((l) => `• ${l[0]}: ${money(l[1])}`).join("\n") +
      `\n\nTotal estimado: ${money(total)}` +
      `\nNombre: ${f.nombre || "-"}` +
      `\nEmpresa: ${f.empresa || "-"}` +
      `\nDirección: ${f.dir || "-"}` +
      `\nFecha preferida: ${f.fecha || "a coordinar"}` +
      `\nHorario preferido: ${hora || "a coordinar"}`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener")
  }

  const input =
    "w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#06222c] text-gray-800 dark:text-gray-100 px-3 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0e5c6e]"
  const h3 = "text-xl font-bold text-gray-800 dark:text-white"
  const sub = "text-sm text-gray-600 dark:text-gray-300 mb-4"

  return (
    <section id="cotizador" className="py-16 md:py-24 pb-32 bg-white dark:bg-[#001219]">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-gray-800 dark:text-white">Cotizá tu producción</h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
          Armá tu pedido, mirá el valor al instante y enviá la solicitud por WhatsApp.
        </p>

        <div className="space-y-12">
          <div>
            <h3 className={h3}>1. Tipo de propiedad</h3>
            <p className={sub}>Elegí la que más se parezca a tu propiedad.</p>
            <div className="grid gap-3 md:grid-cols-3">
              {TIPOS.map((x, i) => (
                <button key={x.n} type="button" aria-pressed={tipo === i} onClick={() => setTipo(i)} className={`${optBase} ${tipo === i ? optOn : optOff}`}>
                  <b className="block">{x.n}</b>
                  <span className="text-sm opacity-80">{x.d}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className={h3}>2. Paquete</h3>
            <p className={sub}>Todos incluyen fotos HDR. Podés saltearlo si solo necesitás contenido adicional.</p>
            <div className="grid gap-3 md:grid-cols-3">
              {PAQUETES.map((x, i) => (
                <button
                  key={x.n}
                  type="button"
                  aria-pressed={paq === i}
                  disabled={tipo === null}
                  onClick={() => setPaq(paq === i ? null : i)}
                  className={`${optBase} ${paq === i ? optOn : optOff} disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <b className="block">{x.n}</b>
                  <span className="text-sm opacity-80 block">{x.d}</span>
                  <span className="block mt-2 font-bold text-lg">
                    {tipo !== null ? money(TIPOS[tipo].p[i]) : <span className="text-sm font-normal">Elegí primero el tipo de propiedad</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className={h3}>3. Contenido adicional</h3>
            <p className={sub}>
              {paq !== null ? `Con un paquete, el drone se suma a ${money(DRONE_ADICIONAL)}.` : `Sin paquete, el drone se cotiza a ${money(DRONE_SOLO)}.`}
            </p>
            <div className="grid gap-3">
              {EXTRAS.map((x) => {
                const isDrone = x.id === "drone"
                const precio = isDrone ? (paq !== null ? DRONE_ADICIONAL : DRONE_SOLO) : (x.p as number)
                const nombre = isDrone ? (paq !== null ? "Drone adicional" : "Drone") : x.n
                const desc = isDrone && paq !== null ? x.dAd : x.d
                const on = !!extras[x.id]
                return (
                  <button
                    key={x.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setExtras({ ...extras, [x.id]: !on })}
                    className={`${optBase} ${on ? optOn : optOff} grid grid-cols-[100px_1fr] gap-4 items-baseline`}
                  >
                    <span className="font-bold text-lg">{money(precio)}</span>
                    <span>
                      <b className="block">{nombre}</b>
                      <span className="text-sm opacity-80">{desc}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
              Desarrollos inmobiliarios, proyectos en pozo y de gran escala: se cotizan aparte. Viáticos y producciones especiales, a consultar.
            </p>
          </div>

          <div>
            <h3 className={`${h3} mb-4`}>4. Tus datos</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">Nombre y apellido
                <input className={`${input} mt-1`} value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} autoComplete="name" />
              </label>
              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">Inmobiliaria o empresa
                <input className={`${input} mt-1`} value={f.empresa} onChange={(e) => setF({ ...f, empresa: e.target.value })} autoComplete="organization" />
              </label>
              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">Dirección de la propiedad
                <input className={`${input} mt-1`} value={f.dir} onChange={(e) => setF({ ...f, dir: e.target.value })} autoComplete="street-address" />
              </label>
              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">Fecha preferida
                <input type="date" className={`${input} mt-1`} value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
              </label>
            </div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mt-6 mb-2">Franja horaria preferida</p>
            <div className="grid gap-3 grid-cols-3">
              {HORAS.map((h) => (
                <button key={h} type="button" aria-pressed={hora === h} onClick={() => setHora(hora === h ? null : h)} className={`${optBase} ${hora === h ? optOn : optOff} text-center font-bold`}>
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className={`${h3} mb-3`}>Resumen</h3>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#06222c] p-4 text-sm text-gray-800 dark:text-gray-100">
              {lineas.length ? (
                lineas.map((l) => (
                  <div key={l[0]} className="flex justify-between py-1">
                    <span>{l[0]}</span>
                    <b>{money(l[1])}</b>
                  </div>
                ))
              ) : (
                "Todavía no elegiste ningún servicio."
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-[#06222c] border-t-2 border-[#001219] dark:border-white/30 px-4 py-3 pr-24">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="block text-xs text-gray-600 dark:text-gray-300">Total estimado</span>
            <strong className="text-2xl text-[#0e5c6e] dark:text-[#5fb8cc]">{money(total)}</strong>
          </div>
          <button
            type="button"
            disabled={!lineas.length}
            onClick={enviar}
            className="rounded-full bg-[#0e5c6e] hover:bg-[#001219] text-white font-bold px-6 py-3 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            Solicitar reserva por WhatsApp
          </button>
        </div>
      </div>
    </section>
  )
}
