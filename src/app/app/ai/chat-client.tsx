'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Bot, User, Send, Sparkles, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'

const PIE_COLORS = ['#13ec80', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

const formatChartValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatTooltipValue = (value: any) => [`$${Number(value ?? 0).toLocaleString('es-CL')}`, 'Monto'] as any

export function ChatClient() {
    const [inputValue, setInputValue] = useState('')

    // Context data is now fetched server-side in /api/chat — no client data needed
    const transport = useMemo(() => new DefaultChatTransport({
        api: '/api/chat',
    }), [])

    const { messages, sendMessage, status } = useChat({
        transport,
        messages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: '¡Hola! Soy tu asistente de Talisto.\n\nAún estoy aprendiendo el contexto de tu negocio, pero estaré 100% disponible muy pronto para darte reportes de ventas, crear gráficas y sugerir oportunidades.\n\nEscribe cualquier duda o comando abajo.',
                parts: [{ type: 'text', text: '¡Hola! Soy tu asistente de Talisto.\n\nAún estoy aprendiendo el contexto de tu negocio, pero estaré 100% disponible muy pronto para darte reportes de ventas, crear gráficas y sugerir oportunidades.\n\nEscribe cualquier duda o comando abajo.', state: 'done' }],
            }
        ],
    })

    const isLoading = status === 'submitted' || status === 'streaming'

    // Auto-scroll to bottom
    const scrollRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const getMessageText = (m: any): string => {
        if (typeof m.content === 'string' && m.content) return m.content
        if (Array.isArray(m.parts)) {
            return m.parts
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text || '')
                .join('')
        }
        return ''
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const text = inputValue.trim()
        if (!text || isLoading) return
        sendMessage({ text })
        setInputValue('')
    }

    return (
        <div className="flex flex-col h-full mx-auto w-full">

            {/* Chat History Area — takes remaining space, scrollable */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-6 pr-2 pb-4 scroll-smooth min-h-0"
            >
                {messages.map((m: any) => (
                    <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`glass-panel border-primary/20 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-[0_0_20px_rgba(19,236,128,0.05)] text-white w-full max-w-4xl
                            ${m.role === 'user'
                                ? 'bg-primary/10 border-primary/40 rounded-tr-sm ml-auto'
                                : 'bg-surface-dark border-border-dark rounded-tl-sm mr-auto'
                            }`}
                        >
                            <div className="flex gap-3 items-center border-b border-border-dark/50 pb-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/40">
                                    {m.role === 'user' ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-primary" />}
                                </div>
                                <h3 className="font-bold text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {m.role === 'user' ? 'Tú' : 'Tali'}
                                </h3>
                            </div>

                            <div className="text-sm text-secondary leading-relaxed mt-2 prose prose-invert max-w-none">
                                <ReactMarkdown
                                    components={{
                                        code({ node, inline, className, children, ...props }: any) {
                                            const match = /language-(\w+)/.exec(className || '')
                                            const language = match ? match[1] : ''

                                            // Intercept JSON code blocks to render charts
                                            if (!inline && language === 'json') {
                                                try {
                                                    const data = JSON.parse(String(children).replace(/\n$/, ''))
                                                    const chartType = data?.type
                                                    const isChart = (chartType === 'chart' || chartType === 'bar' || chartType === 'pie') && Array.isArray(data?.data)

                                                    if (isChart && chartType === 'pie') {
                                                        return (
                                                            <div className="my-6 p-4 bg-background-dark/50 rounded-xl border border-border-dark">
                                                                <h4 className="text-primary font-bold mb-4 text-center">{data.title}</h4>
                                                                <div className="h-[300px] w-full">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <PieChart>
                                                                            <Pie
                                                                                data={data.data}
                                                                                dataKey="value"
                                                                                nameKey="name"
                                                                                cx="50%"
                                                                                cy="50%"
                                                                                outerRadius={100}
                                                                                label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                                                labelLine={true}
                                                                            >
                                                                                {data.data.map((_: any, index: number) => (
                                                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                                                ))}
                                                                            </Pie>
                                                                            <Tooltip
                                                                                contentStyle={{ backgroundColor: '#1c2721', borderColor: '#283930', color: '#fff', borderRadius: '8px' }}
                                                                                formatter={formatTooltipValue}
                                                                            />
                                                                            <Legend
                                                                                wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
                                                                            />
                                                                        </PieChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                            </div>
                                                        )
                                                    }

                                                    if (isChart) {
                                                        return (
                                                            <div className="my-6 p-4 bg-background-dark/50 rounded-xl border border-border-dark">
                                                                <h4 className="text-primary font-bold mb-4 text-center">{data.title}</h4>
                                                                <div className="h-[250px] w-full">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <BarChart data={data.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                                            <CartesianGrid strokeDasharray="3 3" stroke="#283930" />
                                                                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatChartValue} />
                                                                            <Tooltip
                                                                                cursor={{ fill: '#13ec80', opacity: 0.1 }}
                                                                                contentStyle={{ backgroundColor: '#1c2721', borderColor: '#283930', color: '#fff', borderRadius: '8px' }}
                                                                                itemStyle={{ color: '#13ec80' }}
                                                                                formatter={formatTooltipValue}
                                                                            />
                                                                            <Bar dataKey="value" fill="#13ec80" radius={[4, 4, 0, 0]} />
                                                                        </BarChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                } catch (e) {
                                                    // Fallback to normal code block if JSON parsing fails or schema doesn't match
                                                }
                                            }

                                            return (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            )
                                        }
                                    }}
                                >
                                    {getMessageText(m)}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area — naturally at the bottom, no fixed positioning */}
            <div className="shrink-0 pt-4 pb-2 bg-gradient-to-t from-background-dark via-background-dark to-transparent">
                <form onSubmit={handleFormSubmit} className="relative group">
                    <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex items-center bg-surface-dark border border-border-dark rounded-2xl shadow-xl overflow-hidden glass-panel pr-2">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    const form = e.currentTarget.form
                                    if (form) form.requestSubmit()
                                }
                            }}
                            disabled={isLoading}
                            className="flex-1 bg-transparent px-6 py-4 outline-none text-white text-sm placeholder:text-secondary resize-none min-h-[56px] max-h-32 focus:ring-0 focus-visible:ring-0"
                            placeholder={isLoading ? "Tali está pensando..." : "Escribe tu mensaje aquí... (Enter para enviar)"}
                            rows={1}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            className="h-10 w-10 bg-primary hover:bg-primary/90 text-background-dark rounded-xl flex items-center justify-center shrink-0 mb-2 mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </form>
                <p className="text-center text-[10px] text-secondary mt-3">
                    La IA de Talisto puede cometer errores. Considera verificar la información importante.
                </p>
            </div>
        </div>
    )
}
