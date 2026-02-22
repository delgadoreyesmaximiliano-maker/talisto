/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useChat } from 'ai/react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

interface ChatInterfaceProps {
    contextData: any
}

export function ChatInterface({ contextData }: ChatInterfaceProps) {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
        body: {
            data: contextData
        },
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: '¡Hola! 🇨🇱 Soy tu asistente de inventario y ventas con Inteligencia Artificial. He revisado tus datos actuales. ¿En qué te puedo ayudar hoy? ¿Quieres saber qué productos están con stock bajo o qué se ha vendido más?'
            }
        ]
    })

    // Auto-scroll to bottom
    const scrollRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    return (
        <Card className="flex flex-col h-[600px] border-2 border-primary/10 shadow-lg">
            <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Asistente de Talisto AI
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea ref={scrollRef} className="h-full pr-4">
                    <div className="flex flex-col gap-4 pb-4">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {messages.map((m: any) => (
                            <div
                                key={m.id}
                                className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                    }`}
                            >
                                <div className={`p-2 rounded-full flex-shrink-0 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-amber-500" />}
                                </div>
                                <div
                                    className={`rounded-xl px-4 py-3 text-sm max-w-[85%] ${m.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                        : 'bg-muted/50 border text-foreground rounded-tl-sm prose prose-sm prose-p:leading-snug max-w-none dark:prose-invert'
                                        }`}
                                >
                                    {m.role === 'user' ? (
                                        m.content
                                    ) : (
                                        <ReactMarkdown>{m.content}</ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-full bg-muted flex-shrink-0">
                                    <Bot className="w-4 h-4 text-amber-500 animate-pulse" />
                                </div>
                                <div className="bg-muted/50 border text-muted-foreground rounded-xl rounded-tl-sm px-4 py-3 text-sm">
                                    <span className="animate-pulse">Analizando tus datos...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t bg-muted/10">
                <form
                    onSubmit={handleSubmit}
                    className="flex w-full items-center space-x-2"
                >
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Escribe tu consulta aquí..."
                        className="flex-1 bg-background"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Enviar</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
