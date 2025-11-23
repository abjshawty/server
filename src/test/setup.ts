/**
 * Setup file for jest
 */

import { PrismaClient } from "@/db/orm/client";
import adapter from "@/db/adapter";

const prisma = new PrismaClient({ adapter });

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});
