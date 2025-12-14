import { ApiErrorCode } from './codes';

export default class ApiError extends Error {
	statusCode: number;
	code?: ApiErrorCode | string;
	details?: unknown;

	constructor (statusCode?: number, message?: string, code?: ApiErrorCode | string, details?: unknown) {
		super(message || 'Internal Server Error');
		this.name = 'ApiError';
		this.statusCode = statusCode || 500;
		this.code = code;
		this.details = details;
	}
}
