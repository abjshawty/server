import { Elysia } from 'elysia';

new Elysia()
    .get('/', (ctx) => {
        ctx.set.headers['x-powered-by'] = 'Elysia';
        return ctx.status(418, "I'm a PNL teapot");
    })
    .get('/docs', (ctx) => ctx.redirect("https://elysiajs.com"))
    .get('/redirect', (ctx) => ctx.redirect("/docs"))
    .listen(3000);
