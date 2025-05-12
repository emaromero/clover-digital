import type React from "react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import LoadingScreen from "@/components/loading-screen";
import Script from "next/script";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Clover Digital - Servicios Digitales en Buenos Aires",
  description: "Descubre nuestros servicios de diseño web y manejo de redes sociales en Clover Digital. Conectamos lo digital con tu esencia en Buenos Aires.",
  keywords: "diseño web, redes sociales, Clover Digital, marketing digital, Buenos Aires, servicios digitales",
  authors: [{ name: "Clover Digital" }],
  robots: "index, follow",
  icons: {
    icon: "https://i.postimg.cc/pLSPM0KB/logo-CloverDigital.png",
  },
  generator: "v0.dev",
  other: {
    "geo.region": "AR-B",
    "geo.placename": "Buenos Aires",
    "geo.position": "-34.603722;-58.381592",
    ICBM: "-34.603722, -58.381592",
  },
  openGraph: {
    title: "Clover Digital - Diseño y Marketing Digital",
    description: "Eleva tu marca con nuestros servicios de diseño web y manejo de redes sociales. ¡Conectemos hoy!",
    images: [
      {
        url: "https://i.postimg.cc/pLSPM0KB/logo-CloverDigital.png",
        width: 559,
        height: 559,
        alt: "Logo oficial de Clover Digital",
      },
    ],
    url: "https://cloverdigital.vercel.app/",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="scroll-smooth">
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
        {/* JSON-LD Structured Data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Clover Digital",
              url: "https://cloverdigital.vercel.app",
              logo: "https://lh3.googleusercontent.com/pw/AP1GczM3mAP1vxr8LjeK_aPM8k0HgFUdvoka_gx_W090Xz4vOAUpfybrZ6Z_VIRbq09R4tSIYkpqba2RAcCvhArVr9DbyyrIY8oq6ueEX3L2J30WFfMA_W7Tc_-Bp7veQFvEk3Ln62mSf2ILzcZaIwTC0Ncf=w953-h953-s-no-gm?authuser=0",
              sameAs: [
                "https://www.facebook.com/people/Clover-Digital/61570512932271/",
                "https://www.instagram.com/cloverdigital.arg/",
              ],
            }),
          }}
        />
      </head>
      <body className={`${poppins.variable} font-sans`}>
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