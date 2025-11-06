import { FastifyPluginCallback } from "fastify";
import { Post as schema } from "../schemas";
import { Post as api } from "../api";
import { imageKit } from "../utils";

const routes: FastifyPluginCallback = server => {
    server.route({
        method: 'POST',
        url: '/',
        schema: schema.create,
        // preHandler: auth,
        handler: api.create
    });

    server.route({
        method: 'GET',
        url: '/',
        schema: schema.list,
        // preHandler: auth,
        handler: api.list
    });

    server.route({
        method: 'GET',
        url: '/:id',
        schema: schema.read,
        // preHandler: auth,
        handler: api.read
    });

    server.route({
        method: 'PUT',
        url: '/:id',
        schema: schema.update,
        // preHandler: auth,
        handler: api.update
    });

    server.route({
        method: 'DELETE',
        url: '/:id',
        schema: schema.recycle,
        // preHandler: auth,
        handler: api.recycle
    });
    server.route({
        method: 'POST',
        url: '/upload',
        schema: schema.upload,
        // preHandler: auth,
        handler: api.upload
    });
};
export default routes;