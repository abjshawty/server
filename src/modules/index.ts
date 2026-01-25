import { Elysia } from "elysia";
import { post } from './post';
import openapi from "@elysiajs/openapi";

export default new Elysia()
    .use(openapi())
    .use(post)
    .get('/', (ctx) => ctx.redirect("/openapi"));
