import { FastifyInstance } from 'fastify';
import auth from './auth';
import post from './post';
export default function (server: FastifyInstance) {
    server.register(auth, { prefix: '/auth' });
    server.register(post, { prefix: '/post' });
}
