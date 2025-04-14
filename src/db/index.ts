import { Database as messages } from "../messages";
import { PrismaClient } from "@prisma/client";
export const client = new PrismaClient();
export const die = () => {
    client.$disconnect();
    messages.die();
};