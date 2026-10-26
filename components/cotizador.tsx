"use client"

import { useMemo, useState } from "react"
import { useLanguage } from "./language-provider"

const WHATSAPP = "5491164473603"

const PRECIOS_TIPOS = [
  [70000, 70000, 90000],
  [90000, 90000, 115000],
  [115000, 115000, 140000],
]

const DRONE_SOLO = 90000
const DRONE_ADICIONAL = 55000
const REEL_HABLADO = 45000
const VIDEO_VERTICAL = 30000

const VIATICO_BASE = 20000

const ENTREGA_36 = 15000
const ENTREGA_24 = 20000

type ExtraId = "drone" | "reel" | "vert"
type ZonaId = "dentro" | "fuera"
type EntregaId = "72" | "36" | "24"
type HoraId = "manana" | "mediodia" | "tarde"

const COPY = {
  es: {
    title: "Cotizá tu producción",
    intro:
      "Armá tu pedido, mirá el valor al instante y enviá la solicitud por WhatsApp.",

    typeTitle: "1. Tipo de propiedad",
    typeSubtitle: "Elegí la que más se parezca a tu propiedad.",

    tipos: [
      {
        n: "Propiedad estándar",
        d: "Departamentos y PH de tamaño habitual, sin grandes exteriores ni múltiples amenities.",
      },
      {
        n: "Propiedad ampliada",
        d: "Departamentos grandes, PH y casas con más espacios, terrazas, jardines o sectores adicionales.",
      },
      {
        n: "Propiedad grande",
        d: "Casas de gran cobertura: múltiples ambientes, exteriores amplios, pileta, quincho, varias plantas.",
      },
    ],

    packageTitle: "2. Paquete",
    packageSubtitle:
      "Todos incluyen fotos HDR. Podés saltearlo si solo necesitás contenido adicional.",
    chooseProperty: "Elegí primero el tipo de propiedad",

    paquetes: [
      {
        n: "Esenciales",
        d: "Fotos HDR + video recorrido para portal",
      },
      {
        n: "Redes sociales",
        d: "Fotos HDR + video vertical para redes",
      },
      {
        n: "Completo",
        d: "Fotos HDR + video vertical + video recorrido para portal",
      },
    ],

    extrasTitle: "3. Contenido adicional",

    droneWithPackage: "Con un paquete, el drone se suma a",
    droneWithoutPackage: "Sin paquete, el drone se cotiza a",

    extras: [
      {
        id: "drone" as ExtraId,
        n: "Drone",
        nAdditional: "Drone adicional",
        d: "Fotografía aérea + video aéreo",
        dAdditional:
          "Fotografía aérea + clips de video para incorporar al material",
      },
      {
        id: "reel" as ExtraId,
        n: "Reel hablado",
        nAdditional: "Reel hablado",
        d: "Grabación vertical con micrófono + edición + subtítulos. Máximo 60 segundos",
        dAdditional:
          "Grabación vertical con micrófono + edición + subtítulos. Máximo 60 segundos",
      },
      {
        id: "vert" as ExtraId,
        n: "Video vertical para RRSS",
        nAdditional: "Video vertical para RRSS",
        d: "Grabación + edición de video vertical. Máximo 60 segundos",
        dAdditional:
          "Grabación + edición de video vertical. Máximo 60 segundos",
      },
    ],

    specialNote:
      "Desarrollos inmobiliarios, proyectos en pozo y de gran escala: se cotizan aparte. Producciones especiales, a consultar.",

    zoneTitle: "4. Ubicación de la propiedad",
    zoneSubtitle:
      "CABA y Zona Norte mantienen el mismo valor. Para otras zonas se calculan viáticos.",

    zoneInside: "CABA y Zona Norte",
    zoneInsideDesc: "Sin costo adicional",

    zoneOutside: "Fuera de CABA y Zona Norte",
    zoneOutsideDesc: "Viáticos desde $20.000",

    zoneWarning:
      "El adicional de $20.000 es el viático mínimo. El valor final puede variar según la distancia y el tiempo de traslado.",

    deliveryTitle: "5. Plazo de entrega",
    deliverySubtitle:
      "Elegí cuándo necesitás recibir el material. Las entregas prioritarias están sujetas a disponibilidad.",

    delivery72: "Entrega estándar",
    delivery72Desc: "Hasta 72 hs hábiles",

    delivery36: "Entrega prioritaria",
    delivery36Desc: "Hasta 36 hs",

    delivery24: "Entrega express",
    delivery24Desc: "Hasta 24 hs",

    noExtra: "Sin costo adicional",

    dataTitle: "6. Tus datos",

    name: "Nombre y apellido",
    company: "Inmobiliaria o empresa",
    address: "Dirección de la propiedad",
    date: "Fecha preferida",
    time: "Franja horaria preferida",

    horas: {
      manana: "Mañana",
      mediodia: "Mediodía",
      tarde: "Tarde",
    },

    summary: "Resumen",
    empty: "Todavía no elegiste ningún servicio.",
    estimatedTotal: "Total estimado",

    request: "Solicitar reserva",

    included: "Sin cargo",

    travelSummary: "Viáticos fuera de zona",

    standardDeliverySummary:
      "Entrega estándar · hasta 72 hs hábiles",

    priorityDeliverySummary:
      "Entrega prioritaria · hasta 36 hs",

    expressDeliverySummary:
      "Entrega express · hasta 24 hs",

    whatsappHello:
      "¡Hola Clover Digital! Quiero solicitar una reserva.",

    whatsappTotal: "Total estimado",
    whatsappName: "Nombre",
    whatsappCompany: "Empresa",
    whatsappAddress: "Dirección",
    whatsappZone: "Zona",
    whatsappDate: "Fecha preferida",
    whatsappTime: "Horario preferido",
    whatsappDelivery: "Entrega",

    toCoordinate: "a coordinar",

    travelWhatsappNote:
      "Importante: el viático indicado es el mínimo y queda sujeto a confirmación según distancia y tiempo de traslado.",
  },

  en: {
    title: "Get a quote",
    intro:
      "Build your production, see the estimated price instantly and send your request via WhatsApp.",

    typeTitle: "1. Property type",
    typeSubtitle: "Choose the option that best matches the property.",

    tipos: [
      {
        n: "Standard property",
        d: "Apartments and PH units of standard size, without large outdoor areas or multiple amenities.",
      },
      {
        n: "Expanded property",
        d: "Large apartments, PH units and houses with additional spaces, terraces, gardens or other areas.",
      },
      {
        n: "Large property",
        d: "Large houses with multiple rooms, extensive outdoor areas, pool, barbecue area or several floors.",
      },
    ],

    packageTitle: "2. Package",
    packageSubtitle:
      "All packages include HDR photography. You can skip this step if you only need additional content.",
    chooseProperty: "Choose the property type first",

    paquetes: [
      {
        n: "Essentials",
        d: "HDR photos + walkthrough video for real estate portals",
      },
      {
        n: "Social media",
        d: "HDR photos + vertical video for social media",
      },
      {
        n: "Complete",
        d: "HDR photos + vertical video + walkthrough video for real estate portals",
      },
    ],

    extrasTitle: "3. Additional content",

    droneWithPackage: "With a package, drone can be added for",
    droneWithoutPackage: "Without a package, drone is priced at",

    extras: [
      {
        id: "drone" as ExtraId,
        n: "Drone",
        nAdditional: "Additional drone",
        d: "Aerial photography + aerial video",
        dAdditional:
          "Aerial photography + video clips to incorporate into the production",
      },
      {
        id: "reel" as ExtraId,
        n: "Talking reel",
        nAdditional: "Talking reel",
        d: "Vertical recording with microphone + editing + subtitles. Maximum 60 seconds",
        dAdditional:
          "Vertical recording with microphone + editing + subtitles. Maximum 60 seconds",
      },
      {
        id: "vert" as ExtraId,
        n: "Vertical video for social media",
        nAdditional: "Vertical video for social media",
        d: "Vertical video recording + editing. Maximum 60 seconds",
        dAdditional:
          "Vertical video recording + editing. Maximum 60 seconds",
      },
    ],

    specialNote:
      "Real estate developments, off-plan projects and large-scale productions are quoted separately. Special productions are available upon request.",

    zoneTitle: "4. Property location",
    zoneSubtitle:
      "CABA and North Zone keep the standard service price. Travel fees apply to other areas.",

    zoneInside: "CABA and North Zone",
    zoneInsideDesc: "No additional charge",

    zoneOutside: "Outside CABA and North Zone",
    zoneOutsideDesc: "Travel fee from ARS 20,000",

    zoneWarning:
      "ARS 20,000 is the minimum travel fee. The final amount may vary depending on distance and travel time.",

    deliveryTitle: "5. Delivery time",
    deliverySubtitle:
      "Choose when you need the content. Priority and express delivery are subject to availability.",

    delivery72: "Standard delivery",
    delivery72Desc: "Within 72 business hours",

    delivery36: "Priority delivery",
    delivery36Desc: "Within 36 hours",

    delivery24: "Express delivery",
    delivery24Desc: "Within 24 hours",

    noExtra: "No additional charge",

    dataTitle: "6. Your information",

    name: "Full name",
    company: "Real estate agency or company",
    address: "Property address",
    date: "Preferred date",
    time: "Preferred time",

    horas: {
      manana: "Morning",
      mediodia: "Midday",
      tarde: "Afternoon",
    },

    summary: "Summary",
    empty: "You haven't selected any services yet.",
    estimatedTotal: "Estimated total",

    request: "Request booking",

    included: "Included",

    travelSummary: "Travel fee outside service area",

    standardDeliverySummary:
      "Standard delivery · within 72 business hours",

    priorityDeliverySummary:
      "Priority delivery · within 36 hours",

    expressDeliverySummary:
      "Express delivery · within 24 hours",

    whatsappHello:
      "Hi Clover Digital! I'd like to request a booking.",

    whatsappTotal: "Estimated total",
    whatsappName: "Name",
    whatsappCompany: "Company",
    whatsappAddress: "Address",
    whatsappZone: "Area",
    whatsappDate: "Preferred date",
    whatsappTime: "Preferred time",
    whatsappDelivery: "Delivery",

    toCoordinate: "to be arranged",

    travelWhatsappNote:
      "Important: the displayed travel fee is the minimum and is subject to confirmation depending on distance and travel time.",
  },
}

