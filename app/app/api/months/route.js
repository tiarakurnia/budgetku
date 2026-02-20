import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const months = await prisma.month.findMany({
            include: {
                transactions: true
            },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ]
        });

        // Calculate income and expense for each month
        const result = months.map(m => {
            const income = m.transactions
                .filter(t => t.type === 'income')
                .reduce((acc, t) => acc + t.amount, 0);
            const expense = m.transactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);

            // Remove transactions from response to keep it small
            const { transactions, ...monthData } = m;
            return {
                ...monthData,
                income,
                expense
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("API MONTHS GET ERROR:", error);
        return NextResponse.json({ error: error.message || 'Failed to fetch months' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        // Check if month already exists
        const existing = await prisma.month.findUnique({
            where: {
                year_month: {
                    year: data.year,
                    month: data.month
                }
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Month already exists' }, { status: 400 });
        }

        const month = await prisma.month.create({
            data: {
                name: data.name,
                year: data.year,
                month: data.month,
                startBalance: data.startBalance || 0,
                budgetLimit: data.budgetLimit || 0,
                status: 'active'
            }
        });

        return NextResponse.json(month, { status: 201 });
    } catch (error) {
        console.error("API MONTHS POST ERROR:", error);
        return NextResponse.json({ error: error.message || 'Failed to create month' }, { status: 500 });
    }
}
