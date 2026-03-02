import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { calculateDaysRemaining, getTrialStatus, getTrialUrgencyClasses } from '@/lib/utils/trial'

// Helper: devuelve una fecha ISO N días desde ahora
function daysFromNow(days: number): string {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString()
}

// Helper: devuelve una fecha ISO N días en el pasado
function daysAgo(days: number): string {
    return daysFromNow(-days)
}

// ─── calculateDaysRemaining ───────────────────────────────────────────────────

describe('calculateDaysRemaining', () => {
    it('devuelve 0 cuando trialEndsAt es null', () => {
        expect(calculateDaysRemaining(null)).toBe(0)
    })

    it('devuelve 0 cuando el trial ya expiró', () => {
        expect(calculateDaysRemaining(daysAgo(1))).toBe(0)
    })

    it('devuelve valor positivo cuando el trial aún está activo', () => {
        expect(calculateDaysRemaining(daysFromNow(7))).toBe(7)
    })

    it('devuelve 1 cuando queda menos de 24h', () => {
        expect(calculateDaysRemaining(daysFromNow(1))).toBe(1)
    })

    it('devuelve 14 para un trial recién creado', () => {
        expect(calculateDaysRemaining(daysFromNow(14))).toBe(14)
    })

    it('nunca devuelve valores negativos', () => {
        expect(calculateDaysRemaining(daysAgo(100))).toBe(0)
    })
})

// ─── getTrialStatus ───────────────────────────────────────────────────────────

describe('getTrialStatus', () => {
    describe('usuario con plan activo (pagado)', () => {
        it('retorna estado sin restricciones de trial', () => {
            const status = getTrialStatus(daysFromNow(10), 'active')
            expect(status.isActive).toBe(false)
            expect(status.isExpired).toBe(false)
            expect(status.isExpiringSoon).toBe(false)
            expect(status.urgencyLevel).toBe('none')
            expect(status.message).toBe('Plan activo')
        })
    })

    describe('trial expirado', () => {
        it('isExpired es true', () => {
            const status = getTrialStatus(daysAgo(1), 'trial')
            expect(status.isExpired).toBe(true)
            expect(status.isActive).toBe(false)
            expect(status.daysRemaining).toBe(0)
        })

        it('urgencyLevel es critical', () => {
            const status = getTrialStatus(daysAgo(5), 'expired')
            expect(status.urgencyLevel).toBe('critical')
        })

        it('message indica expiración', () => {
            const status = getTrialStatus(daysAgo(1), 'trial')
            expect(status.message).toBe('Trial expirado')
        })
    })

    describe('trial expirando pronto (≤ 3 días)', () => {
        it('isExpiringSoon es true con 3 días restantes', () => {
            const status = getTrialStatus(daysFromNow(3), 'trial')
            expect(status.isExpiringSoon).toBe(true)
            expect(status.urgencyLevel).toBe('medium')
        })

        it('urgencyLevel es high con 1 día restante', () => {
            const status = getTrialStatus(daysFromNow(1), 'trial')
            expect(status.urgencyLevel).toBe('high')
            expect(status.message).toBe('1 día restante')
        })

        it('isExpiringSoon es false con 4 días restantes', () => {
            const status = getTrialStatus(daysFromNow(4), 'trial')
            expect(status.isExpiringSoon).toBe(false)
        })
    })

    describe('trial con urgencia baja (4-7 días)', () => {
        it('urgencyLevel es low con 7 días restantes', () => {
            const status = getTrialStatus(daysFromNow(7), 'trial')
            expect(status.urgencyLevel).toBe('low')
        })

        it('urgencyLevel es low con 5 días restantes', () => {
            const status = getTrialStatus(daysFromNow(5), 'trial')
            expect(status.urgencyLevel).toBe('low')
        })
    })

    describe('trial activo sin urgencia (> 7 días)', () => {
        it('urgencyLevel es none con 14 días restantes', () => {
            const status = getTrialStatus(daysFromNow(14), 'trial')
            expect(status.urgencyLevel).toBe('none')
            expect(status.isExpiringSoon).toBe(false)
            expect(status.isExpired).toBe(false)
        })

        it('message muestra días correctamente en plural', () => {
            const status = getTrialStatus(daysFromNow(10), 'trial')
            expect(status.message).toBe('10 días restantes')
        })
    })

    it('expiryDate es null cuando trialEndsAt es null', () => {
        const status = getTrialStatus(null, 'trial')
        expect(status.expiryDate).toBeNull()
    })

    it('expiryDate es un objeto Date válido', () => {
        const future = daysFromNow(5)
        const status = getTrialStatus(future, 'trial')
        expect(status.expiryDate).toBeInstanceOf(Date)
    })
})

// ─── getTrialUrgencyClasses ───────────────────────────────────────────────────

describe('getTrialUrgencyClasses', () => {
    it('urgency none → barra emerald, sin pulso', () => {
        const cls = getTrialUrgencyClasses('none')
        expect(cls.bar).toBe('bg-emerald-500')
        expect(cls.pulse_bar).toBe(false)
    })

    it('urgency low → barra blue, sin pulso', () => {
        const cls = getTrialUrgencyClasses('low')
        expect(cls.bar).toBe('bg-blue-500')
        expect(cls.pulse_bar).toBe(false)
    })

    it('urgency medium → barra amber, con pulso', () => {
        const cls = getTrialUrgencyClasses('medium')
        expect(cls.bar).toBe('bg-amber-500')
        expect(cls.pulse_bar).toBe(true)
    })

    it('urgency high → barra orange, con pulso', () => {
        const cls = getTrialUrgencyClasses('high')
        expect(cls.bar).toBe('bg-orange-500')
        expect(cls.pulse_bar).toBe(true)
    })

    it('urgency critical → barra red, con pulso', () => {
        const cls = getTrialUrgencyClasses('critical')
        expect(cls.bar).toBe('bg-red-500')
        expect(cls.pulse_bar).toBe(true)
    })

    it('todos los niveles tienen las claves requeridas', () => {
        const levels = ['none', 'low', 'medium', 'high', 'critical'] as const
        for (const level of levels) {
            const cls = getTrialUrgencyClasses(level)
            expect(cls).toHaveProperty('text')
            expect(cls).toHaveProperty('bg')
            expect(cls).toHaveProperty('border')
            expect(cls).toHaveProperty('badge')
            expect(cls).toHaveProperty('bar')
            expect(cls).toHaveProperty('pulse_bar')
        }
    })
})
