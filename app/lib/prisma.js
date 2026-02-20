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
        // Transform mysql:// to https:// and remove :4000 for the HTTP adapter
        let cleanedUrl = process.env.DATABASE_URL;
        if (cleanedUrl.startsWith('mysql://')) {
            cleanedUrl = cleanedUrl.replace('mysql://', 'https://');
        }
        cleanedUrl = cleanedUrl.replace(':4000', '');

        const connection = connect({ url: cleanedUrl });
        const adapter = new PrismaTiDBCloud(connection);
        prisma = new PrismaClient({ adapter });
    } catch (err) {
        console.error("Failed to initialize Prisma with TiDB adapter:", err);
        throw err;
    }
} else {
    // ... rest of logic
    // ... rest of logic
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }
    prisma = globalForPrisma.prisma;
}

export default prisma;
