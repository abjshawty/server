import { Elysia } from 'elysia';
import { Service } from './service';
import { Model } from './model';

export const post = new Elysia({ prefix: '/post' })
    .post('/', (ctx) => Service.create(ctx.body), {
        body: Model.createBody,
        response: {
            200: Model.createResponse,
            400: Model.createInvalid,
        },
    });