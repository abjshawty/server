/*
The goal is creating a generator that will generate the controllers, services, and routes based on the prisma schema.
We will pass the model name as an argument to the generator.
Steps:
- Read the prisma schema
- Generate the controllers
- Generate the services
- Generate the schemas
- Generate the routes
*/

import { Prisma } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { promises as fs } from 'fs';
import path from 'path';

interface FieldInfo {
    name: string;
    type: string;
    isOptional: boolean;
    isId: boolean;
    isRelation: boolean;
    relationName?: string;
    relationTo?: string;
    isList: boolean;
}

interface ModelInfo {
    name: string;
    fields: FieldInfo[];
    relations: {
        name: string;
        type: string;
        isList: boolean;
        relationFromFields?: readonly string[];
        relationToFields?: readonly string[];
    }[];
}

export class PrismaGenerator {
    private models: ModelInfo[] = [];
    private outputDirs = {
        controllers: path.join(process.cwd(), 'src', 'controllers'),
        services: path.join(process.cwd(), 'src', 'services'),
        schemas: path.join(process.cwd(), 'src', 'schemas'),
        routes: path.join(process.cwd(), 'src', 'routes'),
    };

    async generate (modelName?: string) {
        await this.ensureDirectories();
        await this.parsePrismaSchema();

        const modelsToGenerate = modelName
            ? this.models.filter(m => m.name === modelName)
            : this.models;

        if (modelsToGenerate.length === 0) {
            throw new Error(`No models found${modelName ? ` matching '${modelName}'` : ''}`);
        }

        for (const model of modelsToGenerate) {
            await this.generateController(model);
            await this.generateService(model);
            await this.generateSchema(model);
        }

        await this.generateRoutes();

        console.log('Generation completed successfully!');
    }

