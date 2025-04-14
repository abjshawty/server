import { FastifyInstance } from "fastify";
import example from "./example";

export default function (server: FastifyInstance) {
    server.register(example, { prefix: "/examples" });
}