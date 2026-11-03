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
import Reveal from "@/components/reveal"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <Hero />

      <Reveal>
        <AboutUs />
      </Reveal>

      <Reveal delay={0.04}>
        <Services />
      </Reveal>

      <Reveal delay={0.04}>
        <Clientes />
      </Reveal>

      <Reveal delay={0.04}>
        <Portfolio />
      </Reveal>

      <GoogleReviews />

      <AcademyPreview />

      <Cotizador />

      <Reveal>
        <Footer />
      </Reveal>

      <WhatsAppFloat />
    </main>
  )
}