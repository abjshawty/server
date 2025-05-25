import { FastifyPluginCallback, FastifyRequest, FastifyReply } from "fastify";
import { Song as Build } from "@prisma/client";
import { Song as Service } from "../services";
import { Song as Schema } from "../schemas";
import { auth } from "../utils";

const routes: FastifyPluginCallback = (server) => {
    // Create
    server.route({
        method: "POST",
        url: "/",
        schema: Schema.create,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Body: Build }>, reply: FastifyReply) => {
            const result = await Service.create(request.body);
            reply.send({ data: result });
        }
    });

    // Get All
    server.route({
        method: "GET",
        url: "/",
        schema: Schema.search,
        preHandler: auth,
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const result = await Service.getAll();
            reply.send({ data: result });
        }
    });

    // Get One
    server.route({
        method: "GET",
        url: "/:id",
        schema: Schema.getOrDelete,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const result = await Service.getById(request.params.id);
            if (!result) {
                return reply.status(404).send({ error: 'Song not found' });
            }
            reply.send({ data: result });
        }
    });

    // Update
    server.route({
        method: "PUT",
        url: "/:id",
        schema: Schema.update,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string }, Body: Partial<Build> }>, reply: FastifyReply) => {
            const result = await Service.update(request.params.id, request.body);
            if (!result) {
                return reply.status(404).send({ error: 'Song not found' });
            }
            reply.send({ data: result });
        }
    });

    // Delete
    server.route({
        method: "DELETE",
        url: "/:id",
        schema: Schema.getOrDelete,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const result = await Service.delete(request.params.id);
            if (!result) {
                return reply.status(404).send({ error: 'Song not found' });
            }
            reply.send({ data: { message: 'Song deleted successfully' } });
        }
    });
};

export default routes;
