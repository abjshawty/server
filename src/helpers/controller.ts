// Require is used here because of typescript errors
const pdfTable = require("pdfkit-table");
import { Parser } from "json2csv";
import { FastifyReply } from "fastify";
import { client } from "../db";
import ExcelJS from "exceljs";
class Controller<T extends object> {
    private collection: any;
    private name: string;
    constructor (collection: string) {
        this.collection = client[collection];
        this.name = collection.charAt(0).toUpperCase() + collection.slice(1);
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
    async find (query: { [key in keyof T]?: T[key]; }): Promise<T> {
        try {
            return await this.collection.findFirst({
                where: {
                    ...query
                }
            });
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async search (
        query: { [key in keyof T]?: T[key]; },
        options?: {
            take?: number,
            skip?: number,
            orderBy?: { [key in keyof T]?: "asc" | "desc"; },
            include?: { [key: string]: boolean; };
        }
    ): Promise<T[]> {
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
    async paginatedSearch (
        query: { [key in keyof T]?: T[key]; },
        options: {
            take: number,
            skip: number,
            orderBy?: { [key in keyof T]?: "asc" | "desc"; },
            include?: { [key: string]: boolean; };
        }
    ): Promise<{
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
    async exportAsCsv (reply: FastifyReply, options?: { take?: number, skip?: number, orderBy?: { [key in keyof T]?: "asc" | "desc"; }, omit?: { [key in keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'>]?: boolean; }; }) {
        const defaultOmit = {
            id: true,
            createdAt: true,
            updatedAt: true
        };
        try {
            const data: T[] = await this.collection.findMany({
                omit: {
                    ...defaultOmit,
                    ...options?.omit
                }
            });
            const parser = new Parser({
                fields: Object.keys(data[0]),
                excelStrings: true
            });
            const document = parser.parse(data);
            return reply
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", `attachment; filename=${this.name}.csv`)
                .send(document);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async exportAsPdf (reply: FastifyReply, options?: { take?: number, skip?: number, orderBy?: { [key in keyof T]?: "asc" | "desc"; }, omit?: { [key in keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'>]?: boolean; }; }) {
        const defaultOmit = {
            id: true,
            createdAt: true,
            updatedAt: true
        };
        try {
            const data: T[] = await this.collection.findMany({
                omit: {
                    ...defaultOmit,
                    ...options?.omit
                }
            });
            const document = new pdfTable();
            document.fontSize(10).text(this.name, { align: 'center' });
            document.moveDown();
            let table = {};
            if (data.length === 0) {
                table = {
                    headers: ['Empty Database'],
                    rows: []
                };
            } else {
                table = {
                    headers: Object.keys(data[0]),
                    rows: data.map(object => Object.values(object))
                };
            }
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
    async exportAsJson (reply: FastifyReply, options?: { take?: number, skip?: number, orderBy?: { [key in keyof T]?: "asc" | "desc"; }, omit?: { [key in keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'>]?: boolean; }; }) {
        const defaultOmit = {
            id: true,
            createdAt: true,
            updatedAt: true
        };
        try {
            const data: T[] = await this.collection.findMany({
                omit: {
                    ...defaultOmit,
                    ...options?.omit
                }
            });
            const document = JSON.stringify(data);
            return reply
                .header("Content-Type", "application/json")
                .header("Content-Disposition", `attachment; filename=${this.name}.json`)
                .send(document);
        } catch (error: any) {
            if (!error.statusCode) error.statusCode = "500";
            throw error;
        }
    }
    async exportAsXlsx (reply: FastifyReply, options?: { take?: number, skip?: number, orderBy?: { [key in keyof T]?: "asc" | "desc"; }, omit?: { [key in keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'>]?: boolean; }; }) {
        const defaultOmit = {
            id: true,
            createdAt: true,
            updatedAt: true
        };
        try {
            const data: T[] = await this.collection.findMany({
                omit: {
                    ...defaultOmit,
                    ...options?.omit
                }
            });

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(this.name);
            worksheet.columns = Object.keys(data[0]).map(key => ({
                header: key.toLocaleUpperCase(),
                key
            }));
            data.forEach(row => {
                worksheet.addRow(row);
            });
            const buffer = await workbook.xlsx.writeBuffer();
            return reply
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .header("Content-Disposition", `attachment; filename=${this.name}.xlsx`)
                .send(buffer);
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
}

export default Controller;