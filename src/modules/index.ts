import { Elysia } from "elysia";
import { post } from './post';
import openapi from "@elysiajs/openapi";
import { version } from "package.json";

export default new Elysia({ prefix: 'v' + version.split(".")[0] })
    .use(openapi())
    .use(post)
    .get('/', (ctx) => ctx.redirect("/openapi"));
