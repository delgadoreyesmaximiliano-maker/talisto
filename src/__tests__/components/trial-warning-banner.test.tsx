import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrialWarningBanner } from '@/components/trial-warning-banner'
import type { TrialStatus } from '@/types/database'

// Mock de next/link — jsdom no tiene enrutador de Next.js
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeStatus(overrides: Partial<TrialStatus> = {}): TrialStatus {
    return {
        daysRemaining: 14,
        isActive: true,
        isExpired: false,
        isExpiringSoon: false,
        expiryDate: null,
        message: '14 días restantes',
        urgencyLevel: 'none',
        ...overrides,
    }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TrialWarningBanner', () => {
    describe('trial activo sin urgencia', () => {
        it('no renderiza nada cuando el trial está activo y no expira pronto', () => {
            const { container } = render(
                <TrialWarningBanner status={makeStatus()} companyName="Empresa Test" />
            )
            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('trial expirado', () => {
        const expiredStatus = makeStatus({
            isExpired: true,
            isActive: false,
            daysRemaining: 0,
            urgencyLevel: 'critical',
        })

        it('muestra el título de trial finalizado', () => {
            render(<TrialWarningBanner status={expiredStatus} companyName="Mi Empresa" />)
            expect(screen.getByText('Tu periodo de prueba ha finalizado')).toBeInTheDocument()
        })

        it('menciona el nombre de la empresa', () => {
            render(<TrialWarningBanner status={expiredStatus} companyName="Mi Empresa" />)
            expect(screen.getByText(/Mi Empresa/)).toBeInTheDocument()
        })

        it('muestra el botón de Activar Plan Ahora', () => {
            render(<TrialWarningBanner status={expiredStatus} companyName="Mi Empresa" />)
            expect(screen.getByText('Activar Plan Ahora')).toBeInTheDocument()
        })

        it('muestra el enlace Ver Planes y Precios', () => {
            render(<TrialWarningBanner status={expiredStatus} companyName="Mi Empresa" />)
            expect(screen.getByText('Ver Planes y Precios')).toBeInTheDocument()
        })

        it('el enlace de Ver Planes y Precios apunta a /pricing', () => {
            render(<TrialWarningBanner status={expiredStatus} companyName="Mi Empresa" />)
            const link = screen.getByText('Ver Planes y Precios').closest('a')
            expect(link).toHaveAttribute('href', '/pricing')
        })
    })

    describe('trial expirando pronto — múltiples días', () => {
        const expiringSoonStatus = makeStatus({
            daysRemaining: 3,
            isExpiringSoon: true,
            urgencyLevel: 'medium',
        })

        it('muestra el mensaje de días restantes', () => {
            render(<TrialWarningBanner status={expiringSoonStatus} companyName="Empresa Test" />)
            expect(screen.getByText('Tu prueba expira en 3 días')).toBeInTheDocument()
        })

        it('muestra el botón Activar Plan', () => {
            render(<TrialWarningBanner status={expiringSoonStatus} companyName="Empresa Test" />)
            expect(screen.getByText('Activar Plan')).toBeInTheDocument()
        })

        it('muestra el enlace Ver Planes', () => {
            render(<TrialWarningBanner status={expiringSoonStatus} companyName="Empresa Test" />)
            expect(screen.getByText('Ver Planes')).toBeInTheDocument()
        })
    })

    describe('trial expirando pronto — último día', () => {
        const lastDayStatus = makeStatus({
            daysRemaining: 1,
            isExpiringSoon: true,
            urgencyLevel: 'high',
        })

        it('muestra mensaje de último día', () => {
            render(<TrialWarningBanner status={lastDayStatus} companyName="Empresa Test" />)
            expect(screen.getByText('¡Último día de tu prueba gratuita!')).toBeInTheDocument()
        })
    })
})
