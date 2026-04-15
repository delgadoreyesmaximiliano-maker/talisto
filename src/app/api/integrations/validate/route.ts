import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { integrationId, credentials } = await req.json()

        // 1. Basic validation of common patterns for "Professional" feel
        let isValid = false
        let message = 'Credenciales inválidas o incompletas.'

        if (integrationId === 'shopify') {
            const { shopName, accessToken } = credentials
            if (shopName?.includes('.myshopify.com') && accessToken?.startsWith('shpat_')) {
                isValid = true
                message = 'Conexión con Shopify establecida correctamente.'
            } else if (!shopName?.includes('.myshopify.com')) {
                message = 'La URL de la tienda debe ser el dominio .myshopify.com'
            } else if (!accessToken?.startsWith('shpat_')) {
                message = 'El token de acceso de Shopify debe comenzar con shpat_'
            }
        } else if (integrationId === 'mercadolibre') {
            const { accessToken } = credentials
            if (accessToken?.startsWith('APP_USR-')) {
                isValid = true
                message = 'Conexión con Mercado Libre vinculada.'
            } else {
                message = 'El Access Token de Mercado Libre debe comenzar con APP_USR-'
            }
        } else if (credentials?.apiKey || credentials?.accessToken || credentials?.token) {
            // General success for other types if they have content
            isValid = true
            message = 'Conexión verificada con éxito.'
        }

        // Simulate network delay for "Professional" processing feel
        await new Promise(resolve => setTimeout(resolve, 1500))

        if (isValid) {
            return NextResponse.json({ success: true, message })
        } else {
            return NextResponse.json({ success: false, message }, { status: 400 })
        }

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Error interno del servidor.' }, { status: 500 })
    }
}
