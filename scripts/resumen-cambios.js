#!/usr/bin/env node
/**
 * Talisto — Script de resumen de cambios
 * Ejecutar: node scripts/resumen-cambios.js
 */

const cambios = [
  {
    categoria: '🎨 REDISEÑO VISUAL',
    items: [
      { archivo: 'src/app/globals.css',              descripcion: 'Nuevo tema: fondo #091a17, superficies #102c26, acento cream #f7e7ce' },
      { archivo: 'tailwind.config.ts',               descripcion: 'Colores custom actualizados (background-dark, surface-dark, border-dark, primary-dark)' },
      { archivo: 'src/components/app-sidebar.tsx',   descripcion: 'Nav items con nuevos colores y cream-glow en activos' },
      { archivo: 'src/components/layout/app-header.tsx', descripcion: 'Header con colores semánticos, avatar y dropdowns actualizados' },
    ]
  },
  {
    categoria: '🔍 SEO + METADATA',
    items: [
      { archivo: 'src/app/layout.tsx',              descripcion: 'Metadata global: title template, OG image, Twitter card, robots, PWA' },
      { archivo: 'src/app/page.tsx',                descripcion: 'Metadata landing: título y descripción específicos' },
      { archivo: 'src/app/pricing/page.tsx',        descripcion: 'Metadata pricing page' },
      { archivo: 'src/app/(auth)/login/layout.tsx', descripcion: 'Layout server para metadata login (noindex)' },
      { archivo: 'src/app/(auth)/signup/layout.tsx',descripcion: 'Layout server para metadata signup' },
    ]
  },
  {
    categoria: '📄 PÁGINAS LEGALES',
    items: [
      { archivo: 'src/app/legal/privacy/page.tsx', descripcion: 'Política de Privacidad completa (11 secciones, Ley 19.628 Chile)' },
      { archivo: 'src/app/legal/terms/page.tsx',   descripcion: 'Términos y Condiciones (13 secciones, ley chilena)' },
      { archivo: 'src/app/page.tsx',               descripcion: 'Footer: links Privacidad y ToS apuntan a páginas reales' },
    ]
  },
  {
    categoria: '📱 MOBILE RESPONSIVE',
    items: [
      { archivo: 'src/app/app/page.tsx',                      descripcion: 'Dashboard: grid KPI cards responsive (1 col mobile, 2 tablet, 4 desktop)' },
      { archivo: 'src/app/app/inventory/products-table.tsx',  descripcion: 'Oculta SKU y Categoría en mobile (hidden md:table-cell)' },
      { archivo: 'src/app/app/sales/sales-table.tsx',         descripcion: 'Oculta Producto en sm, Cliente y Origen en md' },
      { archivo: 'src/app/app/crm/customers-table.tsx',       descripcion: 'Oculta Estado en sm, Suscripción y MRR en md' },
      { archivo: 'src/app/page.tsx',                          descripcion: 'Landing: hero stats, features, pricing, footer con grid-cols-1 base' },
    ]
  },
  {
    categoria: '⚡ LOADING SKELETONS',
    items: [
      { archivo: 'src/app/app/loading.tsx',           descripcion: 'Skeleton dashboard: 4 KPI cards + 2 charts + tabla + sistema' },
      { archivo: 'src/app/app/inventory/loading.tsx', descripcion: 'Skeleton tabla inventario con 8 filas' },
      { archivo: 'src/app/app/sales/loading.tsx',     descripcion: 'Skeleton tabla ventas con 8 filas' },
      { archivo: 'src/app/app/crm/loading.tsx',       descripcion: 'Skeleton tabla CRM con 8 filas' },
    ]
  },
  {
    categoria: '🎓 ONBOARDING TOUR',
    items: [
      { archivo: 'src/components/onboarding-tour.tsx', descripcion: 'Tour 4 pasos con Dialog shadcn/ui (localStorage, no se repite)' },
      { archivo: 'src/app/app/layout.tsx',             descripcion: 'OnboardingTour integrado en layout del app' },
    ]
  },
  {
    categoria: '🚀 PWA',
    items: [
      { archivo: 'public/manifest.json',    descripcion: 'Manifest PWA: nombre, colores, iconos, display standalone' },
      { archivo: 'src/app/layout.tsx',      descripcion: 'Viewport export con themeColor #091a17, appleWebApp capable' },
    ]
  },
  {
    categoria: '🛡️ ERROR BOUNDARIES',
    items: [
      { archivo: 'src/app/error.tsx',      descripcion: 'Error boundary global con retry y link al inicio' },
      { archivo: 'src/app/app/error.tsx',  descripcion: 'Error boundary del app con retry y link al dashboard' },
    ]
  },
  {
    categoria: '🗄️ PERFORMANCE SUPABASE',
    items: [
      { archivo: 'src/app/app/page.tsx',                    descripcion: 'Promise.all para 3 queries paralelas + limits (500/1000)' },
      { archivo: 'src/components/layout/app-header.tsx',    descripcion: 'Promise.all para stock + ventas hoy en paralelo + limit(100)' },
    ]
  },
  {
    categoria: '🧠 CFO IA OPTIMIZADO',
    items: [
      { archivo: 'src/app/api/chat/route.ts', descripcion: 'System prompt mejorado: rol CFO senior PyMEs Chile, contexto UF/IVA/SII, chain-of-thought, temperature=0.35, maxTokens=1024' },
    ]
  },
  {
    categoria: '📧 EMAILS CON RESEND',
    items: [
      { archivo: 'src/lib/email/resend.ts',                    descripcion: 'Cliente Resend + templates HTML: bienvenida y trial warning' },
      { archivo: 'src/app/api/email/welcome/route.ts',         descripcion: 'POST /api/email/welcome — email de bienvenida' },
      { archivo: 'src/app/api/cron/trial-warnings/route.ts',   descripcion: 'GET /api/cron/trial-warnings — revisa trials a 7/3/1 día y envía email' },
      { archivo: 'src/app/(auth)/signup/page.tsx',             descripcion: 'Envío automático de email al hacer signup' },
      { archivo: 'vercel.json',                                 descripcion: 'Crons: morning-report 12:00 UTC + trial-warnings 14:00 UTC diario' },
    ]
  },
  {
    categoria: '🔧 FIXES TÉCNICOS',
    items: [
      { archivo: 'src/app/not-found.tsx',                       descripcion: '404 rediseñada con tema forest green + cream' },
      { archivo: 'src/lib/telegram/ai-agent.ts',               descripcion: 'Groq/Supabase lazy singletons (evita crash sin env vars)' },
      { archivo: 'src/app/api/telegram/webhook/route.ts',      descripcion: 'Supabase lazy singleton' },
      { archivo: 'src/app/(auth)/login/page.tsx',              descripcion: 'Colores actualizados al nuevo tema' },
      { archivo: 'src/app/(auth)/signup/page.tsx',             descripcion: 'Colores actualizados al nuevo tema' },
      { archivo: '31 archivos adicionales',                     descripcion: 'QA visual: text-white→text-foreground, text-secondary→text-muted-foreground, hexes hardcodeados→tokens CSS' },
    ]
  },
  {
    categoria: '⚙️ ENV VARS NUEVAS REQUERIDAS',
    items: [
      { archivo: 'Vercel → Settings → Environment Variables', descripcion: 'RESEND_API_KEY — obtener en resend.com (gratis hasta 3.000 emails/mes)' },
    ]
  },
]

