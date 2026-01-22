import { Elysia, t } from 'elysia';

new Elysia()
    .onAfterHandle((ctx) => { // Interceptor hook
        console.log(ctx);
    })
    .get('/', (ctx) => {
        ctx.set.headers['x-powered-by'] = 'Elysia';
        return ctx.status(418, "I'm a PNL teapot");
    })
    .get('/docs', (ctx) => ctx.redirect("https://elysiajs.com/table-of-content"))
    .get('/redirect', (ctx) => ctx.redirect("/docs"))
    .post(
        '/user',
        ({ body: { name } }) => `Hello ${name}!`,
        {
            body: t.Object({
                name: t.Optional(t.String())
            }),
            beforeHandle: (ctx) => { // Local hook
                ctx.set.headers['x-powered-by'] = 'Elysia';
            },
            error: (ctx) => {
                console.error(ctx.error);
                return ctx.status(400, "Invalid name");
            }
        }
    )
    .listen(3000);

// https://elysiajs.com/tutorial/getting-started/guard/