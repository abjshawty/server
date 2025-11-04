import { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../utils";

export const sign_up = async (request: FastifyRequest<{ Body: { email: string; password: string; name: string; }; }>, reply: FastifyReply) => {
    const result = await auth.api.signUpEmail({ body: request.body, asResponse: true });

    if (!result.ok) {
        const errorData = await result.json();
        return reply.status(result.status).send({ success: false, message: 'Failed to register user', error: errorData });
    }

    const data = await result.json();
    reply.send({ success: true, message: 'User registered successfully', data });
};

export const sign_in = async (request: FastifyRequest<{ Body: { email: string; password: string; }; }>, reply: FastifyReply) => {
    const result = await auth.api.signInEmail({ body: request.body, asResponse: true });

    if (!result.ok) {
        const errorData = await result.json();
        return reply.status(result.status).send({ success: false, message: 'User not found in database', error: errorData });
    }

    const data = await result.json();
    reply.send({ success: true, message: 'User logged in successfully', data });
};

export const sign_out = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await auth.api.signOut({
        asResponse: true,
        headers: request.headers as HeadersInit
    });

    if (!result.ok) {
        const errorData = await result.json();
        return reply.status(result.status).send({ success: false, message: 'Failed to log out user', error: errorData });
    }

    const data = await result.json();
    reply.send({ success: true, message: 'User logged out successfully', data });
};