// ─── Render ───────────────────────────────────────────────────────────────────

const RESET  = '\x1b[0m'
const BOLD   = '\x1b[1m'
const GREEN  = '\x1b[32m'
const YELLOW = '\x1b[33m'
const CYAN   = '\x1b[36m'
const DIM    = '\x1b[2m'

console.log(`\n${BOLD}${GREEN}╔══════════════════════════════════════════════════════════════╗${RESET}`)
console.log(`${BOLD}${GREEN}║           TALISTO — RESUMEN DE CAMBIOS APLICADOS             ║${RESET}`)
console.log(`${BOLD}${GREEN}╚══════════════════════════════════════════════════════════════╝${RESET}\n`)

let totalArchivos = 0

for (const bloque of cambios) {
  console.log(`${BOLD}${YELLOW}${bloque.categoria}${RESET}`)
  for (const item of bloque.items) {
    console.log(`  ${GREEN}✓${RESET} ${CYAN}${item.archivo}${RESET}`)
    console.log(`    ${DIM}${item.descripcion}${RESET}`)
    totalArchivos++
  }
  console.log()
}

console.log(`${BOLD}${GREEN}══════════════════════════════════════════════════════════════${RESET}`)
console.log(`${BOLD}  Total: ${totalArchivos} archivos / cambios aplicados${RESET}`)
console.log(`${BOLD}  Deploy: https://talisto.vercel.app${RESET}`)
console.log(`${BOLD}${GREEN}══════════════════════════════════════════════════════════════${RESET}\n`)

console.log(`${YELLOW}${BOLD}PENDIENTE — Agregar en Vercel:${RESET}`)
console.log(`  ${CYAN}RESEND_API_KEY${RESET} → obtener gratis en ${CYAN}resend.com${RESET}`)
console.log(`  ${DIM}(sin esto los emails no funcionan, todo lo demás sí)${RESET}\n`)
