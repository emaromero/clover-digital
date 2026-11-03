import Navbar from "@/components/navbar"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import AboutUs from "@/components/about-us"
import Services from "@/components/services"
import Clientes from "@/components/clientes"
import Portfolio from "@/components/portfolio"
import GoogleReviews from "@/components/google-reviews"
import AcademyPreview from "@/components/academy-preview"
import Cotizador from "@/components/cotizador"
import Footer from "@/components/footer"
import WhatsAppFloat from "@/components/whatsapp-float"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <AboutUs />
      <Services />
      <Clientes />
      <Portfolio />
      <GoogleReviews />
      <AcademyPreview />
      <Cotizador />
      <Footer />
      <WhatsAppFloat />
    </main>
  )
}