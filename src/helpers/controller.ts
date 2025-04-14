import { client } from "../db";
class Controller<T> {
    private collection: any;
    constructor(collection: string) {
        this.collection = client[collection];
    }
    async create(data: T) {
        try {
            return await this.collection.create({
                data
            });
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async getById(id: string) {
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
    async getAll() {
        try {
            return await this.collection.findMany();
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async update(id: string, data: Partial<T>) {
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
    async delete(id: string) {
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
    async search(query: { [key: string]: string; }, options: { take: number, skip: number, orderBy?: { [key: string]: "asc" | "desc"; }; }) {
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
    async vagueSearch(query: { [key: string]: string; }, options: { take: number, skip: number, orderBy?: { [key: string]: "asc" | "desc"; }, vague?: boolean; }) {
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
}
export default Controller;