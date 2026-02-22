/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Building2, Sparkles } from 'lucide-react'

export default function CompanySetupPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        name: '',
        industry: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleIndustryChange = (value: string) => {
        setFormData({ ...formData, industry: value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!formData.name || !formData.industry) {
            setError('Por favor completa todos los campos obligatorios')
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .insert([
                    {
                        name: formData.name,
                        industry: formData.industry as any,
                        plan: 'basic',
                        settings: {}
                    }
                ] as any)
                .select()
                .single()

            if (companyError) throw companyError

            const { error: userError } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    company_id: (companyData as any).id,
                    role: 'admin'
                } as any)

            if (userError) throw userError

            router.push('/app')
            router.refresh()
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Error al crear la empresa')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">¡Bienvenido a Talisto!</CardTitle>
                    <CardDescription>
                        Configura tu espacio de trabajo para comenzar a gestionar tu negocio.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-100/50 dark:bg-red-900/20 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre de tu Empresa *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Ej: Mi Tienda, Distribuidora Lagos"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rubro *</Label>
                            <Select onValueChange={handleIndustryChange} value={formData.industry} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tu rubro" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ecommerce">E-commerce / Tienda Online</SelectItem>
                                    <SelectItem value="retail">Comercio / Retail</SelectItem>
                                    <SelectItem value="saas">Software / SaaS</SelectItem>
                                    <SelectItem value="restaurant">Restaurant / Alimentos</SelectItem>
                                    <SelectItem value="marketing">Agencia de Marketing</SelectItem>
                                    <SelectItem value="services">Servicios Profesionales</SelectItem>
                                    <SelectItem value="manufacturing">Manufactura / Producción</SelectItem>
                                    <SelectItem value="health">Salud / Bienestar</SelectItem>
                                    <SelectItem value="education">Educación</SelectItem>
                                    <SelectItem value="other">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full mt-6 gap-2" disabled={loading}>
                            {loading ? (
                                'Configurando...'
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Comenzar a Usar Talisto
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
