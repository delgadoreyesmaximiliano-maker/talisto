'use client'

import { useState, useEffect } from 'react';
import { TemporalSlider } from '@/components/temporal-slider';
import { FinancialMetrics } from '@/components/financial-metrics';
import { ProactiveCFO } from '@/components/proactive-cfo';
import { toast } from 'sonner';
import { ChatInterface } from './chat-interface';

interface CfoDashboardProps {
    contextData: any;
}

export function CfoDashboard({ contextData }: CfoDashboardProps) {
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
        <div className="min-h-screen bg-[#111814] p-6 rounded-xl border border-[#283930]">
            <div className="max-w-7xl mx-auto space-y-8">
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

                {/* Existing Conversational Chat */}
                <div className="border-t border-[#283930] pt-8 mt-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            💬 También puedes preguntarme:
                        </h2>
                        <p className="text-gray-400">
                            Haz preguntas específicas sobre este periodo o simula escenarios
                        </p>
                    </div>

                    <div className="bg-[#1c2721] rounded-xl border border-[#283930] overflow-hidden">
                        <ChatInterface contextData={contextData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
