import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import AboutUs from "@/components/about-us"
import Services from "@/components/services"
import Portfolio from "@/components/portfolio"
import ClientsCarousel from "@/components/clients-carousel"
import Footer from "@/components/footer"
import WhatsAppFloat from "@/components/whatsapp-float"
import Contact from "@/components/contact"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <AboutUs />
      <Services />
      <ClientsCarousel />
      <Portfolio />
      <Contact />
      <Footer />
      <WhatsAppFloat />
    </main>
  )
}
