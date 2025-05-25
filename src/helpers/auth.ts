import { FastifyReply, FastifyRequest } from "fastify";
import { Auth } from "../messages";
import { authEnabled } from "../helpers/env";
export default async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        if (!authEnabled) return;
        await request.jwtVerify();
    } catch (error) {
        reply.status(401).send({ statusCode: 401, error: "Unauthorized", message: Auth.fail() });
    }
};