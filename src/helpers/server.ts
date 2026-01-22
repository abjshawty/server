import * as env from "./env";
import routes from "../routes";
class Server {
  port: number;
  routes: Record<string, (req: Request) => Response>;
  constructor () {
    this.port = env.port;
    this.routes = routes;
    console.log(this.routes);
  }

  serve (): Bun.Server<undefined> {
    return Bun.serve({
      port: this.port,
      routes: this.routes,
      hostname: env.host,
      fetch: (req) => new Response(`Not Found: ${req.url}`, { status: 404 }),
      error: (error) => new Response(`Internal Server Error: ${error}`, { status: 500 }),
    });
  }
}

export default new Server();
