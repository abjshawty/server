export const search = {
    querystring: {
        type: "object",
        properties: {
            // Add searchable fields here
            title: { type: "string" },
            artist: { type: "string" },
            album: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" }
        }
    },
};

export const find = {
    querystring: {
        type: "object",
        properties: {
            // Add searchable fields here
            id: { type: "string" },
        }
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
    title: {
        type: "string",
        format: "string"
    },
    artist: {
        type: "string",
        format: "string"
    },
    album: {
        type: "string",
        format: "string"
    }
},
        required: ['title', 'artist', 'album'],
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
    id: {
        type: "string",
        format: "string"
    },
    title: {
        type: "string",
        format: "string"
    },
    artist: {
        type: "string",
        format: "string"
    },
    album: {
        type: "string",
        format: "string"
    },
    createdAt: {
        type: "string",
        format: "date-time"
    },
    updatedAt: {
        type: "string",
        format: "date-time"
    }
},
    },
};
