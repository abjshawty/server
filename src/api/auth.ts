import { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../utils";

export const sign_up = async (request: FastifyRequest<{ Body: { email: string; password: string; name: string; }; }>, reply: FastifyReply) => {
    const result = await auth.api.signUpEmail({ body: request.body, asResponse: true });
    reply.send({ success: true, message: 'User registered successfully', data: result });
};

export const sign_in = async (request: FastifyRequest<{ Body: { email: string; password: string; }; }>, reply: FastifyReply) => {
    const result = await auth.api.signInEmail({ body: request.body, asResponse: true });
    reply.send({ success: true, message: 'User logged in successfully', data: result });
};

export const sign_out = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await auth.api.signOut({
        asResponse: true,
        headers: request.headers as HeadersInit
    });
    reply.send({ success: true, message: 'User logged out successfully', data: result });
};
