import { api } from "@/convex/_generated/api";
import { status } from "elysia";
import { convex } from "@/src/client";
import { Model } from "./model";

export abstract class Service {
    static async create ({ title, content }: Model.createBody): Promise<Model.createResponse> {
        if (!title || !content) {
            throw status(400, 'Invalid post data');
        }
        const posts = await convex.mutation(api.post.create, { title, content });
        console.log(posts);
        return {
            id: '1',
            title,
            content,
        };
    }

    static async list () {
        return await convex.query(api.post.getPosts, {});
    }
    static async get () { }
    static async update () { }
    static async delete () { }
}