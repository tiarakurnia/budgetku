import { PrismaClient } from '@prisma/client';
import { connect } from '@tidbcloud/serverless';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';

const globalForPrisma = globalThis;

let prisma;

if (process.env.NODE_ENV === 'production') {
    const connection = connect({ url: process.env.DATABASE_URL });
    const adapter = new PrismaTiDBCloud(connection);
    prisma = new PrismaClient({ adapter });
} else {
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }
    prisma = globalForPrisma.prisma;
}

export default prisma;
