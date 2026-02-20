import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const { fromAccountId, toAccountId, amount } = await request.json();

        if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid transfer details' }, { status: 400 });
        }

        if (fromAccountId === toAccountId) {
            return NextResponse.json({ error: 'Cannot transfer to the same account' }, { status: 400 });
        }

        // Transaction ensures both operations succeed or fail together
        const result = await prisma.$transaction(async (tx) => {
            // 1. Decrease fromAccount
            const fromAccount = await tx.account.update({
                where: { id: fromAccountId },
                data: { balance: { decrement: amount } }
            });

            // 2. Increase toAccount
            const toAccount = await tx.account.update({
                where: { id: toAccountId },
                data: { balance: { increment: amount } }
            });

            return { fromAccount, toAccount };
        });

        return NextResponse.json({ success: true, result }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Transfer failed' }, { status: 500 });
    }
}
