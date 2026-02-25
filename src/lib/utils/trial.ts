import { Company, TrialStatus } from '@/types/database';

/**
 * Calculate remaining days in trial period
 * Returns 0 if expired or no trial end date
 */
export function calculateDaysRemaining(trialEndsAt: string | null): number {
    if (!trialEndsAt) return 0;

    const now = new Date();
    const endDate = new Date(trialEndsAt);

    // Use server time to prevent client manipulation
    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Never return negative values
    return Math.max(0, diffDays);
}

/**
 * Comprehensive trial status evaluation
 * Includes urgency levels for UI differentiation
 */
export function getTrialStatus(
    trialEndsAt: string | null,
    planStatus: Company['plan_status'] | undefined
): TrialStatus {
    // Paid users have no trial constraints
    if (planStatus === 'active') {
        return {
            daysRemaining: 0,
            isActive: false,
            isExpired: false,
            isExpiringSoon: false,
            expiryDate: null,
            message: 'Plan activo',
            urgencyLevel: 'none',
        };
    }

    const daysRemaining = calculateDaysRemaining(trialEndsAt);
    const isExpired = daysRemaining === 0;
    const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 3;
    const expiryDate = trialEndsAt ? new Date(trialEndsAt) : null;

    // Determine urgency level for UI styling
    let urgencyLevel: TrialStatus['urgencyLevel'];
    if (isExpired) {
        urgencyLevel = 'critical';
    } else if (daysRemaining === 1) {
        urgencyLevel = 'high';
    } else if (isExpiringSoon) {
        urgencyLevel = 'medium';
    } else if (daysRemaining <= 7) {
        urgencyLevel = 'low';
    } else {
        urgencyLevel = 'none';
    }

    return {
        daysRemaining,
        isActive: !isExpired,
        isExpired,
        isExpiringSoon,
        expiryDate,
        message: formatTrialMessage(daysRemaining, isExpired),
        urgencyLevel,
    };
}

/**
 * User-friendly trial status messaging
 * Handles plural/singular forms correctly
 */
function formatTrialMessage(days: number, isExpired: boolean): string {
    if (isExpired) {
        return 'Trial expirado';
    }

    if (days === 1) {
        return '1 día restante';
    }

    return `${days} días restantes`;
}

/**
 * Get urgency-based styling classes
 * Tailwind-compatible color system
 */
export function getTrialUrgencyClasses(urgency: TrialStatus['urgencyLevel']): {
    text: string;
    bg: string;
    border: string;
    badge: string;
    bar: string;
    pulse_bar: boolean;
} {
    const classMap = {
        none: {
            text: 'text-slate-400',
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            badge: 'bg-slate-100 text-slate-600',
            bar: 'bg-emerald-500',
            pulse_bar: false,
        },
        low: {
            text: 'text-blue-400',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            badge: 'bg-blue-100 text-blue-700',
            bar: 'bg-blue-500',
            pulse_bar: false,
        },
        medium: {
            text: 'text-amber-400',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            badge: 'bg-amber-100 text-amber-700',
            bar: 'bg-amber-500',
            pulse_bar: true,
        },
        high: {
            text: 'text-orange-400',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            badge: 'bg-orange-100 text-orange-700',
            bar: 'bg-orange-500',
            pulse_bar: true,
        },
        critical: {
            text: 'text-red-500 font-semibold',
            bg: 'bg-red-50',
            border: 'border-red-300',
            badge: 'bg-red-100 text-red-700',
            bar: 'bg-red-500',
            pulse_bar: true,
        },
    };

    return classMap[urgency];
}
