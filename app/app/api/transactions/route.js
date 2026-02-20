import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const monthId = searchParams.get('monthId');
        const type = searchParams.get('type');

        let whereClause = {};
        if (monthId) whereClause.monthId = parseInt(monthId);
        if (type && type !== 'all') whereClause.type = type;

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: {
                account: true,
                category: true,
                month: true
            },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(transactions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        // Periksa status bulan
        const month = await prisma.month.findUnique({ where: { id: data.monthId } });
        if (!month || month.status === 'closed') {
            return NextResponse.json({ error: 'Cannot add transaction to a closed or invalid month' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Buat transaksi
            const transaction = await tx.transaction.create({
                data: {
                    name: data.name,
                    amount: data.amount,
                    type: data.type,
                    note: data.note,
                    date: new Date(data.date),
                    monthId: data.monthId,
                    accountId: data.accountId,
                    categoryId: data.categoryId
                }
            });

            // 2. Update saldo akun (Jika income saldo bertambah, jika expense saldo berkurang)
            await tx.account.update({
                where: { id: data.accountId },
                data: {
                    balance: data.type === 'income'
                        ? { increment: data.amount }
                        : { decrement: data.amount }
                }
            });

            return transaction;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}
