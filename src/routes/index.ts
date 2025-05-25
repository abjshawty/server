import { FastifyInstance } from "fastify";
import example from "./example";
import user from "./user";

export default function (server: FastifyInstance) {
  server.register(example, { prefix: "/examples" });
  server.register(user, { prefix: "/users" });
}
