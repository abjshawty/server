import Fastify, {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { Server as messages } from "../messages";
import { die as killDatabase } from "../db";
import multipart from "@fastify/multipart";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import { init } from "../utils";
import jwt from "@fastify/jwt";
import routes from "../routes";
import death from "death";
import path from "path";
import { env, kafka } from ".";
class Server {
  private kafka: typeof kafka;
  private host: string;
  private role: env.role;
  private port: number;
  private server: FastifyInstance;
  constructor() {
    this.server = Fastify({
      logger: {
        transport: {
          targets: [
            {
              target: "pino-pretty",
              level: "error",
              options: {
                destination: path.join(__dirname, "../logs/error.log"),
                colorize: false,
                translateTime: true,
              },
            },
            {
              target: "pino-pretty",
              level: "info",
              options: {
                destination: path.join(__dirname, "../logs/server.log"),
                colorize: false,
                translateTime: true,
              },
            },
          ],
        },
      },
    });
    this.port = env.port;
    this.host = env.host;
    this.config();
    this.routes();
    this.errorHandler();
    this.kafka = kafka;
    this.role = env.role;
    if (this.role === "producer" || this.role === "both") this.kafka.produce();
    if (this.role === "consumer" || this.role === "both") this.kafka.consume();
  }
  private async bye(): Promise<void> {
    killDatabase();
    if (this.kafka) this.kafka.close();
    this.server
      .close()
      .then(() => {
        messages.close();
      })
      .catch((error) => {
        messages.error(error);
      })
      .finally(() => {
        env.murder();
      });
  }
  private config(): void {
    if (env.jwtSecret === undefined) throw new Error("JWT secret not set");
    this.server.register(jwt, { secret: env.jwtSecret });
    this.server.register(multipart);
    this.helmet();
    this.cors();
    this.die();
  }
  private cors(): void {
    this.server.register(cors, {
      origin: env.corsOrigin,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Content-Range", "X-Content-Range"],
      credentials: true,
    });
  }
  private die(): void {
    death(() => this.bye());
  }
  private errorHandler(): void {
    this.server.setErrorHandler(
      (
        error: FastifyError,
        request: FastifyRequest,
        response: FastifyReply,
      ) => {
        response.status(error.statusCode ? error.statusCode : 500).send(error);
      },
    );
  }
  private helmet(): void {
    this.server.register(helmet);
  }
  private routes() {
    const options = {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              info: { type: "string" },
            },
          },
        },
      },
    };
    this.server.get("/", (request, response) => {
      response.status(400).send({ info: "Version Missing from path!" });
    });
    this.server.get(
      `/${env.apiVersion}/healthcheck`,
      options,
      (request, response) => {
        response.send({ info: "Server is healthy." });
      },
    );
    this.server.get(
      `/${env.apiVersion}/close`,
      options,
      (request, response) => {
        response.send({ info: "Server closing gracefully." });
        this.bye();
      },
    );
    this.server.register(routes, { prefix: `/${env.apiVersion}` });
  }
  public async start(): Promise<void> {
    try {
      await init();
      this.server.listen({ port: this.port, host: this.host }, () => {
        messages.start();
      });
    } catch (error: any) {
      env.murder();
    }
  }
}
export default new Server();
