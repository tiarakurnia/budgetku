import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const debts = await prisma.debt.findMany();
        return NextResponse.json(debts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch debts' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const debt = await prisma.debt.create({
            data: {
                name: data.name,
                lender: data.lender,
                totalAmount: data.totalAmount,
                paidAmount: data.paidAmount || 0,
                monthlyPay: data.monthlyPay || 0,
                icon: data.icon || '📋',
                color: data.color || '#00c2ff'
            }
        });
        return NextResponse.json(debt, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create debt' }, { status: 500 });
    }
}
