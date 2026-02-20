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
        // TiDB Serverless adapter uses HTTP (443). 
        // If the URL has :4000, the internal fetch might try to hit port 4000 via HTTPS which fails.
        const cleanedUrl = process.env.DATABASE_URL.replace(':4000', '');
        const connection = connect({ url: cleanedUrl });
        const adapter = new PrismaTiDBCloud(connection);
        prisma = new PrismaClient({ adapter });
    } catch (err) {
        console.error("Failed to initialize Prisma with TiDB adapter:", err);
        throw err;
    }
} else {
    // ... rest of logic
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }
    prisma = globalForPrisma.prisma;
}

export default prisma;
