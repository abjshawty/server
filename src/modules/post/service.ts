import { status } from "elysia";
import { Model } from "./model";

export abstract class Service {
    static async create ({ title, content }: Model.createBody): Promise<Model.createResponse> {
        if (!title || !content) {
            throw status(400, 'Invalid post data');
        }
        return {
            id: '1',
            title,
            content,
        };
    }
}