const money = (n: number) =>
  "$ " + n.toLocaleString("es-AR")

const optBase =
  "text-left rounded-lg border-2 p-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e5c6e]"

const optOff =
  "bg-white dark:bg-[#06222c] border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-[#0e5c6e]"

const optOn =
  "bg-[#0e5c6e] border-[#001219] dark:border-white text-white"

export default function Cotizador() {
  const { language } = useLanguage()

  const c = COPY[language]

  const [tipo, setTipo] =
    useState<number | null>(null)

  const [paq, setPaq] =
    useState<number | null>(null)

  const [extras, setExtras] =
    useState<Record<ExtraId, boolean>>({
      drone: false,
      reel: false,
      vert: false,
    })

  const [zona, setZona] =
    useState<ZonaId | null>(null)

  const [entrega, setEntrega] =
    useState<EntregaId>("72")

  const [hora, setHora] =
    useState<HoraId | null>(null)

  const [f, setF] = useState({
    nombre: "",
    empresa: "",
    dir: "",
    fecha: "",
  })

  const lineasServicio = useMemo(() => {
    const lineas: [string, number][] = []

    if (tipo !== null && paq !== null) {
      lineas.push([
        `${c.tipos[tipo].n} · ${c.paquetes[paq].n}`,
        PRECIOS_TIPOS[tipo][paq],
      ])
    }

    if (extras.drone) {
      lineas.push([
        paq !== null
          ? c.extras[0].nAdditional
          : c.extras[0].n,

        paq !== null
          ? DRONE_ADICIONAL
          : DRONE_SOLO,
      ])
    }

    if (extras.reel) {
      lineas.push([
        c.extras[1].n,
        REEL_HABLADO,
      ])
    }

    if (extras.vert) {
      lineas.push([
        c.extras[2].n,
        VIDEO_VERTICAL,
      ])
    }

    return lineas
  }, [tipo, paq, extras, c])

  const hasService =
    lineasServicio.length > 0

  const resumen = useMemo(() => {
    const lineas: [string, number][] = [
      ...lineasServicio,
    ]

    if (zona === "dentro") {
      lineas.push([
        c.zoneInside,
        0,
      ])
    }

    if (zona === "fuera") {
      lineas.push([
        c.travelSummary,
        VIATICO_BASE,
      ])
    }

    if (hasService) {
      if (entrega === "72") {
        lineas.push([
          c.standardDeliverySummary,
          0,
        ])
      }

      if (entrega === "36") {
        lineas.push([
          c.priorityDeliverySummary,
          ENTREGA_36,
        ])
      }

      if (entrega === "24") {
        lineas.push([
          c.expressDeliverySummary,
          ENTREGA_24,
        ])
      }
    }

    return lineas
  }, [
    lineasServicio,
    zona,
    entrega,
    hasService,
    c,
  ])

  const total = resumen.reduce(
    (acumulado, linea) =>
      acumulado + linea[1],
    0
  )

  const zonaTexto =
    zona === "dentro"
      ? c.zoneInside
      : zona === "fuera"
        ? c.zoneOutside
        : c.toCoordinate

  const entregaTexto =
    entrega === "72"
      ? c.standardDeliverySummary
      : entrega === "36"
        ? c.priorityDeliverySummary
        : c.expressDeliverySummary

  const horaTexto =
    hora !== null
      ? c.horas[hora]
      : c.toCoordinate

  const enviar = () => {
    const detalle = resumen
      .map(
        (linea) =>
          `• ${linea[0]}: ${
            linea[1] === 0
              ? c.included
              : money(linea[1])
          }`
      )
      .join("\n")

    const notaViatico =
      zona === "fuera"
        ? `\n\n${c.travelWhatsappNote}`
        : ""

    const msg =
      `${c.whatsappHello}\n\n` +
      `${detalle}` +
      `\n\n${c.whatsappTotal}: ${money(total)}` +
      `\n${c.whatsappName}: ${f.nombre || "-"}` +
      `\n${c.whatsappCompany}: ${f.empresa || "-"}` +
      `\n${c.whatsappAddress}: ${f.dir || "-"}` +
      `\n${c.whatsappZone}: ${zonaTexto}` +
      `\n${c.whatsappDate}: ${f.fecha || c.toCoordinate}` +
      `\n${c.whatsappTime}: ${horaTexto}` +
      `\n${c.whatsappDelivery}: ${entregaTexto}` +
      notaViatico

    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener"
    )
  }

  const input =
    "w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#06222c] text-gray-800 dark:text-gray-100 px-3 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0e5c6e]"

  const h3 =
    "text-xl font-bold text-gray-800 dark:text-white"

  const sub =
    "text-sm text-gray-600 dark:text-gray-300 mb-4"

  return (
    <section
      id="cotizador"
      className="pt-16 md:pt-24 bg-white dark:bg-[#001219]"
    >
      <div className="container mx-auto px-4 max-w-4xl">

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-gray-800 dark:text-white">
          {c.title}
        </h2>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
          {c.intro}
        </p>

        <div className="space-y-12">

          {/* 1. TIPO DE PROPIEDAD */}
          <div>
            <h3 className={h3}>
              {c.typeTitle}
            </h3>

            <p className={sub}>
              {c.typeSubtitle}
            </p>

            <div className="grid gap-3 md:grid-cols-3">
              {c.tipos.map((x, i) => (
                <button
                  key={x.n}
                  type="button"
                  aria-pressed={tipo === i}
                  onClick={() => setTipo(i)}
                  className={`${optBase} ${
                    tipo === i
                      ? optOn
                      : optOff
                  }`}
                >
                  <b className="block">
                    {x.n}
                  </b>

                  <span className="text-sm opacity-80">
                    {x.d}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. PAQUETE */}
          <div>
            <h3 className={h3}>
              {c.packageTitle}
            </h3>

            <p className={sub}>
              {c.packageSubtitle}
            </p>

            <div className="grid gap-3 md:grid-cols-3">
              {c.paquetes.map((x, i) => (
                <button
                  key={x.n}
                  type="button"
                  aria-pressed={paq === i}
                  disabled={tipo === null}
                  onClick={() =>
                    setPaq(
                      paq === i
                        ? null
                        : i
                    )
                  }
                  className={`${optBase} ${
                    paq === i
                      ? optOn
                      : optOff
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <b className="block">
                    {x.n}
                  </b>

                  <span className="text-sm opacity-80 block">
                    {x.d}
                  </span>

                  <span className="block mt-2 font-bold text-lg">
                    {tipo !== null ? (
                      money(
                        PRECIOS_TIPOS[tipo][i]
                      )
                    ) : (
                      <span className="text-sm font-normal">
                        {c.chooseProperty}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. CONTENIDO ADICIONAL */}
          <div>
            <h3 className={h3}>
              {c.extrasTitle}
            </h3>

            <p className={sub}>
              {paq !== null
                ? `${c.droneWithPackage} ${money(DRONE_ADICIONAL)}.`
                : `${c.droneWithoutPackage} ${money(DRONE_SOLO)}.`}
            </p>

            <div className="grid gap-3">
              {c.extras.map((x) => {
                const id = x.id

                const isDrone =
                  id === "drone"

                const precio =
                  id === "drone"
                    ? paq !== null
                      ? DRONE_ADICIONAL
                      : DRONE_SOLO
                    : id === "reel"
                      ? REEL_HABLADO
                      : VIDEO_VERTICAL

                const nombre =
                  isDrone &&
                  paq !== null
                    ? x.nAdditional
                    : x.n

                const descripcion =
                  isDrone &&
                  paq !== null
                    ? x.dAdditional
                    : x.d

                const on =
                  extras[id]

                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setExtras(
                        (actual) => ({
                          ...actual,
                          [id]:
                            !actual[id],
                        })
                      )
                    }
                    className={`${optBase} ${
                      on
                        ? optOn
                        : optOff
                    } grid grid-cols-[100px_1fr] gap-4 items-baseline`}
                  >
                    <span className="font-bold text-lg">
                      {money(precio)}
                    </span>

                    <span>
                      <b className="block">
                        {nombre}
                      </b>

                      <span className="text-sm opacity-80">
                        {descripcion}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
              {c.specialNote}
            </p>
          </div>

          {/* 4. UBICACIÓN */}
          <div>
            <h3 className={h3}>
              {c.zoneTitle}
            </h3>

            <p className={sub}>
              {c.zoneSubtitle}
            </p>

            <div className="grid gap-3 md:grid-cols-2">

              <button
                type="button"
                aria-pressed={
                  zona === "dentro"
                }
                onClick={() =>
                  setZona("dentro")
                }
                className={`${optBase} ${
                  zona === "dentro"
                    ? optOn
                    : optOff
                }`}
              >
                <b className="block">
                  {c.zoneInside}
                </b>

                <span className="text-sm opacity-80">
                  {c.zoneInsideDesc}
                </span>
              </button>

              <button
                type="button"
                aria-pressed={
                  zona === "fuera"
                }
                onClick={() =>
                  setZona("fuera")
                }
                className={`${optBase} ${
                  zona === "fuera"
                    ? optOn
                    : optOff
                }`}
              >
                <b className="block">
                  {c.zoneOutside}
                </b>

                <span className="text-sm opacity-80">
                  {c.zoneOutsideDesc}
                </span>
              </button>

            </div>

            {zona === "fuera" && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
                {c.zoneWarning}
              </p>
            )}
          </div>

          {/* 5. ENTREGA */}
          <div>
            <h3 className={h3}>
              {c.deliveryTitle}
            </h3>

            <p className={sub}>
              {c.deliverySubtitle}
            </p>

            <div className="grid gap-3 md:grid-cols-3">

              <button
                type="button"
                aria-pressed={
                  entrega === "72"
                }
                onClick={() =>
                  setEntrega("72")
                }
                className={`${optBase} ${
                  entrega === "72"
                    ? optOn
                    : optOff
                }`}
              >
                <b className="block">
                  {c.delivery72}
                </b>

                <span className="text-sm opacity-80 block">
                  {c.delivery72Desc}
                </span>

                <span className="block mt-2 font-bold">
                  {c.noExtra}
                </span>
              </button>

              <button
                type="button"
                aria-pressed={
                  entrega === "36"
                }
                onClick={() =>
                  setEntrega("36")
                }
                className={`${optBase} ${
                  entrega === "36"
                    ? optOn
                    : optOff
                }`}
              >
                <b className="block">
                  {c.delivery36}
                </b>

                <span className="text-sm opacity-80 block">
                  {c.delivery36Desc}
                </span>

                <span className="block mt-2 font-bold text-lg">
                  + {money(ENTREGA_36)}
                </span>
              </button>

              <button
                type="button"
                aria-pressed={
                  entrega === "24"
                }
                onClick={() =>
                  setEntrega("24")
                }
                className={`${optBase} ${
                  entrega === "24"
                    ? optOn
                    : optOff
                }`}
              >
                <b className="block">
                  {c.delivery24}
                </b>

                <span className="text-sm opacity-80 block">
                  {c.delivery24Desc}
                </span>

                <span className="block mt-2 font-bold text-lg">
                  + {money(ENTREGA_24)}
                </span>
              </button>

            </div>
          </div>

          {/* 6. DATOS */}
          <div>
            <h3 className={`${h3} mb-4`}>
              {c.dataTitle}
            </h3>

            <div className="grid gap-3 md:grid-cols-2">

              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {c.name}

                <input
                  className={`${input} mt-1`}
                  value={f.nombre}
                  onChange={(e) =>
                    setF({
                      ...f,
                      nombre:
                        e.target.value,
                    })
                  }
                  autoComplete="name"
                />
              </label>

              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {c.company}

                <input
                  className={`${input} mt-1`}
                  value={f.empresa}
                  onChange={(e) =>
                    setF({
                      ...f,
                      empresa:
                        e.target.value,
                    })
                  }
                  autoComplete="organization"
                />
              </label>

              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {c.address}

                <input
                  className={`${input} mt-1`}
                  value={f.dir}
                  onChange={(e) =>
                    setF({
                      ...f,
                      dir:
                        e.target.value,
                    })
                  }
                  autoComplete="street-address"
                />
              </label>

              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {c.date}

                <input
                  type="date"
                  className={`${input} mt-1`}
                  value={f.fecha}
                  onChange={(e) =>
                    setF({
                      ...f,
                      fecha:
                        e.target.value,
                    })
                  }
                />
              </label>

            </div>

            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mt-6 mb-2">
              {c.time}
            </p>

            <div className="grid gap-3 grid-cols-3">
              {(
                [
                  "manana",
                  "mediodia",
                  "tarde",
                ] as HoraId[]
              ).map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={
                    hora === id
                  }
                  onClick={() =>
                    setHora(
                      hora === id
                        ? null
                        : id
                    )
                  }
                  className={`${optBase} ${
                    hora === id
                      ? optOn
                      : optOff
                  } text-center font-bold`}
                >
                  {c.horas[id]}
                </button>
              ))}
            </div>
          </div>

          {/* RESUMEN */}
          <div>
            <h3 className={`${h3} mb-3`}>
              {c.summary}
            </h3>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#06222c] p-4 text-sm text-gray-800 dark:text-gray-100">

              {resumen.length ? (
                resumen.map(
                  (linea, i) => (
                    <div
                      key={`${linea[0]}-${i}`}
                      className="flex justify-between gap-4 py-1"
                    >
                      <span>
                        {linea[0]}
                      </span>

                      <b className="text-right">
                        {linea[1] === 0
                          ? c.included
                          : money(
                              linea[1]
                            )}
                      </b>
                    </div>
                  )
                )
              ) : (
                c.empty
              )}

              {zona === "fuera" && (
                <p className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
                  * {c.zoneWarning}
                </p>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* TOTAL FLOTANTE */}
      <div className="sticky bottom-4 z-30 mt-10 px-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-[#06222c]/95 backdrop-blur-md shadow-lg px-5 py-3">

            <div className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {c.estimatedTotal}
              </span>

              <strong className="block text-xl md:text-2xl leading-tight text-[#0e5c6e] dark:text-[#5fb8cc]">
                {money(total)}
              </strong>
            </div>

            <button
              type="button"
              disabled={
                !hasService ||
                zona === null
              }
              onClick={enviar}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e5c6e] hover:bg-[#001219] text-white text-sm font-semibold px-5 py-3 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {c.request}

              <span aria-hidden="true">
                →
              </span>
            </button>

          </div>
        </div>
      </div>

    </section>
  )
}