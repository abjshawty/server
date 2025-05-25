import { Prisma } from '@prisma/client';
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

class PrismaGenerator {
    private models: ModelInfo[] = [];
    private outputDirs = {
        controllers: path.join(process.cwd(), 'src', 'controllers'),
        services: path.join(process.cwd(), 'src', 'services'),
        schemas: path.join(process.cwd(), 'src', 'schemas'),
        routes: path.join(process.cwd(), 'src', 'routes'),
    };
    private formatName (name: string) {
        return name.charAt(0).toLowerCase() + name.slice(1);
    }

    async generate (modelName?: string) {
        await this.ensureDirectories();
        await this.parsePrismaSchema();

        const modelsToGenerate = modelName
            ? this.models.filter(m => m.name.toLowerCase() === this.formatName(modelName))
            : this.models;

        if (modelsToGenerate.length === 0) {
            throw new Error(`No models found${modelName ? ` matching '${modelName}'` : ''}`);
        }

        // Generate files for each model
        for (const model of modelsToGenerate) {
            await this.generateController(model);
            await this.generateService(model);
            await this.generateSchema(model);
            await this.generateRouteFile(model);

            // Update all index files
            await this.updateControllerIndex(model.name);
            await this.updateServiceIndex(model.name);
            await this.updateSchemaIndex(model.name);
        }

        // Update routes index
        if (modelName) {
            await this.updateRoutesIndex(this.formatName(modelName));
        } else {
            await this.regenerateRoutesIndex();
        }

        console.log('Generation completed successfully!');
    }

