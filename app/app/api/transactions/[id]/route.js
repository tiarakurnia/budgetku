import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
    try {
        const data = await request.json();
        const result = await prisma.$transaction(async (tx) => {
            // 1. Dapatkan transaksi lama untuk rollback saldo
            const oldTx = await tx.transaction.findUnique({ where: { id: parseInt(params.id) } });
            if (!oldTx) throw new Error('Transaction not found');

            // 2. Rollback saldo dari akun lama
            await tx.account.update({
                where: { id: oldTx.accountId },
                data: {
                    balance: oldTx.type === 'income'
                        ? { decrement: oldTx.amount }
                        : { increment: oldTx.amount }
                }
            });

            // 3. Update transaksi dengan data baru
            const newTx = await tx.transaction.update({
                where: { id: parseInt(params.id) },
                data: {
                    name: data.name,
                    amount: data.amount,
                    type: data.type,
                    note: data.note,
                    date: data.date ? new Date(data.date) : undefined,
                    categoryId: data.categoryId,
                    accountId: data.accountId
                }
            });

            // 4. Update saldo akun baru/sama dengan jumlah baru
            await tx.account.update({
                where: { id: newTx.accountId },
                data: {
                    balance: newTx.type === 'income'
                        ? { increment: newTx.amount }
                        : { decrement: newTx.amount }
                }
            });

            return newTx;
        });

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Cari transaksi yang akan dihapus
            const oldTx = await tx.transaction.findUnique({ where: { id: parseInt(params.id) } });
            if (!oldTx) throw new Error('Transaction not found');

            // 2. Rollback (kembalikan) saldo akun
            await tx.account.update({
                where: { id: oldTx.accountId },
                data: {
                    balance: oldTx.type === 'income'
                        ? { decrement: oldTx.amount }
                        : { increment: oldTx.amount }
                }
            });

            // 3. Hapus transaksi
            await tx.transaction.delete({ where: { id: parseInt(params.id) } });

            return true;
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
    }
}
