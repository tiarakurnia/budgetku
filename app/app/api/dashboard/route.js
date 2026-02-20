import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const monthId = searchParams.get('monthId');

        if (!monthId) {
            return NextResponse.json({ error: 'monthId is required' }, { status: 400 });
        }

        const mId = parseInt(monthId);

        // Run aggregations in parallel
        const [month, accounts, txs, budgets] = await Promise.all([
            prisma.month.findUnique({ where: { id: mId } }),
            prisma.account.findMany(),
            prisma.transaction.findMany({
                where: { monthId: mId },
                include: { category: true, account: true },
                orderBy: { date: 'desc' }
            }),
            prisma.budget.findMany({
                where: { monthId: mId },
                include: { category: true }
            })
        ]);

        if (!month) {
            return NextResponse.json({ error: 'Month not found' }, { status: 404 });
        }

        const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
        const income = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        // Budget usage per category
        const categoryUsage = budgets.map(b => {
            const spent = txs
                .filter(t => t.categoryId === b.categoryId && t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);
            return {
                ...b,
                spent,
                percentage: b.limit > 0 ? (spent / b.limit) * 100 : 0
            };
        });

        return NextResponse.json({
            month,
            totalBalance,
            income,
            expense,
            remainingBudget: month.budgetLimit > 0 ? month.budgetLimit - expense : 0,
            usagePerc: month.budgetLimit > 0 ? (expense / month.budgetLimit) * 100 : 0,
            recentTransactions: txs.slice(0, 5),
            categoryUsage
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}
