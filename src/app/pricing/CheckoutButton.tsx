'use client';

import { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutButtonProps {
    plan: string;
    price: number;
    isPrimary?: boolean;
}

const PLAN_KEY: Record<string, string> = {
    'Básico': 'basico',
    'Pro': 'pro',
}

export default function CheckoutButton({ plan, isPrimary }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: PLAN_KEY[plan] ?? plan.toLowerCase() }),
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || 'Error al iniciar el pago');
                setLoading(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Error de red. Intenta de nuevo.');
            setLoading(false);
        }
    };

    if (isPrimary) {
        return (
            <button 
                onClick={handleCheckout} 
                disabled={loading}
                className="btn-3d flex justify-center items-center gap-2 w-full text-center px-6 py-3.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-75 disabled:cursor-not-allowed hover:scale-[1.02]" 
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.35)' }}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-4 h-4"/> Pagar {plan} con Mercado Pago</>}
            </button>
        );
    }

    return (
        <button 
            onClick={handleCheckout} 
            disabled={loading}
            className="flex justify-center items-center gap-2 w-full text-center px-6 py-3.5 text-sm font-semibold text-white rounded-xl transition-all hover:border-indigo-400/40 hover:text-indigo-300 disabled:opacity-75 disabled:cursor-not-allowed hover:bg-white/5 active:scale-95" 
            style={{ border: '1px solid rgba(255,255,255,0.2)' }}
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-4 h-4 flex-shrink-0"/> Pagar {plan}</>}
        </button>
    );
}
