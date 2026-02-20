import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const accounts = await prisma.account.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(accounts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const account = await prisma.account.create({
            data: {
                name: data.name,
                type: data.type,
                icon: data.icon || '💰',
                balance: data.balance || 0,
                color: data.color || '#7c2dff'
            }
        });
        return NextResponse.json(account, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
}
