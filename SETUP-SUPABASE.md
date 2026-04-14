# 🚀 Configuración de Supabase para Talisto

Guía paso a paso para configurar Supabase como backend de Talisto.

---

## 1. Crear cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"**
3. Inicia sesión con tu cuenta de **GitHub** (recomendado) o crea una cuenta con email
4. Acepta los términos de servicio

---

## 2. Crear un proyecto

1. En el dashboard, haz clic en **"New project"**
2. Selecciona tu organización (o crea una nueva)
3. Completa los campos:
   - **Name**: `talisto` (o el nombre que prefieras)
   - **Database Password**: genera una contraseña segura y **guárdala en un lugar seguro**
   - **Region**: selecciona la más cercana a tus usuarios (ej: `South America (São Paulo)`)
4. Haz clic en **"Create new project"**
5. Espera ~2 minutos mientras se provisiona el proyecto

---

## 3. Ejecutar el schema.sql

### Opción A: SQL Editor (Recomendado)

1. En el menú lateral de Supabase, ve a **"SQL Editor"**
2. Haz clic en **"New query"**
3. Abre el archivo `src/lib/supabase/schema.sql` de tu proyecto
4. Copia todo su contenido y pégalo en el editor SQL
5. Haz clic en **"Run"** (o presiona `Ctrl + Enter`)
6. Verifica que aparezca **"Success. No rows returned"** para cada statement

### Opción B: Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar sesión
supabase login

# Vincular tu proyecto (necesitas el Reference ID del dashboard)
supabase link --project-ref <tu-project-ref>

# Ejecutar el schema
supabase db push
```

### Verificar las tablas

1. Ve a **"Table Editor"** en el menú lateral
2. Deberías ver las siguientes 9 tablas:
   - `companies`
   - `users`
   - `products`
   - `inventory_transactions`
   - `sales`
   - `customers`
   - `projects`
   - `integrations`
   - `ai_recommendations`

---

## 4. Obtener las credenciales

1. Ve a **"Project Settings"** (ícono de engranaje en el menú lateral)
2. Selecciona **"API"** en el submenú
3. Copia los siguientes valores:

| Variable | Dónde encontrarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** — en la sección "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **anon / public** — en la sección "Project API keys" |
| `SUPABASE_SERVICE_ROLE_KEY` | **service_role / secret** — en la sección "Project API keys" |

> ⚠️ **IMPORTANTE**: La `SUPABASE_SERVICE_ROLE_KEY` tiene acceso completo a tu base de datos. **Nunca la expongas en el cliente/navegador**. Solo úsala en el servidor.

---

## 5. Agregar credenciales al .env.local

1. Abre el archivo `.env.local` en la raíz de tu proyecto
2. Pega los valores correspondientes:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

3. Guarda el archivo
4. Reinicia el servidor de desarrollo:

```bash
npm run dev
```

> ✅ El archivo `.env.local` ya está incluido en `.gitignore`, así que tus credenciales **no se subirán a Git**.

---

## 6. Verificar la conexión

Puedes verificar que todo funciona creando un componente de prueba:

```tsx
// Ejemplo rápido de verificación
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.from('companies').select('*')

console.log('Conexión exitosa:', data)
```

---

## 📂 Archivos creados

| Archivo | Descripción |
|---|---|
| `src/lib/supabase/client.ts` | Cliente de Supabase para el navegador |
| `src/lib/supabase/server.ts` | Cliente de Supabase para el servidor |
| `src/lib/supabase/schema.sql` | Esquema completo de la base de datos |
| `src/types/database.ts` | Tipos TypeScript para todas las tablas |
| `.env.local` | Variables de entorno (credenciales) |
