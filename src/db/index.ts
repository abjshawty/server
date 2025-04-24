import { Database as messages } from "../messages";
import { PrismaClient } from "@prisma/client";
import { Prisma } from ".prisma/client";
const dmmf = Prisma.dmmf;
export const client = new PrismaClient();
export const die = () => {
    client.$disconnect();
    messages.die();
};

export const relations = (model: string) => {
    const modelObject = dmmf.datamodel.models.find(m => m.name === model);
    if (modelObject) {
        const relationNames: string[] = modelObject.fields
            .filter((f: any) => f.kind === "object")
            .map((f: any) => f.name);

        let customObject = {};
        for (const attr of relationNames) {
            customObject[attr] = true;
        }
        return customObject;
    }
    const error: any = new Error();
    error.statusCode = "404";
    error.message = `Model ${model} not found`;
    throw error;
};
