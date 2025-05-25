export const search = {
    querystring: {
        type: "object",
        properties: {
            name: { type: "string" },
        },
        required: ["name"],
    },
};
export const find = {
    querystring: {
        type: "object",
        properties: {
            name: { type: "string" },
        },
        required: ["name"],
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
        properties: {
            name: { type: "string" },
        },
        required: ["name"],
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
        properties: {
            name: { type: "string" },
        },
    },
};
