import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const month = await prisma.month.findUnique({
            where: { id: parseInt(params.id) },
            include: {
                transactions: true,
                budgets: true
            }
        });
        if (!month) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(month);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch month' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const data = await request.json();
        const month = await prisma.month.update({
            where: { id: parseInt(params.id) },
            data
        });
        return NextResponse.json(month);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update month' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await prisma.month.delete({
            where: { id: parseInt(params.id) }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete month' }, { status: 500 });
    }
}
