/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const offset = parseInt(searchParams.get('offset') || '0');

        // Validate offset range (-12 to +6)
        if (offset < -12 || offset > 6) {
            return NextResponse.json(
                { error: 'Offset debe estar entre -12 y +6' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set() { },
                    remove() { },
                },
            }
        );

        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { data: userRow } = await supabase
            .from('users')
            .select('company_id, companies(name, industry)')
            .eq('id', authUser.id)
            .single();

        const userData = userRow as any;

        if (!userData?.company_id) {
            return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
        }

        // Calculate target date based on offset
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + offset);

        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

        const isFuture = offset > 0;

        if (isFuture) {
            // Get recent 3 months of sales for projection
            const recent3Months = new Date();
            recent3Months.setMonth(recent3Months.getMonth() - 3);

            const { data: recentSales } = await supabase
                .from('sales')
                .select('amount, created_at')
                .eq('company_id', userData.company_id)
                .gte('created_at', recent3Months.toISOString())
                .lt('created_at', new Date().toISOString());

            const salesArr = (recentSales as any[]) || [];
            const avgMonthlyRevenue = salesArr.length > 0
                ? salesArr.reduce((sum: number, s: any) => sum + (s.amount || 0), 0) / 3
                : 0;

            // Growth rate from last 2 months
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const twoMonthsAgo = new Date();
            twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

            const { data: lmSales } = await supabase
                .from('sales')
                .select('amount')
                .eq('company_id', userData.company_id)
                .gte('created_at', new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString())
                .lt('created_at', new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString());

            const { data: tmaSales } = await supabase
                .from('sales')
                .select('amount')
                .eq('company_id', userData.company_id)
                .gte('created_at', new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 1).toISOString())
                .lt('created_at', new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth() + 1, 0).toISOString());

            const lmRevenue = ((lmSales as any[]) || []).reduce((s: number, r: any) => s + (r.amount || 0), 0);
            const tmaRevenue = ((tmaSales as any[]) || []).reduce((s: number, r: any) => s + (r.amount || 0), 0);

            const growthRate = tmaRevenue > 0 ? ((lmRevenue - tmaRevenue) / tmaRevenue) : 0;

            // Compute COGS for recent 3 months: sum of (quantity * price_cost) for 'salida' transactions
            // joined with products.price_cost. This is the best available expense proxy since there is
            // no dedicated expenses table in the schema.
            // TODO: Add an `expenses` table (or a `unit_cost` column on inventory_transactions) to
            // track non-COGS operating expenses (rent, payroll, utilities, etc.).
            const { data: recentCogs } = await supabase
                .from('inventory_transactions')
                .select('quantity, products(price_cost)')
                .eq('company_id', userData.company_id)
                .eq('type', 'salida')
                .gte('created_at', recent3Months.toISOString())
                .lt('created_at', new Date().toISOString());

            const recentCogsArr = (recentCogs as any[]) || [];
            const totalRecentCogs = recentCogsArr.reduce((sum: number, t: any) => {
                const cost = t.products?.price_cost ?? 0;
                return sum + (t.quantity || 0) * cost;
            }, 0);
            const avgMonthlyCogs = totalRecentCogs / 3;

            // If no COGS data is available (e.g. products lack price_cost), fall back to a
            // conservative industry-agnostic estimate and flag it clearly.
            const hasCogs = totalRecentCogs > 0;
            const projectedRevenue = avgMonthlyRevenue * Math.pow(1 + growthRate, offset);
            const projectedExpenses = hasCogs
                ? avgMonthlyCogs * Math.pow(1 + growthRate, offset)
                : projectedRevenue * 0.6; // Fallback estimate — populate price_cost on products to get real COGS
            const projectedProfit = projectedRevenue - projectedExpenses;
            const projectedMargin = projectedRevenue > 0 ? (projectedProfit / projectedRevenue) * 100 : 0;

            return NextResponse.json({
                period: targetDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
                revenue: Math.round(projectedRevenue),
                expenses: Math.round(projectedExpenses),
                profit: Math.round(projectedProfit),
                margin: parseFloat(projectedMargin.toFixed(1)),
                revenueChange: growthRate * 100,
                expensesChange: growthRate * 100,
                profitChange: growthRate * 100,
                marginChange: 0,
                growthRate,
                avg3months: Math.round(avgMonthlyRevenue),
                companyName: userData.companies?.name || '',
                industry: userData.companies?.industry || 'general',
                isProjection: true,
                isEstimatedExpenses: true,
            });
        }

        // Historical or current month
        const { data: sales } = await supabase
            .from('sales')
            .select('amount, created_at')
            .eq('company_id', userData.company_id)
            .gte('created_at', startOfMonth.toISOString())
            .lte('created_at', endOfMonth.toISOString());

        const salesArr = (sales as any[]) || [];
        const revenue = salesArr.reduce((s: number, r: any) => s + (r.amount || 0), 0);

        // Compute COGS: sum of (quantity * price_cost) for 'salida' inventory transactions in this period.
        // This is the best available expense proxy since there is no dedicated expenses table in the schema.
        // TODO: Add an `expenses` table (or a `unit_cost` column on inventory_transactions) to
        // track non-COGS operating expenses (rent, payroll, utilities, etc.).
        const { data: cogsData } = await supabase
            .from('inventory_transactions')
            .select('quantity, products(price_cost)')
            .eq('company_id', userData.company_id)
            .eq('type', 'salida')
            .gte('created_at', startOfMonth.toISOString())
            .lte('created_at', endOfMonth.toISOString());

        const cogsArr = (cogsData as any[]) || [];
        const cogs = cogsArr.reduce((sum: number, t: any) => {
            const cost = t.products?.price_cost ?? 0;
            return sum + (t.quantity || 0) * cost;
        }, 0);

        // If no COGS data is available (e.g. products lack price_cost), fall back to a
        // conservative estimate and flag it clearly via isEstimatedExpenses.
        const hasCogs = cogs > 0;
        const expenses = hasCogs ? cogs : revenue * 0.6;
        const profit = revenue - expenses;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        // Previous month for comparison
        const prevMonth = new Date(targetDate);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        const prevStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
        const prevEnd = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);

        const { data: prevSales } = await supabase
            .from('sales')
            .select('amount')
            .eq('company_id', userData.company_id)
            .gte('created_at', prevStart.toISOString())
            .lte('created_at', prevEnd.toISOString());

        const prevArr = (prevSales as any[]) || [];
        const prevRevenue = prevArr.reduce((s: number, r: any) => s + (r.amount || 0), 0);

        const { data: prevCogsData } = await supabase
            .from('inventory_transactions')
            .select('quantity, products(price_cost)')
            .eq('company_id', userData.company_id)
            .eq('type', 'salida')
            .gte('created_at', prevStart.toISOString())
            .lte('created_at', prevEnd.toISOString());

        const prevCogsArr = (prevCogsData as any[]) || [];
        const prevCogs = prevCogsArr.reduce((sum: number, t: any) => {
            const cost = t.products?.price_cost ?? 0;
            return sum + (t.quantity || 0) * cost;
        }, 0);

        const prevExpenses = prevCogs > 0 ? prevCogs : prevRevenue * 0.6;
        const prevProfit = prevRevenue - prevExpenses;
        const prevMargin = prevRevenue > 0 ? (prevProfit / prevRevenue) * 100 : 0;

        const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
        const expensesChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;
        const profitChange = prevProfit > 0 ? ((profit - prevProfit) / prevProfit) * 100 : 0;
        const marginChange = margin - prevMargin;
        const growthRate = revenueChange / 100;

        // 3-month average
        const threeMonthsAgo = new Date(targetDate);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const { data: recent3m } = await supabase
            .from('sales')
            .select('amount')
            .eq('company_id', userData.company_id)
            .gte('created_at', threeMonthsAgo.toISOString())
            .lt('created_at', startOfMonth.toISOString());

        const recent3mArr = (recent3m as any[]) || [];
        const avg3months = recent3mArr.length > 0
            ? recent3mArr.reduce((s: number, r: any) => s + (r.amount || 0), 0) / 3
            : revenue;

        return NextResponse.json({
            period: targetDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
            revenue: Math.round(revenue),
            expenses: Math.round(expenses),
            profit: Math.round(profit),
            margin: parseFloat(margin.toFixed(1)),
            revenueChange: parseFloat(revenueChange.toFixed(1)),
            expensesChange: parseFloat(expensesChange.toFixed(1)),
            profitChange: parseFloat(profitChange.toFixed(1)),
            marginChange: parseFloat(marginChange.toFixed(1)),
            growthRate: parseFloat(growthRate.toFixed(3)),
            avg3months: Math.round(avg3months),
            companyName: userData.companies?.name || '',
            industry: userData.companies?.industry || 'general',
            isProjection: false,
            isEstimatedExpenses: !hasCogs,
        });

    } catch (error) {
        console.error('Financial data API error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
