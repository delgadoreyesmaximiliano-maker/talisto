import type { Metadata } from "next";
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
  title: {
    default: "Talisto — Gestión Inteligente para tu Negocio",
    template: "%s | Talisto",
  },
  description: "Inventario, ventas, CRM y sugerencias con IA — todo en una plataforma diseñada para PyMEs chilenas que quieren crecer sin complicaciones.",
  keywords: ["gestión", "inventario", "ventas", "CRM", "PyME", "Chile", "SaaS", "inteligencia artificial"],
  authors: [{ name: "Talisto" }],
  openGraph: {
    title: "Talisto — Gestión Inteligente para tu Negocio",
    description: "Inventario, ventas, CRM y sugerencias con IA para PyMEs chilenas.",
    url: "https://talisto.cl",
    siteName: "Talisto",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Talisto — Gestión Inteligente para tu Negocio",
    description: "Inventario, ventas, CRM y sugerencias con IA para PyMEs chilenas.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('talisto-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
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
