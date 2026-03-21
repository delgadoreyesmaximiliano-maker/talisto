'use client'

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Percent } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils/financial';

interface MetricCardProps {
    label: string;
    value: string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

function MetricCard({ label, value, change, trend, icon, iconBg, iconColor }: MetricCardProps) {
    const trendColor = trend === 'up'
        ? 'text-green-500'
        : trend === 'down'
            ? 'text-red-500'
            : 'text-gray-500';

    const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

    return (
        <div className="bg-card rounded-xl p-6 border border-border hover:border-border/70 transition-all hover:shadow-lg hover:shadow-[#13ec80]/5">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${iconBg}`}>
                    <div className={iconColor}>
                        {icon}
                    </div>
                </div>

                {change !== undefined && change !== 0 && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span>{Math.abs(change).toFixed(1)}%</span>
                    </div>
                )}
            </div>

            <div>
                <p className="text-sm text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}

interface FinancialMetricsProps {
    data: {
        revenue: number;
        expenses: number;
        profit: number;
        margin: number;
        revenueChange?: number;
        expensesChange?: number;
        profitChange?: number;
        marginChange?: number;
        isEstimatedExpenses?: boolean;
    };
    loading?: boolean;
}

export function FinancialMetrics({ data, loading }: FinancialMetricsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-card rounded-xl p-6 border border-border animate-pulse"
                    >
                        <div className="h-12 bg-muted/40 rounded-lg mb-4" />
                        <div className="h-4 bg-muted/40 rounded mb-2" />
                        <div className="h-8 bg-muted/40 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                label="Ingresos"
                value={formatCurrency(data.revenue)}
                change={data.revenueChange}
                trend={data.revenueChange && data.revenueChange > 0 ? 'up' : data.revenueChange && data.revenueChange < 0 ? 'down' : 'neutral'}
                icon={<DollarSign className="w-6 h-6" />}
                iconBg="bg-green-500/10"
                iconColor="text-green-500"
            />

            <MetricCard
                label={data.isEstimatedExpenses ? "Gastos (estimado)" : "Gastos"}
                value={formatCurrency(data.expenses)}
                change={data.expensesChange}
                trend={data.expensesChange && data.expensesChange < 0 ? 'up' : data.expensesChange && data.expensesChange > 0 ? 'down' : 'neutral'}
                icon={<ShoppingCart className="w-6 h-6" />}
                iconBg="bg-orange-500/10"
                iconColor="text-orange-500"
            />

            <MetricCard
                label="Utilidad"
                value={formatCurrency(data.profit)}
                change={data.profitChange}
                trend={data.profitChange && data.profitChange > 0 ? 'up' : data.profitChange && data.profitChange < 0 ? 'down' : 'neutral'}
                icon={<TrendingUp className="w-6 h-6" />}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-500"
            />

            <MetricCard
                label="Margen"
                value={`${data.margin.toFixed(1)}%`}
                change={data.marginChange}
                trend={data.marginChange && data.marginChange > 0 ? 'up' : data.marginChange && data.marginChange < 0 ? 'down' : 'neutral'}
                icon={<Percent className="w-6 h-6" />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-500"
            />
        </div>
    );
}