    private async ensureDirectories () {
        for (const dir of Object.values(this.outputDirs)) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

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
class Controller extends ControllerFactory<Build> { }
export default new Controller('${varName}');
`;

        await fs.writeFile(controllerPath, content, 'utf-8');
        console.log(`Generated controller: ${controllerPath}`);
    }

    private async generateService (model: ModelInfo) {
        const servicePath = path.join(this.outputDirs.services, `${model.name.toLowerCase()}.ts`);
        const className = model.name;

        const content = `import { ${className} as Build } from "@prisma/client";
import { ${className} as Controller } from "../controllers";
import { ServiceFactory } from "../helpers";
class Service extends ServiceFactory<Build> { }
export default new Service(Controller);
`;

        await fs.writeFile(servicePath, content, 'utf-8');
        console.log(`Generated service: ${servicePath}`);
    }

    private async generateSchema (model: ModelInfo) {
        const schemaPath = path.join(this.outputDirs.schemas, `${model.name.toLowerCase()}.ts`);
        const varName = model.name.toLowerCase();

        // Filter out relation fields, timestamps, and IDs for required fields
        const requiredFields = model.fields
            .filter(f => !f.isOptional && !f.isId && !f.name.startsWith('createdAt') && !f.name.startsWith('updatedAt') && !f.isRelation)
            .map(f => `'${f.name}'`)
            .join(', ');

        // Base properties for create/update (no relations, no timestamps, no IDs)
        const baseProperties = model.fields
            .filter(f => !f.isId && !f.name.startsWith('createdAt') && !f.name.startsWith('updatedAt') && !f.isRelation)
            .reduce((acc, field) => {
                const prop: Record<string, any> = {
                    type: this.mapPrismaTypeToSchemaType(field.type)
                };

                if (field.type === 'String') {
                    prop.format = 'string';
                } else if (field.type === 'DateTime') {
                    prop.format = 'date-time';
                }

                return {
                    ...acc,
                    [field.name]: prop
                };
            }, {});

        // Search properties (no relations, but include timestamps)
        const searchProperties = model.fields
            .filter(f => !f.isRelation) // Exclude relation fields
            .reduce((acc, field) => {
                const prop: Record<string, any> = {
                    type: this.mapPrismaTypeToSchemaType(field.type)
                };

                if (field.type === 'String') {
                    prop.format = 'string';
                } else if (field.type === 'DateTime') {
                    prop.format = 'date-time';
                }

                return {
                    ...acc,
                    [field.name]: prop
                };
            }, {});

        const content = `export const search = {
    querystring: {
        type: "object",
        properties: ${JSON.stringify(searchProperties, null, 8).replace(/"([^"]+)":/g, '$1:')},
    },
};

export const find = {
    querystring: {
        type: "object",
        properties: {
            id: { type: "string" },
        },
        required: ["id"],
    },
};

export const getOrDelete = {
    params: {
        type: "object",
        properties: {
            id: { type: "string" },
        },
        required: ["id"],
    },
};

export const create = {
    body: {
        type: "object",
        properties: ${JSON.stringify(baseProperties, null, 8).replace(/"([^"]+)":/g, '$1:')},
        required: [${requiredFields}],
    },
};

export const update = {
    params: {
        type: "object",
        properties: {
            id: { type: "string" },
        },
        required: ["id"],
    },
    body: {
        type: "object",
        properties: ${JSON.stringify(baseProperties, null, 8).replace(/"([^"]+)":/g, '$1:')}
    },
};
`;

        await fs.writeFile(schemaPath, content, 'utf-8');
        console.log(`Generated schema: ${schemaPath}`);
    }

    private async updateIndexFile (directory: string, modelName: string, exportName: string) {
        const indexPath = path.join(directory, 'index.ts');
        const modelLower = modelName.toLowerCase();

        try {
            let content = '';
            const exists = await fs.access(indexPath).then(() => true).catch(() => false);

            if (exists) {
                content = await fs.readFile(indexPath, 'utf-8');
                // Check if already exported
                const exportRegex = new RegExp(`export\\s*\\{\\s*${exportName}\\s*\\}\\s*from\\s*[\"']\\.\\/${modelLower}[\"']`, 'i');
                if (exportRegex.test(content)) {
                    return; // Already exported
                }
            }

            // Add export at the end of the file
            const exportStatement = `export { ${exportName} } from './${modelLower}'`;
            const newContent = content.trim() + '\n' + exportStatement + '\n';

            await fs.writeFile(indexPath, newContent, 'utf-8');
            console.log(`Updated ${path.basename(directory)} index with ${exportName}`);
        } catch (error) {
            console.error(`Error updating ${path.basename(directory)} index:`, error);
        }
    }

    private async updateControllerIndex (modelName: string) {
        await this.updateIndexFile(this.outputDirs.controllers, modelName, 'default as ' + modelName);
    }

    private async updateServiceIndex (modelName: string) {
        await this.updateIndexFile(this.outputDirs.services, modelName, 'default as ' + modelName);
    }

    private async updateSchemaIndex (modelName: string) {
        const indexPath = path.join(this.outputDirs.schemas, 'index.ts');
        const modelLower = modelName.toLowerCase();
        const exportName = modelName;
        const exportStatement = `export * as ${exportName} from './${modelLower}'`;

        try {
            let content = '';
            const exists = await fs.access(indexPath).then(() => true).catch(() => false);

            if (exists) {
                content = await fs.readFile(indexPath, 'utf-8');
                // Check if already exported with the same name
                const exportRegex = new RegExp(`export\\s*\\*\\s*as\\s*${exportName}\\s*from\\s*['"]\\.\\/\\/${modelLower}['"]`, 'i');
                if (exportRegex.test(content)) {
                    return; // Already exported
                }
                // Remove any existing export for this model to prevent duplicates
                content = content.replace(new RegExp(`export\\s*\\*\\s*as\\s*${exportName}\\s*from\\s*['"]\\.\\/\\w+['"];?\\s*`, 'gi'), '');
                content = content.replace(new RegExp(`export\\s*\\{[^}]*\\b${exportName}\\b[^}]*\\}\\s*from\\s*['"]\\.\\/\\w+['"];?\\s*`, 'gi'), '');
            }

            // Add export at the end of the file
            const newContent = content.trim() + '\n' + exportStatement + '\n';
            await fs.writeFile(indexPath, newContent, 'utf-8');
            console.log(`Updated schemas index with ${exportName}`);
        } catch (error) {
            console.error('Error updating schemas index:', error);
        }
    }

    private async updateRoutesIndex (newModelName?: string) {
        if (!newModelName) {
            await this.regenerateRoutesIndex();
            return;
        }

        const routesIndexPath = path.join(this.outputDirs.routes, 'index.ts');

        let content = '';
        try {
            content = await fs.readFile(routesIndexPath, 'utf-8');
        } catch (error) {
            return this.regenerateRoutesIndex(newModelName);
        }

        const importRegex = new RegExp(`import\\s+${newModelName}\\s+from\\s+["']\\.\\/${newModelName}["']`, 'i');
        const registerRegex = new RegExp(`server\\s*\\.register\\s*\\(\\s*${newModelName}\\s*,\\s*\\{\\s*prefix\\s*:\\s*["']\\/${newModelName}s["']\\s*\\}`, 'i');

        if (importRegex.test(content) && registerRegex.test(content)) {
            console.log(`Route for ${newModelName} already exists in routes/index.ts`);
            return;
        }

        if (!importRegex.test(content)) {
            const lastImportMatch = content.match(/^import .*$/gm)?.pop();
            if (lastImportMatch) {
                content = content.replace(
                    lastImportMatch,
                    `${lastImportMatch}\nimport ${newModelName} from \"./${newModelName}\"`
                );
            }
        }

        if (!registerRegex.test(content)) {
            content = content.replace(
                /export default function \(server: FastifyInstance\) \{/,
                `export default function (server: FastifyInstance) {\n    server.register(${newModelName}, { prefix: \"/${newModelName}s\" });`
            );
        }

        await fs.writeFile(routesIndexPath, content, 'utf-8');
        console.log(`Updated routes index with new route: ${newModelName}`);
    }

    private async regenerateRoutesIndex (modelName?: string) {
        const routesIndexPath = path.join(this.outputDirs.routes, 'index.ts');
        const modelNames = modelName ? this.models.filter(m => this.formatName(m.name) === this.formatName(modelName)) : this.models.map(m => this.formatName(m.name));

        let content = 'import { FastifyInstance } from "fastify";\n';

        for (const model of modelNames) {
            console.log(model);
            content += `import ${model} from \"./${model}\";\n`;
        }

        content += '\nexport default function (server: FastifyInstance) {\n';
        for (const model of modelNames) {
            content += `    server.register(${model}, { prefix: \"/${model}s\" });\n`;
        }
        content += '}\n';

        await fs.writeFile(routesIndexPath, content, 'utf-8');
        console.log(`Regenerated routes index: ${routesIndexPath}`);
    }

    private async generateRouteFile (model: ModelInfo) {
        const routesDir = this.outputDirs.routes;
        const routePath = path.join(routesDir, `${model.name.toLowerCase()}.ts`);
        const className = model.name;
        const varName = this.formatName(model.name);

        try {
            await fs.access(routePath);
            console.log(`Route file ${routePath} already exists, skipping...`);
            await this.updateRoutesIndex(varName);
            return;
        } catch (error) {
            // File doesn't exist, proceed with generation
        }

        const content = `import { FastifyPluginCallback, FastifyRequest, FastifyReply } from "fastify";
import { ${className} as Build } from "@prisma/client";
import { ${className} as Service } from "../services";
import { ${className} as Schema } from "../schemas";
import { auth } from "../utils";

const routes: FastifyPluginCallback = (server) => {
    // Create
    server.route({
        method: "POST",
        url: "/",
        schema: Schema.create,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Body: Build }>, reply: FastifyReply) => {
            const result = await Service.create(request.body);
            reply.send({ data: result });
        }
    });

    // Get All
    server.route({
        method: "GET",
        url: "/",
        schema: Schema.search,
        preHandler: auth,
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const result = await Service.getAll();
            reply.send({ data: result });
        }
    });

        server.route({
        method: "GET",
        url: "/export/:format",
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { format: string; }; }>, reply: FastifyReply) => {
            await Service.export(request.params.format, reply);
        }
    });

    server.route({
        method: "GET",
        url: "/search",
        schema: Schema.search,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Querystring: { name: string; }; }>, reply: FastifyReply) => {
            const result = await Service.search(request.query, { include: { ExampleAttach: true } });
            reply.send({ data: result });
        }
    });

    server.route({
        method: "GET",
        url: "/find",
        schema: Schema.find,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Querystring: { name: string; }; }>, reply: FastifyReply) => {
            const result = await Service.find(request.query);
            reply.send({ data: result });
        }
    });

    // Get One
    server.route({
        method: "GET",
        url: "/:id",
        schema: Schema.getOrDelete,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const result = await Service.getById(request.params.id);
            if (!result) {
                return reply.status(404).send({ error: '${className} not found' });
            }
            reply.send({ data: result });
        }
    });

    // Update
    server.route({
        method: "PUT",
        url: "/:id",
        schema: Schema.update,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string }, Body: Partial<Build> }>, reply: FastifyReply) => {
            const result = await Service.update(request.params.id, request.body);
            if (!result) {
                return reply.status(404).send({ error: '${className} not found' });
            }
            reply.send({ data: result });
        }
    });

    // Delete
    server.route({
        method: "DELETE",
        url: "/:id",
        schema: Schema.getOrDelete,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const result = await Service.delete(request.params.id);
            if (!result) {
                return reply.status(404).send({ error: '${className} not found' });
            }
            reply.send({ data: { message: '${className} deleted successfully' } });
        }
    });
};

export default routes;
`;

        await fs.writeFile(routePath, content, 'utf-8');
        console.log(`Generated route: ${routePath}`);

        await this.updateRoutesIndex(varName);
    }

    private mapPrismaTypeToSchemaType (prismaType: string): string {
        const typeMap: Record<string, string> = {
            'String': 'string',
            'Int': 'number',
            'Float': 'number',
            'Boolean': 'boolean',
            'DateTime': 'string',
            'Json': 'object',
            'BigInt': 'number',
            'Decimal': 'number',
            'Bytes': 'string',
        };

        return typeMap[prismaType] || 'string';
    }
}

function generate (modelName?: string) {
    const generator = new PrismaGenerator();
    generator.generate(modelName).catch(console.error);
}

generate(process.argv[2]);