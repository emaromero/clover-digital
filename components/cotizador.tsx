"use client"

import {
  useMemo,
  useRef,
  useState,
} from "react"

import {
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react"

import { useLanguage } from "./language-provider"
import { trackEvent } from "@/lib/analytics"

const WHATSAPP =
  "5491164473603"

const PRECIOS_TIPOS = [
  [
    70000,
    70000,
    90000,
  ],
  [
    90000,
    90000,
    115000,
  ],
  [
    115000,
    115000,
    140000,
  ],
]

const DRONE_ESTANDAR =
  90000

const DRONE_INTEGRAL =
  130000

const REEL_HABLADO =
  45000

const VIDEO_VERTICAL =
  30000

const VIATICO_BASE =
  20000

const ENTREGA_36 =
  15000

const ENTREGA_24 =
  20000

type ExtraId =
  | "drone_standard"
  | "drone_integral"
  | "reel"
  | "vert"

type ZonaId =
  | "dentro"
  | "fuera"

type EntregaId =
  | "72"
  | "36"
  | "24"

type HoraId =
  | "manana"
  | "mediodia"
  | "tarde"

const COPY = {
  es: {
    title:
      "Cotizá tu producción",

    intro:
      "Armá tu producción en pocos pasos, conocé el valor estimado y enviá tu solicitud por WhatsApp.",

    step:
      "Paso",

    next:
      "Continuar",

    back:
      "Volver",

    typeTitle:
      "Tipo de propiedad",

    typeSubtitle:
      "Elegí la opción que más se parezca a la propiedad que vamos a fotografiar.",

    selectProperty:
      "Elegí el tipo de propiedad para continuar.",

    tipos: [
      {
        n:
          "Propiedad estándar",

        d:
          "Departamentos y PH de tamaño habitual, sin grandes exteriores ni múltiples amenities.",
      },
      {
        n:
          "Propiedad ampliada",

        d:
          "Departamentos grandes, PH y casas con más espacios, terrazas, jardines o sectores adicionales.",
      },
      {
        n:
          "Propiedad grande",

        d:
          "Casas de gran cobertura, múltiples ambientes, exteriores amplios, pileta, quincho o varias plantas.",
      },
    ],

    packageTitle:
      "Elegí un paquete",

    packageSubtitle:
      "Todos los paquetes incluyen fotografía HDR. Si solo necesitás contenido adicional, podés continuar sin elegir paquete.",

    chooseProperty:
      "Elegí primero el tipo de propiedad",

    paquetes: [
      {
        n:
          "Esenciales",

        d:
          "Fotos HDR + video recorrido para portal",
      },
      {
        n:
          "Redes sociales",

        d:
          "Fotos HDR + video vertical para redes",
      },
      {
        n:
          "Completo",

        d:
          "Fotos HDR + video vertical + video recorrido para portal",
      },
    ],

    extrasTitle:
      "Contenido adicional",

    extrasSubtitle:
      "Podés sumar contenido al paquete o contratar determinados servicios de forma independiente.",

    extras: [
      {
        id:
          "drone_standard" as ExtraId,

        n:
          "Drone estándar",

        d:
          "Fotografía aérea + clips de video aéreo de una propiedad.",
      },
      {
        id:
          "drone_integral" as ExtraId,

        n:
          "Producción aérea integral",

        d:
          "Cobertura aérea ampliada de propiedad, terreno, amenities, accesos y entorno.",
      },
      {
        id:
          "reel" as ExtraId,

        n:
          "Reel hablado",

        d:
          "Grabación vertical con micrófono + edición + subtítulos. Máximo 60 segundos.",
      },
      {
        id:
          "vert" as ExtraId,

        n:
          "Video vertical para RRSS",

        d:
          "Grabación + edición de video vertical. Máximo 60 segundos.",
      },
    ],

    specialNote:
      "Desarrollos inmobiliarios, proyectos en pozo y producciones de gran escala se cotizan aparte.",

    droneNote:
      "Las producciones con drone están sujetas a condiciones climáticas, restricciones del espacio aéreo y autorización de la locación cuando corresponda.",

    selectService:
      "Elegí al menos un paquete o servicio adicional para continuar.",

    zoneTitle:
      "Ubicación y entrega",

    zoneSubtitle:
      "Indicá dónde está la propiedad y cuándo necesitás recibir el material.",

    zoneLabel:
      "Ubicación de la propiedad",

    zoneInside:
      "CABA y Corredor Norte",

    zoneInsideDesc:
      "Zona base · sin costo adicional",

    zoneOutside:
      "Pilar, Tortugas y otras zonas",

    zoneOutsideDesc:
      "Viáticos desde $20.000",

    zoneWarning:
      "El adicional de $20.000 es el viático mínimo. El importe final se confirma según distancia, tiempo de traslado y logística de la producción.",

    selectZone:
      "Elegí la ubicación para continuar.",

    deliveryLabel:
      "Plazo de entrega",

    deliverySubtitle:
      "Las entregas prioritarias están sujetas a disponibilidad.",

    delivery72:
      "Estándar",

    delivery72Desc:
      "Hasta 72 hs hábiles",

    delivery36:
      "Prioritaria",

    delivery36Desc:
      "Hasta 36 hs",

    delivery24:
      "Express",

    delivery24Desc:
      "Hasta 24 hs",

    noExtra:
      "Sin costo adicional",

    dataTitle:
      "Tus datos",

    dataSubtitle:
      "Completá los datos para enviar la solicitud.",

    name:
      "Nombre y apellido",

    company:
      "Inmobiliaria o empresa",

    address:
      "Dirección de la propiedad",

    date:
      "Fecha preferida",

    time:
      "Franja horaria preferida",

    horas: {
      manana:
        "Mañana",

      mediodia:
        "Mediodía",

      tarde:
        "Tarde",
    },

    summary:
      "Resumen de tu producción",

    estimatedTotal:
      "Total estimado",

    request:
      "Solicitar reserva",

    included:
      "Sin cargo",

    travelSummary:
      "Viáticos por zona extendida",

    standardDeliverySummary:
      "Entrega estándar · hasta 72 hs hábiles",

    priorityDeliverySummary:
      "Entrega prioritaria · hasta 36 hs",

    expressDeliverySummary:
      "Entrega express · hasta 24 hs",

    whatsappHello:
      "¡Hola Clover Digital! Quiero solicitar una reserva.",

    whatsappTotal:
      "Total estimado",

    whatsappName:
      "Nombre",

    whatsappCompany:
      "Empresa",

    whatsappAddress:
      "Dirección",

    whatsappZone:
      "Zona",

    whatsappDate:
      "Fecha preferida",

    whatsappTime:
      "Horario preferido",

    whatsappDelivery:
      "Entrega",

    toCoordinate:
      "a coordinar",

    travelWhatsappNote:
      "Importante: el viático indicado es el mínimo. El importe final queda sujeto a confirmación según distancia, tiempo de traslado y logística.",
  },

  en: {
    title:
      "Get a quote",

    intro:
      "Build your production in a few steps, see the estimated price and send your request via WhatsApp.",

    step:
      "Step",

    next:
      "Continue",

    back:
      "Back",

    typeTitle:
      "Property type",

    typeSubtitle:
      "Choose the option that best matches the property.",

    selectProperty:
      "Choose the property type to continue.",

    tipos: [
      {
        n:
          "Standard property",

        d:
          "Apartments and PH units of standard size, without large outdoor areas or multiple amenities.",
      },
      {
        n:
          "Expanded property",

        d:
          "Large apartments, PH units and houses with terraces, gardens or additional areas.",
      },
      {
        n:
          "Large property",

        d:
          "Large houses with multiple rooms, extensive outdoor areas, pool, barbecue area or several floors.",
      },
    ],

    packageTitle:
      "Choose a package",

    packageSubtitle:
      "All packages include HDR photography. If you only need additional content, you can continue without a package.",

    chooseProperty:
      "Choose the property type first",

    paquetes: [
      {
        n:
          "Essentials",

        d:
          "HDR photos + walkthrough video for real estate portals",
      },
      {
        n:
          "Social media",

        d:
          "HDR photos + vertical video for social media",
      },
      {
        n:
          "Complete",

        d:
          "HDR photos + vertical video + walkthrough video",
      },
    ],

    extrasTitle:
      "Additional content",

    extrasSubtitle:
      "Add content to a package or book selected services separately.",

    extras: [
      {
        id:
          "drone_standard" as ExtraId,

        n:
          "Standard drone",

        d:
          "Aerial photography + aerial video clips for one property.",
      },
      {
        id:
          "drone_integral" as ExtraId,

        n:
          "Full aerial production",

        d:
          "Extended aerial coverage of the property, lot, amenities, access points and surroundings.",
      },
      {
        id:
          "reel" as ExtraId,

        n:
          "Talking reel",

        d:
          "Vertical recording with microphone + editing + subtitles. Maximum 60 seconds.",
      },
      {
        id:
          "vert" as ExtraId,

        n:
          "Vertical social media video",

        d:
          "Vertical video recording + editing. Maximum 60 seconds.",
      },
    ],

    specialNote:
      "Real estate developments, off-plan projects and large-scale productions are quoted separately.",

    droneNote:
      "Drone productions are subject to weather conditions, airspace restrictions and location authorization when required.",

    selectService:
      "Choose at least one package or additional service to continue.",

    zoneTitle:
      "Location and delivery",

    zoneSubtitle:
      "Tell us where the property is located and when you need the content.",

    zoneLabel:
      "Property location",

    zoneInside:
      "CABA and North Corridor",

    zoneInsideDesc:
      "Base service area · no additional charge",

    zoneOutside:
      "Pilar, Tortugas and other areas",

    zoneOutsideDesc:
      "Travel fee from ARS 20,000",

    zoneWarning:
      "ARS 20,000 is the minimum travel fee. Final pricing is confirmed according to distance, travel time and production logistics.",

    selectZone:
      "Choose the location to continue.",

    deliveryLabel:
      "Delivery time",

    deliverySubtitle:
      "Priority delivery is subject to availability.",

    delivery72:
      "Standard",

    delivery72Desc:
      "Within 72 business hours",

    delivery36:
      "Priority",

    delivery36Desc:
      "Within 36 hours",

    delivery24:
      "Express",

    delivery24Desc:
      "Within 24 hours",

    noExtra:
      "No additional charge",

    dataTitle:
      "Your information",

    dataSubtitle:
      "Complete your information to send the request.",

    name:
      "Full name",

    company:
      "Real estate agency or company",

    address:
      "Property address",

    date:
      "Preferred date",

    time:
      "Preferred time",

    horas: {
      manana:
        "Morning",

      mediodia:
        "Midday",

      tarde:
        "Afternoon",
    },

    summary:
      "Production summary",

    estimatedTotal:
      "Estimated total",

    request:
      "Request booking",

    included:
      "Included",

    travelSummary:
      "Extended-area travel fee",

    standardDeliverySummary:
      "Standard delivery · within 72 business hours",

    priorityDeliverySummary:
      "Priority delivery · within 36 hours",

    expressDeliverySummary:
      "Express delivery · within 24 hours",

    whatsappHello:
      "Hi Clover Digital! I'd like to request a booking.",

    whatsappTotal:
      "Estimated total",

    whatsappName:
      "Name",

    whatsappCompany:
      "Company",

    whatsappAddress:
      "Address",

    whatsappZone:
      "Area",

    whatsappDate:
      "Preferred date",

    whatsappTime:
      "Preferred time",

    whatsappDelivery:
      "Delivery",

    toCoordinate:
      "to be arranged",

    travelWhatsappNote:
      "Important: the displayed travel fee is the minimum. Final pricing is subject to confirmation depending on distance, travel time and logistics.",
  },
}

const money =
  (
    value: number
  ) =>
    "$ " +
    value.toLocaleString(
      "es-AR"
    )

const optBase =
  "relative w-full rounded-2xl border-2 p-4 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e5c6e] md:p-5"

const optOff =
  "border-gray-200 bg-white text-gray-800 hover:border-[#0e5c6e]/50 dark:border-gray-700 dark:bg-[#06222c] dark:text-gray-100"

const optOn =
  "border-[#0e5c6e] bg-[#0e5c6e] text-white shadow-sm"

export default function Cotizador() {
  const {
    language,
  } =
    useLanguage()

  const c =
    COPY[
      language
    ]

  const topRef =
    useRef<HTMLDivElement | null>(
      null
    )

  const [
    step,
    setStep,
  ] =
    useState(
      1
    )

  const [
    tipo,
    setTipo,
  ] =
    useState<
      number |
      null
    >(
      null
    )

  const [
    paq,
    setPaq,
  ] =
    useState<
      number |
      null
    >(
      null
    )

  const [
    extras,
    setExtras,
  ] =
    useState<
      Record<
        ExtraId,
        boolean
      >
    >({
      drone_standard:
        false,

      drone_integral:
        false,

      reel:
        false,

      vert:
        false,
    })

  const [
    zona,
    setZona,
  ] =
    useState<
      ZonaId |
      null
    >(
      null
    )

  const [
    entrega,
    setEntrega,
  ] =
    useState<EntregaId>(
      "72"
    )

  const [
    hora,
    setHora,
  ] =
    useState<
      HoraId |
      null
    >(
      null
    )

  const [
    warning,
    setWarning,
  ] =
    useState(
      ""
    )

  const [
    f,
    setF,
  ] =
    useState({
      nombre:
        "",

      empresa:
        "",

      dir:
        "",

      fecha:
        "",
    })

  const toggleExtra =
    (
      id: ExtraId
    ) => {
      setExtras(
        (
          current
        ) => {
          if (
            id ===
            "drone_standard"
          ) {
            return {
              ...current,

              drone_standard:
                !current.drone_standard,

              drone_integral:
                false,
            }
          }

          if (
            id ===
            "drone_integral"
          ) {
            return {
              ...current,

              drone_standard:
                false,

              drone_integral:
                !current.drone_integral,
            }
          }

          return {
            ...current,

            [id]:
              !current[
                id
              ],
          }
        }
      )

      setWarning(
        ""
      )
    }

  const lineasServicio =
    useMemo(
      () => {
        const lineas: [
          string,
          number,
        ][] = []

        if (
          tipo !==
            null &&
          paq !==
            null
        ) {
          lineas.push([
            `${c.tipos[tipo].n} · ${c.paquetes[paq].n}`,

            PRECIOS_TIPOS[
              tipo
            ][
              paq
            ],
          ])
        }

        if (
          extras
            .drone_standard
        ) {
          lineas.push([
            c.extras[0]
              .n,

            DRONE_ESTANDAR,
          ])
        }

        if (
          extras
            .drone_integral
        ) {
          lineas.push([
            c.extras[1]
              .n,

            DRONE_INTEGRAL,
          ])
        }

        if (
          extras.reel
        ) {
          lineas.push([
            c.extras[2]
              .n,

            REEL_HABLADO,
          ])
        }

        if (
          extras.vert
        ) {
          lineas.push([
            c.extras[3]
              .n,

            VIDEO_VERTICAL,
          ])
        }

        return lineas
      },
      [
        tipo,
        paq,
        extras,
        c,
      ]
    )

  const hasService =
    lineasServicio.length >
    0

  const resumen =
    useMemo(
      () => {
        const lineas: [
          string,
          number,
        ][] = [
          ...lineasServicio,
        ]

        if (
          zona ===
          "dentro"
        ) {
          lineas.push([
            c.zoneInside,
            0,
          ])
        }

        if (
          zona ===
          "fuera"
        ) {
          lineas.push([
            c.travelSummary,
            VIATICO_BASE,
          ])
        }

        if (
          hasService
        ) {
          if (
            entrega ===
            "72"
          ) {
            lineas.push([
              c.standardDeliverySummary,
              0,
            ])
          }

          if (
            entrega ===
            "36"
          ) {
            lineas.push([
              c.priorityDeliverySummary,
              ENTREGA_36,
            ])
          }

          if (
            entrega ===
            "24"
          ) {
            lineas.push([
              c.expressDeliverySummary,
              ENTREGA_24,
            ])
          }
        }

        return lineas
      },
      [
        lineasServicio,
        zona,
        entrega,
        hasService,
        c,
      ]
    )

  const total =
    resumen.reduce(
      (
        acumulado,
        linea
      ) =>
        acumulado +
        linea[1],
      0
    )

  const zonaTexto =
    zona ===
      "dentro"
      ? c.zoneInside
      : zona ===
          "fuera"
        ? c.zoneOutside
        : c.toCoordinate

  const entregaTexto =
    entrega ===
      "72"
      ? c.standardDeliverySummary
      : entrega ===
          "36"
        ? c.priorityDeliverySummary
        : c.expressDeliverySummary

  const horaTexto =
    hora !==
    null
      ? c.horas[
          hora
        ]
      : c.toCoordinate

  const scrollToStep =
    () => {
      window.setTimeout(
        () => {
          topRef.current
            ?.scrollIntoView({
              behavior:
                "smooth",

              block:
                "start",
            })
        },
        60
      )
    }

  const goNext =
    () => {
      setWarning(
        ""
      )

      if (
        step ===
          1 &&
        tipo ===
          null
      ) {
        setWarning(
          c.selectProperty
        )

        return
      }

      if (
        step ===
          2 &&
        !hasService
      ) {
        setWarning(
          c.selectService
        )

        return
      }

      if (
        step ===
          3 &&
        zona ===
          null
      ) {
        setWarning(
          c.selectZone
        )

        return
      }

      setStep(
        (
          current
        ) =>
          Math.min(
            current +
              1,
            4
          )
      )

      scrollToStep()
    }

  const goBack =
    () => {
      setWarning(
        ""
      )

      setStep(
        (
          current
        ) =>
          Math.max(
            current -
              1,
            1
          )
      )

      scrollToStep()
    }

  const jumpToPreviousStep =
    (
      number: number
    ) => {
      if (
        number >=
        step
      ) {
        return
      }

      setWarning(
        ""
      )

      setStep(
        number
      )

      scrollToStep()
    }

  const enviar =
    () => {
      if (
        !hasService ||
        zona ===
          null
      ) {
        return
      }

      const detalle =
        resumen
          .map(
            (
              linea
            ) =>
              `• ${linea[0]}: ${
                linea[1] ===
                0
                  ? c.included
                  : money(
                      linea[1]
                    )
              }`
          )
          .join(
            "\n"
          )

      const notaViatico =
        zona ===
        "fuera"
          ? `\n\n${c.travelWhatsappNote}`
          : ""

      const msg =
        `${c.whatsappHello}\n\n` +
        `${detalle}` +
        `\n\n${c.whatsappTotal}: ${money(
          total
        )}` +
        `\n${c.whatsappName}: ${
          f.nombre ||
          "-"
        }` +
        `\n${c.whatsappCompany}: ${
          f.empresa ||
          "-"
        }` +
        `\n${c.whatsappAddress}: ${
          f.dir ||
          "-"
        }` +
        `\n${c.whatsappZone}: ${zonaTexto}` +
        `\n${c.whatsappDate}: ${
          f.fecha ||
          c.toCoordinate
        }` +
        `\n${c.whatsappTime}: ${horaTexto}` +
        `\n${c.whatsappDelivery}: ${entregaTexto}` +
        notaViatico

      const droneType =
        extras
          .drone_integral
          ? "integral"
          : extras
              .drone_standard
            ? "standard"
            : "none"

      trackEvent(
        "quote_request",
        {
          value:
            total,

          currency:
            "ARS",

          services:
            lineasServicio.length,

          zone:
            zona,

          delivery:
            entrega,

          drone_type:
            droneType,
        }
      )

      window.open(
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
          msg
        )}`,
        "_blank",
        "noopener"
      )
    }

  const input =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-[#0e5c6e] dark:border-gray-700 dark:bg-[#001219] dark:text-gray-100"

  const steps = [
    c.typeTitle,
    c.extrasTitle,
    c.zoneTitle,
    c.dataTitle,
  ]

  return (
    <section
      id="cotizador"
      className="bg-white px-4 pb-28 pt-16 dark:bg-[#001219] md:pb-20 md:pt-24"
    >

      <div
        ref={
          topRef
        }
        className="mx-auto max-w-5xl scroll-mt-24"
      >

        <div className="mx-auto max-w-2xl text-center">

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {
              c.title
            }
          </h2>

          <p className="mt-3 text-gray-600 dark:text-gray-300">
            {
              c.intro
            }
          </p>

        </div>

        <div className="mx-auto mt-8 max-w-3xl md:mt-10">

          <div className="grid grid-cols-4 gap-2">

            {steps.map(
              (
                title,
                index
              ) => {
                const number =
                  index +
                  1

                const active =
                  step ===
                  number

                const completed =
                  step >
                  number

                return (
                  <button
                    key={
                      title
                    }
                    type="button"
                    disabled={
                      number >
                      step
                    }
                    onClick={() =>
                      jumpToPreviousStep(
                        number
                      )
                    }
                    className="min-w-0 text-left disabled:cursor-default"
                  >

                    <div
                      className={`h-2 rounded-full ${
                        active ||
                        completed
                          ? "bg-[#0e5c6e]"
                          : "bg-gray-200 dark:bg-white/10"
                      }`}
                    />

                    <p
                      className={`mt-2 text-center text-[10px] font-semibold sm:text-left sm:text-xs ${
                        active
                          ? "text-[#0e5c6e]"
                          : "text-gray-400"
                      }`}
                    >
                      {c.step}{" "}
                      {
                        number
                      }
                    </p>

                    <p className="mt-1 hidden truncate text-xs text-gray-500 sm:block">
                      {
                        title
                      }
                    </p>

                  </button>
                )
              }
            )}

          </div>

        </div>

        <div className="sticky top-0 z-40 -mx-4 mt-5 border-y border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-[#06222c]/95 lg:hidden">

          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">

            <div>

              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                {
                  c.estimatedTotal
                }
              </p>

              <p className="text-xl font-bold leading-tight text-[#0e5c6e] dark:text-[#5fb8cc]">
                {money(
                  total
                )}
              </p>

            </div>

            <div className="text-right">

              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                {c.step}{" "}
                {step}/4
              </p>

              <p className="mt-0.5 max-w-[150px] truncate text-xs text-gray-400">
                {
                  steps[
                    step -
                      1
                  ]
                }
              </p>

            </div>

          </div>

        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

          <div className="min-w-0 rounded-3xl border border-gray-200 bg-[#f8fbfb] p-5 dark:border-white/10 dark:bg-[#06222c] md:p-8">

            {step ===
              1 && (
              <div>

                <p className="text-sm font-semibold text-[#0A9396]">
                  {c.step} 1
                </p>

                <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    c.typeTitle
                  }
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {
                    c.typeSubtitle
                  }
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-3">

                  {c.tipos.map(
                    (
                      item,
                      index
                    ) => (
                      <button
                        key={
                          item.n
                        }
                        type="button"
                        aria-pressed={
                          tipo ===
                          index
                        }
                        onClick={() => {
                          setTipo(
                            index
                          )

                          setPaq(
                            null
                          )

                          setWarning(
                            ""
                          )
                        }}
                        className={`${optBase} ${
                          tipo ===
                          index
                            ? optOn
                            : optOff
                        }`}
                      >

                        {tipo ===
                          index && (
                          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                            <Check className="h-4 w-4" />
                          </span>
                        )}

                        <b className="block pr-8">
                          {
                            item.n
                          }
                        </b>

                        <span className="mt-2 block text-sm leading-5 opacity-80">
                          {
                            item.d
                          }
                        </span>

                      </button>
                    )
                  )}

                </div>

                <div className="mt-10">

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {
                      c.packageTitle
                    }
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {
                      c.packageSubtitle
                    }
                  </p>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">

                    {c.paquetes.map(
                      (
                        item,
                        index
                      ) => (
                        <button
                          key={
                            item.n
                          }
                          type="button"
                          disabled={
                            tipo ===
                            null
                          }
                          aria-pressed={
                            paq ===
                            index
                          }
                          onClick={() => {
                            setPaq(
                              paq ===
                                index
                                ? null
                                : index
                            )

                            setWarning(
                              ""
                            )
                          }}
                          className={`${optBase} ${
                            paq ===
                            index
                              ? optOn
                              : optOff
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >

                          {paq ===
                            index && (
                            <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                              <Check className="h-4 w-4" />
                            </span>
                          )}

                          <b className="block pr-8">
                            {
                              item.n
                            }
                          </b>

                          <span className="mt-2 block text-sm leading-5 opacity-80">
                            {
                              item.d
                            }
                          </span>

                          <span className="mt-4 block text-lg font-bold">

                            {tipo !==
                            null
                              ? money(
                                  PRECIOS_TIPOS[
                                    tipo
                                  ][
                                    index
                                  ]
                                )
                              : c.chooseProperty}

                          </span>

                        </button>
                      )
                    )}

                  </div>

                </div>

              </div>
            )}

            {step ===
              2 && (
              <div>

                <p className="text-sm font-semibold text-[#0A9396]">
                  {c.step} 2
                </p>

                <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    c.extrasTitle
                  }
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {
                    c.extrasSubtitle
                  }
                </p>

                <div className="mt-6 space-y-3">

                  {c.extras.map(
                    (
                      item
                    ) => {
                      const id =
                        item.id

                      const precio =
                        id ===
                          "drone_standard"
                          ? DRONE_ESTANDAR
                          : id ===
                              "drone_integral"
                            ? DRONE_INTEGRAL
                            : id ===
                                "reel"
                              ? REEL_HABLADO
                              : VIDEO_VERTICAL

                      const selected =
                        extras[
                          id
                        ]

                      return (
                        <button
                          key={
                            id
                          }
                          type="button"
                          aria-pressed={
                            selected
                          }
                          onClick={() =>
                            toggleExtra(
                              id
                            )
                          }
                          className={`${optBase} ${
                            selected
                              ? optOn
                              : optOff
                          }`}
                        >

                          {selected && (
                            <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                              <Check className="h-4 w-4" />
                            </span>
                          )}

                          <div className="flex flex-col gap-3 pr-7 sm:flex-row sm:items-start sm:justify-between">

                            <div>

                              <b className="block">
                                {
                                  item.n
                                }
                              </b>

                              <span className="mt-1 block text-sm leading-5 opacity-80">
                                {
                                  item.d
                                }
                              </span>

                            </div>

                            <span className="shrink-0 text-lg font-bold">
                              {money(
                                precio
                              )}
                            </span>

                          </div>

                        </button>
                      )
                    }
                  )}

                </div>

                <p className="mt-5 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {
                    c.droneNote
                  }
                </p>

                <div className="mt-6 rounded-2xl bg-white p-4 text-sm leading-6 text-gray-500 dark:bg-[#001219] dark:text-gray-400">
                  {
                    c.specialNote
                  }
                </div>

              </div>
            )}

            {step ===
              3 && (
              <div>

                <p className="text-sm font-semibold text-[#0A9396]">
                  {c.step} 3
                </p>

                <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    c.zoneTitle
                  }
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {
                    c.zoneSubtitle
                  }
                </p>

                <div className="mt-7">

                  <p className="font-semibold text-gray-900 dark:text-white">
                    {
                      c.zoneLabel
                    }
                  </p>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">

                    <button
                      type="button"
                      aria-pressed={
                        zona ===
                        "dentro"
                      }
                      onClick={() => {
                        setZona(
                          "dentro"
                        )

                        setWarning(
                          ""
                        )
                      }}
                      className={`${optBase} ${
                        zona ===
                        "dentro"
                          ? optOn
                          : optOff
                      }`}
                    >

                      <b className="block">
                        {
                          c.zoneInside
                        }
                      </b>

                      <span className="mt-1 block text-sm opacity-80">
                        {
                          c.zoneInsideDesc
                        }
                      </span>

                    </button>

                    <button
                      type="button"
                      aria-pressed={
                        zona ===
                        "fuera"
                      }
                      onClick={() => {
                        setZona(
                          "fuera"
                        )

                        setWarning(
                          ""
                        )
                      }}
                      className={`${optBase} ${
                        zona ===
                        "fuera"
                          ? optOn
                          : optOff
                      }`}
                    >

                      <b className="block">
                        {
                          c.zoneOutside
                        }
                      </b>

                      <span className="mt-1 block text-sm opacity-80">
                        {
                          c.zoneOutsideDesc
                        }
                      </span>

                    </button>

                  </div>

                  {zona ===
                    "fuera" && (
                    <p className="mt-3 text-sm leading-6 text-amber-600 dark:text-amber-300">
                      {
                        c.zoneWarning
                      }
                    </p>
                  )}

                </div>

                <div className="mt-10">

                  <p className="font-semibold text-gray-900 dark:text-white">
                    {
                      c.deliveryLabel
                    }
                  </p>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {
                      c.deliverySubtitle
                    }
                  </p>

                  <div className="mt-3 grid gap-3 md:grid-cols-3">

                    <button
                      type="button"
                      aria-pressed={
                        entrega ===
                        "72"
                      }
                      onClick={() =>
                        setEntrega(
                          "72"
                        )
                      }
                      className={`${optBase} ${
                        entrega ===
                        "72"
                          ? optOn
                          : optOff
                      }`}
                    >

                      <b className="block">
                        {
                          c.delivery72
                        }
                      </b>

                      <span className="mt-1 block text-sm opacity-80">
                        {
                          c.delivery72Desc
                        }
                      </span>

                      <span className="mt-3 block font-bold">
                        {
                          c.noExtra
                        }
                      </span>

                    </button>

                    <button
                      type="button"
                      aria-pressed={
                        entrega ===
                        "36"
                      }
                      onClick={() =>
                        setEntrega(
                          "36"
                        )
                      }
                      className={`${optBase} ${
                        entrega ===
                        "36"
                          ? optOn
                          : optOff
                      }`}
                    >

                      <b className="block">
                        {
                          c.delivery36
                        }
                      </b>

                      <span className="mt-1 block text-sm opacity-80">
                        {
                          c.delivery36Desc
                        }
                      </span>

                      <span className="mt-3 block text-lg font-bold">
                        +{" "}
                        {money(
                          ENTREGA_36
                        )}
                      </span>

                    </button>

                    <button
                      type="button"
                      aria-pressed={
                        entrega ===
                        "24"
                      }
                      onClick={() =>
                        setEntrega(
                          "24"
                        )
                      }
                      className={`${optBase} ${
                        entrega ===
                        "24"
                          ? optOn
                          : optOff
                      }`}
                    >

                      <b className="block">
                        {
                          c.delivery24
                        }
                      </b>

                      <span className="mt-1 block text-sm opacity-80">
                        {
                          c.delivery24Desc
                        }
                      </span>

                      <span className="mt-3 block text-lg font-bold">
                        +{" "}
                        {money(
                          ENTREGA_24
                        )}
                      </span>

                    </button>

                  </div>

                </div>

              </div>
            )}

            {step ===
              4 && (
              <div>

                <p className="text-sm font-semibold text-[#0A9396]">
                  {c.step} 4
                </p>

                <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    c.dataTitle
                  }
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {
                    c.dataSubtitle
                  }
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">

                  <label className="text-sm font-medium text-gray-800 dark:text-gray-100">

                    {
                      c.name
                    }

                    <input
                      className={
                        input
                      }
                      value={
                        f.nombre
                      }
                      onChange={(
                        event
                      ) =>
                        setF({
                          ...f,

                          nombre:
                            event
                              .target
                              .value,
                        })
                      }
                      autoComplete="name"
                    />

                  </label>

                  <label className="text-sm font-medium text-gray-800 dark:text-gray-100">

                    {
                      c.company
                    }

                    <input
                      className={
                        input
                      }
                      value={
                        f.empresa
                      }
                      onChange={(
                        event
                      ) =>
                        setF({
                          ...f,

                          empresa:
                            event
                              .target
                              .value,
                        })
                      }
                      autoComplete="organization"
                    />

                  </label>

                  <label className="text-sm font-medium text-gray-800 dark:text-gray-100">

                    {
                      c.address
                    }

                    <input
                      className={
                        input
                      }
                      value={
                        f.dir
                      }
                      onChange={(
                        event
                      ) =>
                        setF({
                          ...f,

                          dir:
                            event
                              .target
                              .value,
                        })
                      }
                      autoComplete="street-address"
                    />

                  </label>

                  <label className="text-sm font-medium text-gray-800 dark:text-gray-100">

                    {
                      c.date
                    }

                    <input
                      type="date"
                      className={
                        input
                      }
                      value={
                        f.fecha
                      }
                      onChange={(
                        event
                      ) =>
                        setF({
                          ...f,

                          fecha:
                            event
                              .target
                              .value,
                        })
                      }
                    />

                  </label>

                </div>

                <div className="mt-6">

                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {
                      c.time
                    }
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">

                    {(
                      [
                        "manana",
                        "mediodia",
                        "tarde",
                      ] as HoraId[]
                    ).map(
                      (
                        id
                      ) => (
                        <button
                          key={
                            id
                          }
                          type="button"
                          aria-pressed={
                            hora ===
                            id
                          }
                          onClick={() =>
                            setHora(
                              hora ===
                                id
                                ? null
                                : id
                            )
                          }
                          className={`${optBase} ${
                            hora ===
                            id
                              ? optOn
                              : optOff
                          } text-center`}
                        >
                          <b>
                            {
                              c.horas[
                                id
                              ]
                            }
                          </b>
                        </button>
                      )
                    )}

                  </div>

                </div>

              </div>
            )}

            {warning && (
              <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                {
                  warning
                }
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-200 pt-6 dark:border-white/10">

              {step >
              1 ? (
                <button
                  type="button"
                  onClick={
                    goBack
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-white dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  <ArrowLeft className="h-4 w-4" />

                  {
                    c.back
                  }
                </button>
              ) : (
                <div />
              )}

              {step <
              4 ? (
                <button
                  type="button"
                  onClick={
                    goNext
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219]"
                >
                  {
                    c.next
                  }

                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    enviar
                  }
                  disabled={
                    !hasService ||
                    zona ===
                      null
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0e5c6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001219] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {
                    c.request
                  }

                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

            </div>

          </div>

          <aside className="hidden h-fit min-w-0 rounded-3xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#06222c] lg:sticky lg:top-24 lg:block">

            <div className="flex items-center justify-between gap-3">

              <p className="text-sm font-semibold text-[#0A9396]">
                {
                  c.summary
                }
              </p>

              <span className="rounded-full bg-[#0A9396]/10 px-2.5 py-1 text-xs font-semibold text-[#0A9396]">
                {c.step}{" "}
                {step}/4
              </span>

            </div>

            <div className="mt-4 space-y-3">

              {resumen.map(
                (
                  linea,
                  index
                ) => (
                  <div
                    key={`${linea[0]}-${index}`}
                    className="flex items-start justify-between gap-4 text-sm"
                  >

                    <span className="min-w-0 text-gray-600 dark:text-gray-300">
                      {
                        linea[0]
                      }
                    </span>

                    <strong className="shrink-0 text-right text-gray-900 dark:text-white">

                      {linea[1] ===
                      0
                        ? c.included
                        : money(
                            linea[1]
                          )}

                    </strong>

                  </div>
                )
              )}

            </div>

            {zona ===
              "fuera" && (
              <p className="mt-5 border-t border-gray-100 pt-4 text-xs leading-5 text-gray-500 dark:border-white/10 dark:text-gray-400">
                *{" "}
                {
                  c.zoneWarning
                }
              </p>
            )}

            <div className="mt-5 border-t border-gray-200 pt-5 dark:border-white/10">

              <p className="text-xs uppercase tracking-wide text-gray-400">
                {
                  c.estimatedTotal
                }
              </p>

              <p className="mt-1 text-3xl font-bold text-[#0e5c6e] dark:text-[#5fb8cc]">
                {money(
                  total
                )}
              </p>

            </div>

          </aside>

        </div>

      </div>

    </section>
  )
}