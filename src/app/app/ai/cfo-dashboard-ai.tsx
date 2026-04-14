'use client'

import { useState, useEffect } from 'react';
import { TemporalSlider } from '@/components/temporal-slider';
import { FinancialMetrics } from '@/components/financial-metrics';
import { ProactiveCFO } from '@/components/proactive-cfo';
import { toast } from 'sonner';
import { ChatClient } from './chat-client';
import { Bot, User, Send, Sparkles, Loader2 } from 'lucide-react'

interface CfoDashboardProps {
    contextData: any;
}

export function CfoDashboardAppAi({ contextData }: CfoDashboardProps) {
    const [monthOffset, setMonthOffset] = useState(0);
    const [financialData, setFinancialData] = useState<any>(null);
    const [cfoAnalysis, setCfoAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadData() {
            setLoading(true);

            try {
                // Fetch financial data from API
                const response = await fetch(`/api/financial/data?offset=${monthOffset}`);

                if (!response.ok) {
                    throw new Error('Error al cargar datos financieros');
                }

                const data = await response.json();
                setFinancialData(data);

                // Generate CFO analysis via server-side API
                const cfoResponse = await fetch('/api/financial/cfo-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        financialData: {
                            period: data.period,
                            revenue: data.revenue,
                            expenses: data.expenses,
                            profit: data.profit,
                            margin: data.margin,
                            revenueChange: data.revenueChange,
                            expensesChange: data.expensesChange,
                            profitChange: data.profitChange,
                            growthRate: data.growthRate,
                            avg3months: data.avg3months,
                        },
                        monthOffset,
                        companyName: data.companyName,
                        industry: data.industry,
                    }),
                });

                if (cfoResponse.ok) {
                    const cfoData = await cfoResponse.json();
                    setCfoAnalysis(cfoData.analysis);
                } else {
                    setCfoAnalysis('No se pudo generar el análisis. Por favor intenta nuevamente.');
                }

            } catch (error) {
                console.error('Error loading temporal data:', error);
                toast.error('Error al cargar análisis financiero');

                // Set fallback empty data
                setFinancialData({
                    revenue: 0,
                    expenses: 0,
                    profit: 0,
                    margin: 0,
                });
                setCfoAnalysis('No se pudo generar el análisis. Por favor intenta nuevamente.');

            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [monthOffset]);

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto w-full space-y-6">
            {/* Header Area */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        💼 Tu CFO Virtual
                    </h1>
                    <p className="text-muted-foreground text-sm">Navega por el tiempo para analizar tu negocio en Talisto.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-4 scroll-smooth space-y-6 custom-scrollbar">
                {/* Temporal Navigation */}
                <TemporalSlider
                    currentOffset={monthOffset}
                    onDateChange={setMonthOffset}
                />

                {/* Financial Metrics */}
                {financialData && (
                    <FinancialMetrics
                        data={financialData}
                        loading={loading}
                    />
                )}

                {/* Proactive CFO Analysis */}
                <ProactiveCFO
                    analysis={cfoAnalysis}
                    loading={loading}
                    monthOffset={monthOffset}
                />

                {/* Chat Conversacional Integrado */}
                <div className="border-t border-border-dark pt-8 mt-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            💬 Continúa la conversación
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Haz preguntas específicas sobre este escenario a Tali.
                        </p>
                    </div>
                    {/* Contenedor del chat modificado */}
                    <div className="rounded-2xl border border-border-dark bg-background-dark p-4 shadow-lg min-h-[400px] flex flex-col">
                        <ChatClient />
                    </div>
                </div>
            </div>
        </div>
    );
}
