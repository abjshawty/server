import { FastifyPluginCallback } from "fastify";
import { Auth as schema } from "../schemas";
import { Auth as api } from "../api";

const routes: FastifyPluginCallback = server => {
    server.route({
        method: 'POST',
        url: '/sign-up',
        schema: schema.register,
        handler: api.sign_up
    });

    server.route({
        method: 'POST',
        url: '/login',
        schema: schema.login,
        handler: api.sign_in
    });

    server.route({
        method: 'POST',
        url: '/logout',
        schema: schema.logout,
        handler: api.sign_out
    });
};
export default routes;