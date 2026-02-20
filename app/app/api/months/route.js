import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const months = await prisma.month.findMany({
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ]
        });
        return NextResponse.json(months);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch months' }, { status: 500 });
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
        return NextResponse.json({ error: 'Failed to create month' }, { status: 500 });
    }
}
