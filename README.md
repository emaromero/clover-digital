# Clover Digital

Sitio de Clover Digital: fotografía y video para propiedades, arquitectura y desarrollos inmobiliarios en Buenos Aires.

## Qué incluye

- Presentación de servicios: fotografía HDR, video recorrido, video vertical, reel hablado, drone y desarrollos.
- Portfolio con fotos de propiedades y enlace a Instagram (@cloverdigital.arg).
- Cotizador online: tipo de propiedad, paquete, contenido adicional, fecha y franja horaria. Envía la solicitud por WhatsApp.
- Modo claro/oscuro y selector de idioma ES/EN (el cotizador está solo en español).

## Actualizar precios

Los precios están en `components/cotizador.tsx` (`TIPOS`, `EXTRAS`, `DRONE_SOLO`, `DRONE_ADICIONAL`). El número de WhatsApp está en la constante `WHATSAPP` del mismo archivo.

## Desarrollo

```bash
npm install
npm run dev
```

Abrí http://localhost:3000. Para producción: `npm run build`. Se despliega en Vercel.

## SEO

- Metadatos, Open Graph, datos estructurados (JSON-LD), `sitemap.xml` y `robots.txt` se generan desde `app/layout.tsx`, `app/sitemap.ts` y `app/robots.ts`.
- La URL del sitio está en `lib/site.ts`. Si conectás un dominio propio, cambiala ahí.
- Imagen para compartir en redes: `public/og-image.jpg` (1200x630).
