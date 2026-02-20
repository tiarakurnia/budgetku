import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const data = await request.json();

        const goal = await prisma.savingsGoal.update({
            where: { id: parseInt(id) },
            data: {
                savedAmt: data.savedAmt,
                monthlyAmt: data.monthlyAmt,
                targetAmt: data.targetAmt,
                name: data.name
            }
        });

        return NextResponse.json(goal);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update savings goal' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await prisma.savingsGoal.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete savings goal' }, { status: 500 });
    }
}
