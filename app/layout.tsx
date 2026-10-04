import type React from "react";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import LoadingScreen from "@/components/loading-screen";
import Script from "next/script";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#001219",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fotografía inmobiliaria y video para propiedades en Buenos Aires | Clover Digital",
    template: "%s | Clover Digital",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "fotografía inmobiliaria",
    "fotógrafo inmobiliario Buenos Aires",
    "video inmobiliario",
    "fotos HDR propiedades",
    "drone inmobiliario",
    "reels inmobiliarios",
    "fotografía de arquitectura",
    "Zona Norte",
    "CABA",
    "Clover Digital",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Fotografía inmobiliaria",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1, "max-snippet": -1 },
  },
  icons: { icon: "/favicon.ico" },
  // Para verificar el sitio en Google Search Console con etiqueta HTML, pegá acá tu código:
  // verification: { google: "TU_CODIGO" },
  other: {
    "geo.region": "AR-B",
    "geo.placename": "Buenos Aires",
    "geo.position": "-34.603722;-58.381592",
    ICBM: "-34.603722, -58.381592",
  },
  openGraph: {
    title: "Clover Digital | Fotografía y video para vender propiedades",
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Clover Digital - fotografía y video para propiedades" }],
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clover Digital | Fotografía y video para vender propiedades",
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "es-AR",
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#negocio`,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      logo: "https://i.postimg.cc/pLSPM0KB/logo-CloverDigital.png",
      image: `${SITE_URL}/og-image.jpg`,
      telephone: "+5491164473603",
      email: "cloverdigitalarg@gmail.com",
      address: { "@type": "PostalAddress", addressRegion: "Buenos Aires", addressCountry: "AR" },
      areaServed: [
        { "@type": "AdministrativeArea", name: "Zona Norte, Gran Buenos Aires" },
        { "@type": "City", name: "Ciudad Autónoma de Buenos Aires" },
      ],
      knowsAbout: ["Fotografía inmobiliaria", "Video inmobiliario", "Fotografía con drone", "Fotografía de arquitectura"],
      sameAs: [
        "https://www.instagram.com/cloverdigital.arg/",
        "https://www.behance.net/cloverdigital1",
        "https://www.facebook.com/people/Clover-Digital/61570512932271/",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de fotografía y video inmobiliario",
        itemListElement: [
          "Fotografía HDR de propiedades",
          "Video recorrido para portales inmobiliarios",
          "Video vertical para redes sociales",
          "Reel hablado",
          "Fotografía y video con drone",
          "Producción para desarrollos inmobiliarios",
        ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-4T9VDN4G4R"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4T9VDN4G4R');
            `,
          }}
        />
        {/* Meta Pixel */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1284279832637867');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body className={`${poppins.variable} font-sans`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <LoadingScreen />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}