import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const defaultCategories = [
    { name: 'Makanan', emoji: '🍔', type: 'expense' },
    { name: 'Transport', emoji: '🚗', type: 'expense' },
    { name: 'Belanja', emoji: '🛒', type: 'expense' },
    { name: 'Tagihan', emoji: '⚡', type: 'expense' },
    { name: 'Hiburan', emoji: '🎬', type: 'expense' },
    { name: 'Kesehatan', emoji: '💊', type: 'expense' },
    { name: 'Pendidikan', emoji: '📚', type: 'expense' },
    { name: 'Gaji', emoji: '💼', type: 'income' },
    { name: 'Investasi', emoji: '📈', type: 'income' },
    { name: 'Lainnya', emoji: '📦', type: 'expense' },
];

export async function POST() {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Wipe all data
            await tx.transaction.deleteMany({});
            await tx.budget.deleteMany({});
            await tx.savingsGoal.deleteMany({});
            await tx.debt.deleteMany({});
            await tx.account.deleteMany({});
            await tx.category.deleteMany({});
            await tx.month.deleteMany({});

            // 2. Re-seed categories
            for (const cat of defaultCategories) {
                await tx.category.create({ data: cat });
            }

            // 3. Re-seed initial account
            await tx.account.create({
                data: {
                    id: 1,
                    name: 'Dompet Utama',
                    type: 'Cash',
                    icon: '👛',
                    balance: 1000000,
                    color: '#7c2dff'
                }
            });

            // 4. Re-seed current month
            const now = new Date();
            const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

            await tx.month.create({
                data: {
                    name: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
                    year: now.getFullYear(),
                    month: now.getMonth() + 1,
                    startBalance: 1000000,
                    budgetLimit: 0,
                    status: 'active'
                }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reset data error:', error);
        return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 });
    }
}
