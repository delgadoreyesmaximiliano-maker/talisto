import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://talisto.vercel.app'),
  title: {
    default: 'Talisto — CRM, Inventario y Ventas para Chile',
    template: '%s | Talisto',
  },
  description: 'Gestiona clientes, inventario y ventas con inteligencia artificial. El CRM diseñado para empresas chilenas.',
  keywords: ['CRM Chile', 'inventario', 'ventas', 'software gestión', 'pymes Chile'],
  authors: [{ name: 'Talisto' }],
  creator: 'Talisto',
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://talisto.vercel.app',
    siteName: 'Talisto',
    title: 'Talisto — CRM, Inventario y Ventas para Chile',
    description: 'Gestiona clientes, inventario y ventas con inteligencia artificial.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Talisto App' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Talisto',
    description: 'CRM + Inventario + Ventas para Chile',
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Talisto",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#091a17",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
