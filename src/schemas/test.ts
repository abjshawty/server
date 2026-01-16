import { schema } from "../types";
const tags = ['Test'];

export const email: schema = {
    tags: [...tags, 'Email'],
    response: {
        200: {
            type: 'object',
            required: ['success'],
            properties: {
                success: { type: 'boolean' },
                messageid: { type: 'string' },
                error: { type: 'string' }
            }
        }
    }
};