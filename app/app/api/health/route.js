import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Test basic query
        const result = await prisma.$queryRaw`SELECT 1 as health`;

        // Handle BigInt serialization for JSON
        const serializedResult = JSON.parse(JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({
            status: 'ok',
            database: 'connected',
            node_env: process.env.NODE_ENV,
            has_url: !!process.env.DATABASE_URL,
            result: serializedResult
        });
    } catch (error) {
        console.error("Health check failed:", error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack,
            has_url: !!process.env.DATABASE_URL
        }, { status: 500 });
    }
}
