import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import AboutUs from "@/components/about-us"
import Services from "@/components/services"
import Portfolio from "@/components/portfolio"

import Clientes from "@/components/clientes"
import Footer from "@/components/footer"
import WhatsAppFloat from "@/components/whatsapp-float"
import Cotizador from "@/components/cotizador"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <AboutUs />
      <Services />
      <Clientes />
      <Portfolio />
      <Cotizador />
      <Footer />
      <WhatsAppFloat />
    </main>
  )
}
