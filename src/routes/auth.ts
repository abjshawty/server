import { FastifyPluginCallback } from "fastify";
import { Auth as schema } from "../schemas";
import { Auth as api } from "../api";

const routes: FastifyPluginCallback = server => {
    // server.route({
    //     method: 'POST',
    //     url: '/sign-up',
    //     schema: schema.register,
    //     handler: api.sign_up
    // });

    // server.route({
    //     method: 'POST',
    //     url: '/login',
    //     schema: schema.login,
    //     handler: api.sign_in
    // });

    // server.route({
    //     method: 'POST',
    //     url: '/logout',
    //     schema: schema.logout,
    //     handler: api.sign_out
    // });

    server.route({
        method: ["GET", "POST"],
        url: "/*",
        async handler (request, reply) {
            try {
                // Construct request URL
                const url = new URL(request.url, `http://${request.headers.host}`);

                // Convert Fastify headers to standard Headers object
                const headers = new Headers();
                Object.entries(request.headers).forEach(([key, value]) => {
                    if (value) headers.append(key, value.toString());
                });

                // Create Fetch API-compatible request
                const req = new Request(url.toString(), {
                    method: request.method,
                    headers,
                    body: request.body ? JSON.stringify(request.body) : undefined,
                });

                // Process authentication request
                const response = await api.handler(req);

                // Forward response to client
                reply.status(response.status);
                response.headers.forEach((value, key) => reply.header(key, value));
                reply.send(response.body ? await response.text() : null);

            } catch (error: any) {
                server.log.error({ err: error }, "Authentication Error");
                reply.status(500).send({
                    success: false,
                    code: "AUTH_FAILURE",
                    message: "Internal authentication error"
                });
            }
        }
    });
};
export default routes;