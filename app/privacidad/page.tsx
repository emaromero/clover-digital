import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad de Clover Digital sobre el uso de datos, analítica, contacto y formularios del sitio web.",
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#001219] text-gray-800 dark:text-gray-100">
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div className="mb-10">
          <Link
            href="/"
            className="text-sm text-[#0A9396] hover:underline"
          >
            ← Volver al inicio
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Política de privacidad
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-10">
          Última actualización: noviembre de 2026
        </p>

        <div className="space-y-10 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              1. Quiénes somos
            </h2>

            <p>
              Clover Digital es un estudio de producción audiovisual
              especializado en fotografía y video inmobiliario, con cobertura
              principalmente en Ciudad Autónoma de Buenos Aires y Zona Norte
              del Gran Buenos Aires.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              2. Qué información podemos recopilar
            </h2>

            <p>
              Dependiendo del uso que hagas del sitio, podemos recopilar
              información técnica y de navegación, como páginas visitadas,
              interacciones, dispositivo, navegador, ubicación aproximada,
              origen de la visita y acciones realizadas dentro del sitio.
            </p>

            <p className="mt-4">
              Si completás un formulario o te anotás en Clover Academy,
              también podemos recibir los datos que proporciones
              voluntariamente, como tu dirección de email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              3. Para qué usamos la información
            </h2>

            <p>
              La información se utiliza para mejorar la experiencia del sitio,
              analizar el rendimiento de nuestras campañas, entender qué
              servicios generan mayor interés, responder consultas y gestionar
              registros o comunicaciones relacionadas con Clover Academy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              4. Herramientas de analítica y terceros
            </h2>

            <p>
              Este sitio puede utilizar servicios de terceros para medir
              tráfico, rendimiento e interacciones, entre ellos Google
              Analytics, Meta Pixel y Vercel Analytics.
            </p>

            <p className="mt-4">
              Estos servicios pueden recopilar información técnica mediante
              cookies, identificadores u otras tecnologías similares, de
              acuerdo con sus propias políticas de privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              5. Clover Academy y almacenamiento de emails
            </h2>

            <p>
              Cuando una persona se registra para recibir novedades de Clover
              Academy, su email puede almacenarse en una base de datos
              gestionada mediante Supabase.
            </p>

            <p className="mt-4">
              Esta información se utiliza únicamente para comunicaciones
              relacionadas con Clover Academy, novedades, lanzamientos o
              contenidos vinculados a la formación ofrecida por Clover
              Digital.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              6. WhatsApp y enlaces externos
            </h2>

            <p>
              El sitio incluye enlaces a servicios externos como WhatsApp,
              Instagram, Facebook, Behance y Google Maps. Al acceder a estos
              servicios, se aplican sus respectivas políticas de privacidad y
              condiciones de uso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              7. Conservación de los datos
            </h2>

            <p>
              Conservamos la información durante el tiempo necesario para
              cumplir con los fines para los que fue recopilada, realizar
              análisis estadísticos, gestionar consultas o mantener registros
              relacionados con nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              8. Tus derechos
            </h2>

            <p>
              Podés solicitar información, actualización o eliminación de los
              datos personales que hayas proporcionado directamente a Clover
              Digital.
            </p>

            <p className="mt-4">
              Para hacerlo, podés escribirnos a{" "}
              <a
                href="mailto:cloverdigitalarg@gmail.com"
                className="text-[#0A9396] hover:underline"
              >
                cloverdigitalarg@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              9. Cambios en esta política
            </h2>

            <p>
              Esta política puede actualizarse cuando cambien las herramientas
              utilizadas, los servicios ofrecidos o la forma en que gestionamos
              la información.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              10. Contacto
            </h2>

            <p>
              Para consultas relacionadas con privacidad o protección de datos,
              podés contactarnos a través de:
            </p>

            <p className="mt-4">
              <strong>Clover Digital</strong>
              <br />
              Buenos Aires, Argentina
              <br />
              Email:{" "}
              <a
                href="mailto:cloverdigitalarg@gmail.com"
                className="text-[#0A9396] hover:underline"
              >
                cloverdigitalarg@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}