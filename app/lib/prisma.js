import { PrismaClient } from '@prisma/client';
import { connect } from '@tidbcloud/serverless';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';

const globalForPrisma = globalThis;

let prisma;

if (process.env.NODE_ENV === 'production') {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined in production environment variables.");
    }
    try {
        const connection = connect({ url: process.env.DATABASE_URL });
        const adapter = new PrismaTiDBCloud(connection);
        prisma = new PrismaClient({ adapter });
    } catch (err) {
        console.error("Failed to initialize Prisma with TiDB adapter:", err);
        throw err;
    }
} else {
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }
    prisma = globalForPrisma.prisma;
}

export default prisma;
