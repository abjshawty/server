import { FastifyInstance } from "fastify";
import example from "./example";
import song from "./song"

export default function (server: FastifyInstance) {
    server.register(song, { prefix: "/songs" });
    server.register(example, { prefix: "/examples" });
}
