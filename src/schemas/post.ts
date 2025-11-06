import { schema } from "../types";
const tags = ['Post'];
export const create: schema = {
    tags,
    body: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
            title: {
                type: 'string',
                minLength: 3,
                maxLength: 100,
            },
            content: {
                type: 'string',
                minLength: 5,
                maxLength: 1000,
            }
        }
    },
    response: {
        201: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: true
                },
                data: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        },
                        title: {
                            type: 'string'
                        },
                        content: {
                            type: 'string'
                        }
                    }
                },
                message: {
                    type: 'string',
                    default: 'Post created successfully'
                }
            }
        },
        400: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',
                    default: 'Bad Request: Please check your request'
                }
            }
        },
        401: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',

                    default: 'Unauthorized: Please check your credentials'
                }
            }
        },
        402: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',

                    default: 'Payment Required: Please check your payment details'
                }
            }
        },
        403: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',

                    default: 'Forbidden: You are not allowed to perform this action'
                }
            }
        },
        404: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',

                    default: 'Not Found: The resource you are looking for does not exist'
                }
            }
        },
        408: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',

                    default: 'Request Timeout: The client did not produce a request within the time that the server was prepared to wait. The client MAY repeat the request without modifications at any later time.'
                }
            }
        },
        409: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',

                    default: 'Conflict: The resource you are trying to create already exists'
                }
            }
        },
        410: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',

                    default: 'Gone: The resource you are looking for does not exist'
                }
            }
        },
        418: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',

                    default: "I'm a teapot: The server cannot or will not process the request due to an apparent client error"
                }
            }
        },
        422: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',

                    default: 'Unprocessable Entity: Please check your request'
                }
            }
        },
        500: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',

                    default: 'Internal Server Error: Please try again later'
                }
            }
        },
        501: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',

                    default: 'Not Implemented: The resource you are looking for does not exist... yet.'
                }
            }
        },
        503: {
            type: 'object',
            required: ['success', 'message', 'data'],
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                data: {
                    type: 'object',
                    default: null
                },
                message: {
                    type: 'string',

                    default: 'Service Unavailable: Please try again later'
                }
            }
        }
    }
};

export const list: schema = {
    tags,
};
export const read: schema = {
    tags,
};
export const update: schema = {
    tags,
};
export const recycle: schema = {
    tags,
};
export const upload: schema = {
    tags,
};