import { FastifyInstance } from 'fastify';
import post from './post';
export default function (server: FastifyInstance) {
    server.register(post, { prefix: '/post' });
}
