import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
]

async function main() {
    console.log('Seeding initial data...')

    // Insert default categories
    for (const cat of defaultCategories) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
        })
    }

    // Insert initial setting
    await prisma.setting.upsert({
        where: { key: 'currency' },
        update: {},
        create: { key: 'currency', value: 'IDR' }
    })

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
