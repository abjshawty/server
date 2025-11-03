export default class ApiError extends Error {
    statusCode: number;
    constructor (statusCode?: number, message?: string) {
        super(message || 'Internal Server Error');
        this.name = 'ApiError';
        this.statusCode = statusCode || 500;
    }
}