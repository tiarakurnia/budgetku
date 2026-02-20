import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const monthId = searchParams.get('monthId');

        if (!monthId) {
            return NextResponse.json({ error: 'Month ID is required' }, { status: 400 });
        }

        const mid = parseInt(monthId);

        // Fetch all budgets for this month
        const budgets = await prisma.budget.findMany({
            where: { monthId: mid },
            include: { category: true }
        });

        // Fetch transactions for this month to calculate spent amount
        const transactions = await prisma.transaction.findMany({
            where: { monthId: mid, type: 'expense' }
        });

        // Aggregate spent amount per category
        const spentMap = transactions.reduce((acc, tx) => {
            acc[tx.categoryId] = (acc[tx.categoryId] || 0) + tx.amount;
            return acc;
        }, {});

        // Fetch all categories to show categories even without budget set
        const allCategories = await prisma.category.findMany();

        const result = allCategories.map(cat => {
            const budget = budgets.find(b => b.categoryId === cat.id);
            return {
                id: cat.id,
                name: cat.name,
                emoji: cat.emoji,
                limit: budget ? budget.limit : 0,
                spent: spentMap[cat.id] || 0,
                percentage: budget && budget.limit > 0 ? ((spentMap[cat.id] || 0) / budget.limit) * 100 : 0
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        // Upsert budget to avoid unique constraint violations
        const budget = await prisma.budget.upsert({
            where: {
                monthId_categoryId: {
                    monthId: parseInt(data.monthId),
                    categoryId: parseInt(data.categoryId)
                }
            },
            update: { limit: parseFloat(data.limit) },
            create: {
                monthId: parseInt(data.monthId),
                categoryId: parseInt(data.categoryId),
                limit: parseFloat(data.limit)
            }
        });

        return NextResponse.json(budget, { status: 201 });
    } catch (error) {
        console.error('Error creating budget limit:', error);
        return NextResponse.json({ error: 'Failed to create budget limit' }, { status: 500 });
    }
}
