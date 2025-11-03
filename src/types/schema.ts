import { FastifySchema } from "fastify";
export type schema = FastifySchema & { tags: string[]; };
