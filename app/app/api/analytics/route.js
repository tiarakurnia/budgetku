import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const monthIdParam = searchParams.get('monthId');

        // 1. Determine Month ID
        let mid;
        if (monthIdParam) {
            mid = parseInt(monthIdParam);
        } else {
            const latestMonth = await prisma.month.findFirst({
                orderBy: { id: 'desc' }
            });
            if (!latestMonth) return NextResponse.json({ error: 'No data' }, { status: 404 });
            mid = latestMonth.id;
        }

        const currentMonth = await prisma.month.findUnique({ where: { id: mid } });

        // 2. Top Categories (Expenses only)
        const categories = await prisma.transaction.groupBy({
            by: ['categoryId'],
            _sum: { amount: true },
            where: { monthId: mid, type: 'expense' },
            orderBy: { _sum: { amount: 'desc' } }
        });

        const categoryDetails = await prisma.category.findMany({
            where: { id: { in: categories.map(c => c.categoryId) } }
        });

        const topCategories = categories.map(c => {
            const cat = categoryDetails.find(cd => cd.id === c.categoryId);
            return {
                name: cat?.name || 'Unknown',
                amount: c._sum.amount || 0,
                emoji: cat?.emoji || '📁',
                color: 'var(--accent-orange)' // Default, can be dynamic
            };
        });

        // 3. Weekly Data
        // Simple heuristic: divide month by 4 weeks based on date
        const transactions = await prisma.transaction.findMany({
            where: { monthId: mid, type: 'expense' },
            select: { amount: true, date: true }
        });

        const weeklyTotals = [0, 0, 0, 0];
        transactions.forEach(t => {
            const day = new Date(t.date).getDate();
            const weekIdx = Math.min(3, Math.floor((day - 1) / 7));
            weeklyTotals[weekIdx] += t.amount;
        });

        const weeklyData = weeklyTotals.map((amt, i) => ({
            week: `Minggu ${i + 1}`,
            amount: amt
        }));

        // 4. Monthly Comparison (Last 6 months)
        const last6Months = await prisma.month.findMany({
            take: 6,
            orderBy: { id: 'desc' },
            include: { transactions: true }
        });

        const monthlyComparison = last6Months.map(m => {
            const income = m.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const expense = m.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            return {
                month: m.name.split(' ')[0],
                income,
                expense
            };
        }).reverse();

        // 5. Stats
        const totalIncome = last6Months[0]?.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0;
        const totalExpense = last6Months[0]?.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0;

        // Count days in month for daily average
        const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
        const dailyAvg = totalExpense / daysInMonth;
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

        return NextResponse.json({
            topCategories,
            weeklyData,
            monthlyComparison,
            stats: {
                dailyAvg,
                topCategory: topCategories[0]?.name || 'N/A',
                topCategoryAmount: topCategories[0]?.amount || 0,
                transactionCount: transactions.length,
                savingsRate: Math.max(0, savingsRate)
            }
        });

    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
