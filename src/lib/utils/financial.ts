export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
    const formatted = value.toFixed(decimals);
    return `${value >= 0 ? '+' : ''}${formatted}%`;
}

export function getTemporalState(monthOffset: number) {
    return {
        isPast: monthOffset < 0,
        isFuture: monthOffset > 0,
        isPresent: monthOffset === 0,
        label: monthOffset < 0 ? 'Histórico' : monthOffset > 0 ? 'Proyección' : 'Actual',
    };
}

export function getTemporalColors(monthOffset: number) {
    if (monthOffset < 0) {
        return {
            primary: '#3b82f6', // blue
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            text: 'text-blue-400',
        };
    }

    if (monthOffset > 0) {
        return {
            primary: '#a855f7', // purple
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/30',
            text: 'text-purple-400',
        };
    }

    return {
        primary: '#13ec80', // emerald
        bg: 'bg-[#13ec80]/10',
        border: 'border-[#13ec80]/30',
        text: 'text-[#13ec80]',
    };
}
