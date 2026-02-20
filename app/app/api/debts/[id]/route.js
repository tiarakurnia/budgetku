import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const data = await request.json();

        const debt = await prisma.debt.update({
            where: { id: parseInt(id) },
            data: {
                paidAmount: data.paidAmount,
                monthlyPay: data.monthlyPay,
                totalAmount: data.totalAmount,
                name: data.name,
                lender: data.lender
            }
        });

        return NextResponse.json(debt);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update debt' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await prisma.debt.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete debt' }, { status: 500 });
    }
}
