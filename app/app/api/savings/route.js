import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const goals = await prisma.savingsGoal.findMany({
            orderBy: { deadline: 'asc' }
        });
        return NextResponse.json(goals);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch savings goals' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const goal = await prisma.savingsGoal.create({
            data: {
                name: data.name,
                targetAmt: data.targetAmt,
                savedAmt: data.savedAmt || 0,
                monthlyAmt: data.monthlyAmt || 0,
                deadline: new Date(data.deadline),
                icon: data.icon || '🐷',
                color: data.color || '#00d9a6'
            }
        });
        return NextResponse.json(goal, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create savings goal' }, { status: 500 });
    }
}
