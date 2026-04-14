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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5fa' },
    { media: '(prefers-color-scheme: dark)',  color: '#091a17' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('talisto-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}}})()`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
