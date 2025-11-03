import { schema } from "../types";
const tags = ['Auth'];

export const login: schema = {
    tags,
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: {
                type: 'string',
                format: 'email'
            },
            password: {
                type: 'string',
                format: 'password'
            }
        }
    }
};

export const register: schema = {
    tags,
    body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
            email: {
                type: 'string',
                format: 'email'
            },
            password: {
                type: 'string',
                format: 'password'
            },
            name: {
                type: 'string'
            }
        }
    }
};

export const logout: schema = {
    tags,
};
