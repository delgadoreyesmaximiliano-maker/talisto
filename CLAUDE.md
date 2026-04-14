# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (watch mode)
npm run test:run     # Vitest (single run)
npm run test:ui      # Vitest with UI dashboard
```

To run a single test file:
```bash
npx vitest run src/__tests__/your-file.test.ts
```

## Architecture

**Talisto** is a SaaS business management dashboard (CRM + Inventory + Sales) for Chilean SMEs, built with Next.js 14 App Router.

### Stack
- **Framework:** Next.js 14 (App Router, Server Components)
- **Database/Auth:** Supabase (PostgreSQL + SSR auth)
- **AI:** Vercel `ai` SDK v6 — multi-provider (Groq primary, OpenAI/Google fallback)
- **Rate limiting:** Upstash Redis (20 req/min per user)
- **UI:** Radix UI + Tailwind CSS (dark mode via `class`, custom dark teal palette)
- **Charts:** Recharts
- **Email:** Resend
- **Messaging:** Telegram + WhatsApp webhooks
- **Testing:** Vitest + Testing Library

### Route Structure
- `src/app/(auth)/` — Public auth pages (login, signup, recovery)
- `src/app/app/` — Protected dashboard routes (requires Supabase session)
- `src/app/api/` — API routes: `chat/`, `financial/`, `cron/`, `telegram/`, `whatsapp/`
- `src/app/page.tsx` — Public landing page

### Auth Pattern
Middleware at `src/middleware.ts` → `src/lib/supabase/middleware.ts` refreshes the Supabase session cookie on every request. Server components use `createServerClient()` from `src/lib/supabase/server.ts`; client components use `createClient()` from `src/lib/supabase/client.ts`.

### Data Fetching
Dashboard pages are Server Components that run parallel Supabase queries with `Promise.all()`. No Redux/Zustand — server components eliminate most client state needs. Client state uses `useState` only for UI (modals, form inputs).

### AI Integration
`/api/chat/route.ts` streams responses via `streamText()`. Auth is validated via JWT before processing. The CFO analysis logic lives in `src/lib/groq/cfo-analysis.ts`.

### Industry Customization
The app dynamically adapts labels, KPIs, and visible features based on `companies.industry` (ecommerce, SaaS, retail, restaurant, services, marketing). Inventory features are hidden for SaaS companies.

### Database
Schema defined in `src/lib/supabase/schema.sql`. Key tables: `companies`, `users`, `products`, `inventory_transactions`, `sales`, `customers`, `ai_recommendations`. RLS policies in `src/lib/supabase/rls_policies.sql`.

### TypeScript Path Aliases
`@/*` maps to `src/*` (configured in `tsconfig.json`).

---

## Cambios Realizados

### 2026-04-04 — Light Mode, Sidebar, Transiciones, PWA

#### Light Mode completo
- `src/app/globals.css` — variantes light/dark para: body, sidebar, glass-panel, glass-card, card-3d, btn-ghost-3d, nav-active, app-header, glass-overlay, glass-input, glass-kbd
- `src/app/layout.tsx` — eliminado `className="dark"` hardcodeado → script inline con try/catch que respeta `localStorage` y `prefers-color-scheme`; `themeColor` adaptativo (array light/dark)
- `tailwind.config.ts` — `background-dark`, `surface-dark`, `border-dark` cambiados de hex fijo a `hsl(var(--background/card/border))` para que todos los usos se adapten automáticamente
- `src/components/app-header.tsx` — todos los inline styles dark → clases CSS (app-header, glass-overlay, glass-input, glass-kbd)
- `src/components/app-sidebar.tsx` — `border-white` → `border-border`; Settings item alineado con nav-active
- `src/components/proactive-cfo.tsx` — `prose-invert` → `dark:prose-invert`; `text-background-dark` → `text-primary-foreground`; `text-purple-300` → `dark:text-purple-300 text-purple-700`
- `src/components/financial-metrics.tsx` — `text-gray-500` → `text-muted-foreground`

#### Sidebar hover fix
- `src/components/app-sidebar.tsx` — hover "pegado" corregido agregando `border border-transparent` como base en los nav items

#### Transiciones de página (dissolve tipo Canva)
- `src/app/app/template.tsx` — creado con `animate-in fade-in-0 zoom-in-95 duration-200 ease-out` (usa tailwindcss-animate, ya instalado); se re-monta en cada navegación por App Router

#### PWA
- `next-pwa` instalado y configurado en `next.config.mjs`
- `public/icon-192.png` y `public/icon-512.png` — generados con sharp (SVG rayo blanco sobre gradiente indigo→violet)
- `public/manifest.json` — actualizado con `theme_color` indigo, `orientation` portrait
- Service worker activo solo en producción (condicional explícito en export: `process.env.NODE_ENV === 'production' ? withPWAConfig(nextConfig) : nextConfig`)

---

### 2026-04-05 — UX nativa iOS: Sidebar auto-close + Inventory scroll containment

#### Hook: cierre automático del sidebar en navegación
- `src/hooks/use-close-sidebar-on-navigate.ts` — hook que escucha `usePathname()` y llama `setOpenMobile(false)` en cada cambio de ruta; evita que el drawer quede abierto al navegar en iPhone
- `src/components/app-sidebar.tsx` — consume `useCloseSidebarOnNavigate()` en el top del componente

#### Inventario: contención de layout en iOS (scroll horizontal nativo)
- `src/app/app/inventory/inventory-actions.tsx` — nuevo componente config-driven; las acciones se definen en `INVENTORY_ACTIONS[]` (ExportButton, ReceiveStockDialog, AddProductDialog); el contenedor usa `overflow-x: auto` + `-webkit-overflow-scrolling: touch` para deslizamiento nativo en su propio eje
- `src/app/app/inventory/page.tsx` — outer div con `max-w-[100vw] overflow-x-hidden`; título con `min-w-0`; reemplaza botones inline por `<InventoryActions />`

#### Fix: next.config.mjs PWA wrapper explícito
- `next.config.mjs` — condicional explícito en export: `process.env.NODE_ENV === 'production' ? withPWAConfig(nextConfig) : nextConfig`

---

### 2026-04-05 — Pre-lanzamiento: Pagos Khipu + fixes varios

#### Pagos — Khipu integrado
- `src/lib/khipu.ts` — cliente REST para Khipu API v3 (`createKhipuPayment`, `getKhipuPayment`)
- `src/app/api/billing/checkout/route.ts` — crea link de pago Khipu; montos hardcodeados en config (Básico $35.000, Pro $75.000 CLP)
- `src/app/api/billing/webhook/route.ts` — recibe notificación Khipu, verifica estado `done`, activa `plan_status = 'active'` en Supabase
- `src/components/upgrade-button.tsx` — botón genérico que llama al checkout y redirige al link de pago
- `src/components/trial-warning-banner.tsx` — reemplazados botones `wa.me` por `UpgradeButton`
- `src/app/app/settings/page.tsx` — agrega `UpgradeButton` cuando `plan_status !== 'active'`

#### Integraciones, fixes y limpieza
- `src/app/app/integrations/page.tsx` — MercadoLibre, Shopify, WooCommerce → `coming_soon`
- `src/app/api/cron/trial-warnings/route.ts` — `full_name` → `name` (columna real en DB)
- `src/app/pricing/page.tsx` — botones pasan `?plan=basico` y `?plan=pro` al signup
- `src/app/(auth)/signup/page.tsx` — lee `?plan` y muestra el plan elegido al usuario
- `public/og-image.png` — generado (1200×630px, gradiente oscuro + badge indigo)
- Raíz limpia: eliminados 9 archivos de debug (`build-error2.log`, `test-*.js`, etc.)
- `src/app/app/inventory/` — WhatsApp eliminado, integraciones corregidas

#### Cuenta Khipu
- ID cuenta cobro: **515.640** (Maximiliano Augusto Delgado Reyes)
- Límite inicial: $5.000 CLP — **PENDIENTE aumentar** enviando email a soporte@khipu.com con ID 515.640, URL tienda, RUT

---

## Pendiente / Por Revisar

- PWA sin probar en iPhone (requiere deploy con HTTPS, ej. Vercel)
- API key Gemini del usuario tiene límite 0 en generación de imágenes (free tier sin billing habilitado)
