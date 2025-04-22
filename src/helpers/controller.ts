// Require is used here because of typescript errors
const pdfTable = require("pdfkit-table");
import { FastifyReply } from "fastify";
import { client } from "../db";
class Controller<T extends object> {
    private collection: any;
    private name: string;
    constructor (collection: string) {
        this.collection = client[collection];
        this.name = collection;
    }
    async create (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
        try {
            return await this.collection.create({
                data
            });
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async getById (id: string): Promise<T> {
        try {
            return await this.collection.findUnique({
                where: {
                    id
                }
            });
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "404";
            throw error;
        }
    }
    async getAll (): Promise<T[]> {
        try {
            return await this.collection.findMany();
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async update (id: string, data: Partial<T>): Promise<T> {
        try {
            return await this.collection.update({
                where: {
                    id
                },
                data
            });
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async delete (id: string): Promise<T> {
        try {
            return await this.collection.delete({
                where: {
                    id
                }
            });
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async search (query: { [key: string]: string; }, options: { take?: number, skip?: number, orderBy?: { [key: string]: "asc" | "desc"; }, include?: { [key: string]: boolean; }; }): Promise<T[]> { // TODO: Implement type recognition for include
        try {
            return await this.collection.findMany({
                where: {
                    ...query
                },
                ...options
            });
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async vagueSearch (query: { [key: string]: string; }, options: { take: number, skip: number, orderBy?: { [key: string]: "asc" | "desc"; }, vague?: boolean, include?: { [key: string]: boolean; }; }): Promise<{ // TODO: Implement type recognition for include
        record: Promise<T>,
        count: Promise<Number>,
        items: Promise<Number>,
        pages: Number,
        currentPage: Number;
    }> {
        const where = Object.keys(query).length !== 0 ? {
            OR: Object.keys(query).map(key => ({
                [key]: {
                    contains: query[key],
                }
            }))
        } : query;
        try {
            const record = await this.collection.findMany({
                where,
                ...options
            });
            const count = await this.collection.count({
                where
            });
            const items = await this.collection.count();
            const pages = Math.ceil(items / (options?.take || 10));
            const currentPage = Math.floor(options.skip / (options.take)) + 1;
            return {
                record,
                count,
                items,
                pages,
                currentPage,

            };
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async exportAsPdf (reply: FastifyReply) {
        try {
            const data: T[] = await this.collection.findMany({
                // TODO: Implement type recognition for omit
                // TODO: Add parameter for optional omit attributes
                omit: {
                    id: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            // const data = await client.example.findMany({});
            const document = new pdfTable();
            document.fontSize(10).text(this.name, { align: 'center' });
            document.moveDown();
            const table = {
                headers: Object.keys(data[0]),
                rows: data.map(object => Object.values(object))
            };
            await document.table(table);
            document.end();
            return reply
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", `attachment; filename=${this.name}.pdf`)
                .send(document);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
}


export default Controller;