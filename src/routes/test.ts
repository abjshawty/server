import { FastifyPluginCallback } from "fastify";
import { Test as schema } from "../schemas";
import { Test as api } from "../api";

const routes: FastifyPluginCallback = server => {
    server.route({
        method: 'GET',
        url: '/email',
        schema: schema.email,
        handler: api.email
    });
};
export default routes;