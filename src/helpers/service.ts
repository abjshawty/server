import Controller from "./controller";
class Service<T> {
    controller: Controller<T>;
    constructor(controller: Controller<T>) {
        this.controller = controller;
    }
    async create(data: T) {
        try {
            return await this.controller.create(data);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async getAll() {
        try {
            return await this.controller.getAll();
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async getById(id: string) {
        try {
            return await this.controller.getById(id);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async update(id: string, data: Partial<T>) {
        try {
            return await this.controller.update(id, data);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async delete(id: string) {
        try {
            return await this.controller.delete(id);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async search(query: { [key: string]: string; }, options?: { page?: number, take?: number, orderBy?: { [key: string]: "asc" | "desc"; }; }, strict: boolean = false) {
        try {
            let passingOptions: { take: number, skip: number, orderBy?: { [key: string]: "asc" | "desc"; }; };
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
            return strict ? await this.controller.search(query, passingOptions) : await this.controller.vagueSearch(query, passingOptions);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
}
export default Service;