    private async ensureDirectories () {
        for (const dir of Object.values(this.outputDirs)) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    // private async parsePrismaSchema () {
    //     const dmmf = Prisma.dmmf;

    //     if (!dmmf) {
    //         throw new Error('Prisma DMMF not found. Make sure @prisma/client is installed.');
    //     }

    //     this.models = dmmf.datamodel.models.map(model => {
    //         const fields: FieldInfo[] = model.fields.map(field => ({
    //             name: field.name,
    //             type: field.type,
    //             isOptional: !field.isRequired,
    //             isId: field.isId || false,
    //             isRelation: !!field.relationName,
    //             relationName: field.relationName,
    //             relationTo: field.relationTo,
    //             isList: field.isList || false,
    //         }));

    //         const relations = model.fields
    //             .filter(f => f.relationName)
    //             .map(f => ({
    //                 name: f.name,
    //                 type: f.type,
    //                 isList: f.isList || false,
    //                 relationFromFields: f.relationFromFields,
    //                 relationToFields: f.relationToFields,
    //             }));

    //         return {
    //             name: model.name,
    //             fields,
    //             relations,
    //         };
    //     });
    // }

    private async parsePrismaSchema () {
        const dmmf = Prisma.dmmf;

        if (!dmmf) {
            throw new Error('Prisma DMMF not found. Make sure @prisma/client is installed.');
        }

        this.models = dmmf.datamodel.models.map(model => {
            const fields: FieldInfo[] = model.fields.map(field => {
                const relationName = field.relationName;
                const relationTo = relationName ? field.type : undefined;

                return {
                    name: field.name,
                    type: field.type,
                    isOptional: !field.isRequired,
                    isId: field.isId || false,
                    isRelation: !!relationName,
                    relationName,
                    relationTo,
                    isList: field.isList || false,
                };
            });

            const relations = model.fields
                .filter(f => f.relationName)
                .map(f => ({
                    name: f.name,
                    type: f.type,
                    isList: f.isList || false,
                    relationFromFields: f.relationFromFields,
                    relationToFields: f.relationToFields,
                }));

            return {
                name: model.name,
                fields,
                relations,
            };
        });
    }

    private async generateController (model: ModelInfo) {
        const controllerPath = path.join(this.outputDirs.controllers, `${model.name.toLowerCase()}.ts`);
        const className = model.name;
        const varName = model.name.toLowerCase();

        const content = `import { ${className} as Build } from "@prisma/client";
import { ControllerFactory } from "../helpers";

class CustomController extends ControllerFactory<Build> { }

export default new CustomController('${varName}');
`;

        await fs.writeFile(controllerPath, content, 'utf-8');
        console.log(`Generated controller: ${controllerPath}`);
    }

    private async generateService (model: ModelInfo) {
        const servicePath = path.join(this.outputDirs.services, `${model.name.toLowerCase()}.ts`);
        const className = model.name;
        const varName = model.name.toLowerCase();

        const content = `import { ${className} as Build } from "@prisma/client";
import { Service } from "../helpers";

class CustomService extends Service<Build> { }

export default new CustomService('${varName}');
`;

        await fs.writeFile(servicePath, content, 'utf-8');
        console.log(`Generated service: ${servicePath}`);
    }

    private async generateSchema (model: ModelInfo) {
        const schemaPath = path.join(this.outputDirs.schemas, `${model.name.toLowerCase()}.ts`);

        const fields = model.fields
            .filter(f => !f.isRelation)
            .map(f => `  ${f.name}${f.isOptional ? '?' : ''}: ${this.mapPrismaTypeToTSType(f.type)};`)
            .join('\n');

        const createFields = model.fields
            .filter(f => !f.isId && !f.isRelation)
            .map(f => `  ${f.name}${f.isOptional ? '?' : ''}: ${this.mapPrismaTypeToTSType(f.type)};`)
            .join('\n');

        const content = `export interface ${model.name} {
${fields}
}

export interface Create${model.name}Dto {
${createFields}
}

export interface Update${model.name}Dto extends Partial<Create${model.name}Dto> {}
`;

        await fs.writeFile(schemaPath, content, 'utf-8');
        console.log(`Generated schema: ${schemaPath}`);
    }

    private async generateRoutes () {
        const routesPath = path.join(this.outputDirs.routes, 'index.ts');
        const models = this.models.map(m => m.name.toLowerCase());

        let content = 'import { FastifyInstance } from "fastify";\n';

        // Import controllers
        for (const model of models) {
            content += `import ${model} from "../controllers/${model}";\n`;
        }

        content += '\nexport default async function (app: FastifyInstance) {\n';

        // Generate routes for each model
        for (const model of models) {
            content += `    // ${model} routes
    app.get('/${model}s', async (req, reply) => {
        try {
            const data = await ${model}.getAll();
            return data;
        } catch (error: any) {
            reply.status(parseInt(error.statusCode) || 500).send({ error: error.message });
        }
    });

    app.get('/${model}s/:id', async (req: any, reply) => {
        try {
            const data = await ${model}.getById(req.params.id);
            if (!data) return reply.status(404).send({ error: '${model} not found' });
            return data;
        } catch (error: any) {
            reply.status(parseInt(error.statusCode) || 500).send({ error: error.message });
        }
    });

    app.post('/${model}s', async (req: any, reply) => {
        try {
            const data = await ${model}.create(req.body);
            reply.status(201);
            return data;
        } catch (error: any) {
            reply.status(parseInt(error.statusCode) || 400).send({ error: error.message });
        }
    });

    app.put('/${model}s/:id', async (req: any, reply) => {
        try {
            const data = await ${model}.update(req.params.id, req.body);
            if (!data) return reply.status(404).send({ error: '${model} not found' });
            return data;
        } catch (error: any) {
            reply.status(parseInt(error.statusCode) || 400).send({ error: error.message });
        }
    });

    app.delete('/${model}s/:id', async (req: any, reply) => {
        try {
            const data = await ${model}.delete(req.params.id);
            if (!data) return reply.status(404).send({ error: '${model} not found' });
            return { message: '${model} deleted successfully' };
        } catch (error: any) {
            reply.status(parseInt(error.statusCode) || 500).send({ error: error.message });
        }
    });

};`;
        }

        content += '};';

        await fs.writeFile(routesPath, content, 'utf-8');
        console.log(`Generated routes: ${routesPath}`);
    }

    private mapPrismaTypeToTSType (prismaType: string): string {
        const typeMap: Record<string, string> = {
            'String': 'string',
            'Int': 'number',
            'Float': 'number',
            'Boolean': 'boolean',
            'DateTime': 'Date',
            'Json': 'any',
            'BigInt': 'bigint',
            'Decimal': 'number',
            'Bytes': 'Buffer',
        };

        return typeMap[prismaType] || 'any';
    }
}

// Example usage:
// const generator = new PrismaGenerator();
// generator.generate('Example').catch(console.error);