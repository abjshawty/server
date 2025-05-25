export const search = {
  querystring: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "string",
      },
      name: {
        type: "string",
        format: "string",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },
};

export const find = {
  querystring: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "string",
      },
      name: {
        type: "string",
        format: "string",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
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
      name: {
        type: "string",
        format: "string",
      },
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
      name: {
        type: "string",
        format: "string",
      },
    },
  },
};
