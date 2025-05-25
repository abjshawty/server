import { FastifyPluginCallback, FastifyReply, FastifyRequest } from "fastify";
import { Example as Build } from "@prisma/client";
import { Example as Service } from "../services";
import { Example as Schema } from "../schemas";
import { auth } from "../utils";
const routes: FastifyPluginCallback = (server) => {
    server.route({
        method: "POST",
        url: "/",
        schema: Schema.create,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Body: Build; }>, reply: FastifyReply) => {
            const result = await Service.create(request.body);
            reply.send({ data: result });
        }
    });

    server.route({
        method: "GET",
        url: "/export/:format",
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { format: string; }; }>, reply: FastifyReply) => {
            await Service.export(request.params.format, reply);
        }
    });

    server.route({
        method: "GET",
        url: "/search",
        schema: Schema.search,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Querystring: { name: string; }; }>, reply: FastifyReply) => {
            const result = await Service.search(request.query, { include: { ExampleAttach: true } });
            reply.send({ data: result });
        }
    });

    server.route({
        method: "GET",
        url: "/find",
        schema: Schema.find,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Querystring: { name: string; }; }>, reply: FastifyReply) => {
            const result = await Service.find(request.query);
            reply.send({ data: result });
        }
    });

    server.route({
        method: "GET",
        url: "/:id",
        schema: Schema.getOrDelete,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string; }; }>, reply: FastifyReply) => {
            const result = await Service.getById(request.params.id);
            reply.send({ data: result });
        }
    });

    server.route({
        method: "GET",
        url: "/",
        preHandler: auth,
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const result = await Service.getAll();
            reply.send({ data: result });
        }
    });

    server.route({
        method: "PUT",
        url: "/:id",
        schema: Schema.update,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string; }; Body: Build; }>, reply: FastifyReply) => {
            const result = await Service.update(request.params.id, request.body);
            reply.send({ data: result });
        }
    });

    server.route({
        method: "DELETE",
        url: "/:id",
        schema: Schema.getOrDelete,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string; }; }>, reply: FastifyReply) => {
            const result = await Service.delete(request.params.id);
            reply.send({ data: result });
        }
    });
};
export default routes;