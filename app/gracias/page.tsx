import Link from "next/link"

export default function GraciasPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#B8D8D8]/30 dark:bg-[#004E64]/30">
      <div className="max-w-md w-full bg-white dark:bg-[#001219] p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">¡Gracias por tu mensaje!</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Hemos recibido tu contacto y nos pondremos en comunicación contigo a la brevedad.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#0A9396] hover:bg-[#005F73] text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
