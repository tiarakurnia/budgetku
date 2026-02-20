import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
    try {
        const data = await request.json();
        const account = await prisma.account.update({
            where: { id: parseInt(params.id) },
            data
        });
        return NextResponse.json(account);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await prisma.account.delete({
            where: { id: parseInt(params.id) }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}
