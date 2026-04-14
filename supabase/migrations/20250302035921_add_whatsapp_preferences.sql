-- Migration to add whatsapp preferences

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS whatsapp_report_time TIME DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS whatsapp_report_preferences JSONB DEFAULT '{"include_kpis": true, "include_critical_stock": true, "include_suggestions": true}'::jsonb;
