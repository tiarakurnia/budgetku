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
        const id = parseInt(params.id);

        await prisma.$transaction(async (tx) => {
            // 1. Hapus semua transaksi yang terkait dengan akun ini
            await tx.transaction.deleteMany({
                where: { accountId: id }
            });

            // 2. Hapus akun tersebut
            await tx.account.delete({
                where: { id: id }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete account error:', error);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}
