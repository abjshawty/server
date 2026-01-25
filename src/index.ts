import { Elysia } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import { post } from './modules/post';

new Elysia()
    .use(openapi())
    .use(post)
    .get('/', (ctx) => ctx.redirect("/openapi"))
    .listen(3000);