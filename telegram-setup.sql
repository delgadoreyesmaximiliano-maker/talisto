-- 1. Agregar telegram_chat_id a companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_chat_id text;

-- 2. Crear tabla telegram_pairing_codes
CREATE TABLE IF NOT EXISTS telegram_pairing_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    code text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + interval '30 minutes'),
    UNIQUE(company_id)
);

-- Habilitar RLS
ALTER TABLE telegram_pairing_codes ENABLE ROW LEVEL SECURITY;
