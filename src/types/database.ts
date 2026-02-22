export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            companies: {
                Row: {
                    id: string
                    name: string
                    rut: string | null
                    industry: 'ecommerce' | 'saas' | 'retail' | 'marketing' | 'restaurant' | 'services'
                    plan: 'basic' | 'pro' | 'enterprise'
                    created_at: string
                    settings: Json
                }
                Insert: {
                    id?: string
                    name: string
                    rut?: string | null
                    industry: 'ecommerce' | 'saas' | 'retail' | 'marketing' | 'restaurant' | 'services'
                    plan?: 'basic' | 'pro' | 'enterprise'
                    created_at?: string
                    settings?: Json
                }
                Update: {
                    id?: string
                    name?: string
                    rut?: string | null
                    industry?: 'ecommerce' | 'saas' | 'retail' | 'marketing' | 'restaurant' | 'services'
                    plan?: 'basic' | 'pro' | 'enterprise'
                    created_at?: string
                    settings?: Json
                }
            }
            users: {
                Row: {
                    id: string
                    company_id: string | null
                    email: string
                    name: string | null
                    role: 'admin' | 'editor' | 'viewer'
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    email: string
                    name?: string | null
                    role?: 'admin' | 'editor' | 'viewer'
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    email?: string
                    name?: string | null
                    role?: 'admin' | 'editor' | 'viewer'
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    company_id: string | null
                    sku: string | null
                    name: string
                    category: string | null
                    stock_current: number
                    stock_minimum: number
                    price_sale: number | null
                    price_cost: number | null
                    supplier: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    sku?: string | null
                    name: string
                    category?: string | null
                    stock_current?: number
                    stock_minimum?: number
                    price_sale?: number | null
                    price_cost?: number | null
                    supplier?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    sku?: string | null
                    name?: string
                    category?: string | null
                    stock_current?: number
                    stock_minimum?: number
                    price_sale?: number | null
                    price_cost?: number | null
                    supplier?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            inventory_transactions: {
                Row: {
                    id: string
                    company_id: string | null
                    product_id: string | null
                    type: 'entrada' | 'salida'
                    quantity: number
                    reason: string | null
                    notes: string | null
                    user_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    product_id?: string | null
                    type: 'entrada' | 'salida'
                    quantity: number
                    reason?: string | null
                    notes?: string | null
                    user_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    product_id?: string | null
                    type?: 'entrada' | 'salida'
                    quantity?: number
                    reason?: string | null
                    notes?: string | null
                    user_id?: string | null
                    created_at?: string
                }
            }
            sales: {
                Row: {
                    id: string
                    company_id: string | null
                    external_id: string | null
                    source: string | null
                    amount: number
                    status: string | null
                    customer_name: string | null
                    customer_email: string | null
                    items: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    external_id?: string | null
                    source?: string | null
                    amount: number
                    status?: string | null
                    customer_name?: string | null
                    customer_email?: string | null
                    items?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    external_id?: string | null
                    source?: string | null
                    amount?: number
                    status?: string | null
                    customer_name?: string | null
                    customer_email?: string | null
                    items?: Json | null
                    created_at?: string
                }
            }
            customers: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    email: string | null
                    plan: string | null
                    mrr: number | null
                    status: string | null
                    last_activity: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    email?: string | null
                    plan?: string | null
                    mrr?: number | null
                    status?: string | null
                    last_activity?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    email?: string | null
                    plan?: string | null
                    mrr?: number | null
                    status?: string | null
                    last_activity?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    company_id: string | null
                    customer_id: string | null
                    name: string
                    budget: number | null
                    hours_estimated: number | null
                    hours_logged: number
                    status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    customer_id?: string | null
                    name: string
                    budget?: number | null
                    hours_estimated?: number | null
                    hours_logged?: number
                    status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    customer_id?: string | null
                    name?: string
                    budget?: number | null
                    hours_estimated?: number | null
                    hours_logged?: number
                    status?: string | null
                    created_at?: string
                }
            }
            integrations: {
                Row: {
                    id: string
                    company_id: string | null
                    type: string
                    status: string | null
                    credentials: Json | null
                    last_sync: string | null
                    sync_frequency: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    type: string
                    status?: string | null
                    credentials?: Json | null
                    last_sync?: string | null
                    sync_frequency?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    type?: string
                    status?: string | null
                    credentials?: Json | null
                    last_sync?: string | null
                    sync_frequency?: string | null
                    created_at?: string
                }
            }
            ai_recommendations: {
                Row: {
                    id: string
                    company_id: string | null
                    type: 'critical' | 'opportunity' | 'suggestion'
                    title: string
                    description: string | null
                    impact_estimate: number | null
                    status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    type: 'critical' | 'opportunity' | 'suggestion'
                    title: string
                    description?: string | null
                    impact_estimate?: number | null
                    status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    type?: 'critical' | 'opportunity' | 'suggestion'
                    title?: string
                    description?: string | null
                    impact_estimate?: number | null
                    status?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// ============================================
// Convenience type aliases
// ============================================
export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type InventoryTransaction = Database['public']['Tables']['inventory_transactions']['Row']
export type InventoryTransactionInsert = Database['public']['Tables']['inventory_transactions']['Insert']
export type InventoryTransactionUpdate = Database['public']['Tables']['inventory_transactions']['Update']

export type Sale = Database['public']['Tables']['sales']['Row']
export type SaleInsert = Database['public']['Tables']['sales']['Insert']
export type SaleUpdate = Database['public']['Tables']['sales']['Update']

export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type Integration = Database['public']['Tables']['integrations']['Row']
export type IntegrationInsert = Database['public']['Tables']['integrations']['Insert']
export type IntegrationUpdate = Database['public']['Tables']['integrations']['Update']

export type AIRecommendation = Database['public']['Tables']['ai_recommendations']['Row']
export type AIRecommendationInsert = Database['public']['Tables']['ai_recommendations']['Insert']
export type AIRecommendationUpdate = Database['public']['Tables']['ai_recommendations']['Update']
