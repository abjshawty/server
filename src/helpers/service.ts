import { FastifyReply } from "fastify";
import Controller from "./controller";
class Service<T extends object> {
    controller: Controller<T>;
    constructor (controller: Controller<T>) {
        this.controller = controller;
    }
    async create (data: T) {
        try {
            return await this.controller.create(data);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async getAll () {
        try {
            return await this.controller.getAll();
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async getById (id: string) {
        try {
            const result = await this.controller.getById(id);
            if (!result) {
                const error: any = new Error("Not found");
                error.statusCode = 404;
                throw error;
            }
            return result;
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async find (query: { [key in keyof T]?: T[key]; }) {
        try {
            return await this.controller.find(query);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async update (id: string, data: Partial<T>) {
        try {
            return await this.controller.update(id, data);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async delete (id: string) {
        try {
            return await this.controller.delete(id);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async search (
        query: { [key in keyof T]?: T[key]; },
        options?: {
            page?: number,
            take?: number,
            orderBy?: { [key in keyof T]?: "asc" | "desc"; };
            include?: { [key: string]: boolean; };
        },
        strict: boolean = false
    ) {
        try {
            let passingOptions: { take: number, skip: number, orderBy?: { [key in keyof T]?: "asc" | "desc"; }; };
            if (!options) passingOptions = {
                take: 10,
                skip: 0
            };
            else {
                passingOptions = {
                    take: options.take || 10,
                    skip: (options.page || 1) - 1,
                    orderBy: options.orderBy
                };
            }
            return strict
                ? await this.controller.search(query, passingOptions)
                : await this.controller.paginatedSearch(query, passingOptions);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }

    async export (format: string, reply: FastifyReply, options?: { take?: number, skip?: number, orderBy?: { [key in keyof T]?: "asc" | "desc"; }, omit?: { [key in keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'>]?: boolean; }; }) {
        try {
            switch (format) {
                case 'pdf':
                    return await this.controller.exportAsPdf(reply, options);
                case 'json':
                    throw new Error("Not implemented"); // TODO: Implement
                // return await this.controller.exportAsJson(reply, options);
                case 'csv':
                    return await this.controller.exportAsCsv(reply, options);
                case 'xlsx':
                    return await this.controller.exportAsXlsx(reply, options);
                default:
                    const statusCode = 400;
                    const error: any = new Error("Unspecified format.");
                    error.statusCode = statusCode;
                    throw error;
            }
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
}
export default Service;