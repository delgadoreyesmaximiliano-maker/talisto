'use client'

import { useState } from 'react';
import { Sparkles, TrendingUp, Target, ChevronDown, X, Loader2, Lightbulb, TrendingDown, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ProactiveCFOProps {
    analysis: string;
    loading: boolean;
    monthOffset: number;
}

const PRESET_SCENARIOS = [
    { id: 'hire', label: 'Contratar Vendedor', icon: Users, prompt: 'Quiero contratar a un vendedor por $800.000 mensuales más comisiones.' },
    { id: 'price', label: 'Aumento de Precios', icon: TrendingUp, prompt: 'Voy a aumentar los precios de mis servicios principales en un 15%.' },
    { id: 'costs', label: 'Recorte de Gastos', icon: TrendingDown, prompt: 'Planeo cambiar de proveedores para reducir mis costos operativos en un 20%.' },
    { id: 'ads', label: 'Campaña Ads', icon: Lightbulb, prompt: 'Quiero invertir $1.000.000 adicional en Google Ads este mes.' },
];

export function ProactiveCFO({ analysis, loading, monthOffset }: ProactiveCFOProps) {
    const isPast = monthOffset < 0;
    const isFuture = monthOffset > 0;
    const [showDetails, setShowDetails] = useState(false);
    const [showSimulator, setShowSimulator] = useState(false);
    const [simResult, setSimResult] = useState('');
    const [simLoading, setSimLoading] = useState(false);
    const [customScenario, setCustomScenario] = useState('');

    const getIcon = () => {
        if (isFuture) return <Target className="w-6 h-6" />;
        if (isPast) return <TrendingUp className="w-6 h-6" />;
        return <Sparkles className="w-6 h-6" />;
    };

    const getTitle = () => {
        if (isFuture) return "Proyección Financiera";
        if (isPast) return "Análisis Histórico";
        return "Análisis en Tiempo Real";
    };

    const getSubtitle = () => {
        if (isFuture) return "Basado en tendencias actuales";
        if (isPast) return "Datos históricos confirmados";
        return "Estado actual de tu negocio";
    };

    const getBgColor = () => {
        if (isFuture) return "bg-purple-500/5";
        if (isPast) return "bg-blue-500/5";
        return "bg-[#13ec80]/5";
    };

    const getIconColor = () => {
        if (isFuture) return "text-purple-400";
        if (isPast) return "text-blue-400";
        return "text-[#13ec80]";
    };

    const getBorderColor = () => {
        if (isFuture) return "border-purple-500/30";
        if (isPast) return "border-blue-500/30";
        return "border-[#13ec80]/30";
    };

    const handleSimulate = async (scenarioPrompt: string) => {
        if (!scenarioPrompt.trim()) return;

        setCustomScenario(scenarioPrompt);
        setSimLoading(true);
        try {
            const response = await fetch('/api/financial/cfo-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    financialData: {
                        period: 'simulación estratégica',
                        context: 'El usuario quiere simular una decisión de negocio y necesita saber el impacto financiero, ROI esperado, y posibles riesgos.',
                        decision: scenarioPrompt
                    },
                    monthOffset: 0,
                    companyName: '',
                    industry: 'general',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setSimResult(data.analysis);
            } else {
                setSimResult('No se pudo procesar la simulación. Intenta de nuevo.');
            }
        } catch {
            setSimResult('Error de conexión al CFO Virtual. Intenta de nuevo.');
        } finally {
            setSimLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="bg-[#1c2721] border-[#283930] shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${getBgColor()}`}>
                            <div className={getIconColor()}>{getIcon()}</div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white">
                                Tu CFO Virtual está analizando...
                            </h3>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-[#283930] rounded w-3/4" />
                        <div className="h-4 bg-[#283930] rounded w-full" />
                        <div className="h-4 bg-[#283930] rounded w-5/6" />
                        <div className="h-4 bg-[#283930] rounded w-4/5" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`bg-[#1c2721] border-2 ${getBorderColor()} shadow-xl hover:shadow-2xl transition-all`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${getBgColor()}`}>
                        <div className={getIconColor()}>{getIcon()}</div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{getTitle()}</h3>
                        <p className="text-sm text-gray-400 font-normal mt-1">
                            {getSubtitle()}
                        </p>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Analysis text */}
                <div className="prose prose-invert max-w-none">
                    <div className={`text-gray-300 leading-relaxed whitespace-pre-line ${!showDetails && analysis.length > 400 ? 'line-clamp-6' : ''}`}>
                        {analysis}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-[#283930]">
                    <Button
                        className="bg-[#13ec80] hover:bg-[#10d170] text-[#111814] font-semibold"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                        {showDetails ? 'Ocultar detalles' : 'Ver detalles completos'}
                    </Button>
                    <Button
                        variant="outline"
                        className="border-[#283930] bg-[#111814] hover:bg-[#243830] text-gray-300"
                        onClick={() => { setShowSimulator(!showSimulator); setSimResult(''); }}
                    >
                        {showSimulator ? '✕ Cerrar simulador' : '✨ Laboratorio de Estrategia'}
                    </Button>
                </div>

                {/* Scenario Simulator Panel */}
                {showSimulator && (
                    <div className="bg-[#111814] border border-[#283930] rounded-xl p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between">
                            <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                Laboratorio de Estrategias
                            </h4>
                            <button onClick={() => setShowSimulator(false)} className="text-gray-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400">
                            ¿Qué estás pensando hacer? El CFO con IA evaluará el riesgo, el retorno de inversión y el impacto en tu flujo de caja.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {PRESET_SCENARIOS.map((scenario) => {
                                const Icon = scenario.icon;
                                return (
                                    <button
                                        key={scenario.id}
                                        onClick={() => handleSimulate(scenario.prompt)}
                                        disabled={simLoading}
                                        className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#283930] bg-[#1c2721] hover:bg-[#243830] hover:border-purple-500/30 transition-all text-xs text-gray-300 gap-2 disabled:opacity-50"
                                    >
                                        <Icon className="w-5 h-5 text-purple-400" />
                                        <span className="text-center font-medium">{scenario.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="relative">
                            <Textarea
                                value={customScenario}
                                onChange={(e) => setCustomScenario(e.target.value)}
                                placeholder="O describe tu propia idea: 'Quiero abrir un local nuevo en Providencia que costará $10M al mes...'"
                                className="w-full bg-[#1c2721] border-[#283930] text-white placeholder:text-gray-600 focus-visible:ring-purple-500/50 min-h-[100px] resize-none"
                            />
                            <Button
                                onClick={() => handleSimulate(customScenario)}
                                disabled={simLoading || !customScenario.trim()}
                                size="sm"
                                className="absolute bottom-3 right-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-40"
                            >
                                {simLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analizando...</>
                                ) : (
                                    'Evaluar idea'
                                )}
                            </Button>
                        </div>

                        {simResult && (
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5 mt-4 space-y-3">
                                <h5 className="text-purple-300 font-bold flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Veredicto del CFO:
                                </h5>
                                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                    {simResult}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
