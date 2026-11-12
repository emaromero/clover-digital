const DEFAULT_SITE_URL =
  "https://www.cloverdigital.com.ar"

export const SITE_URL =
  (
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    DEFAULT_SITE_URL
  ).replace(/\/$/, "")

export const SITE_NAME =
  "Clover Digital"

export const SITE_DESCRIPTION =
  "Fotografía inmobiliaria HDR, video, reels y drone para inmobiliarias y agentes en CABA y Zona Norte. Cobertura en Corredor Norte. Cotizá online."