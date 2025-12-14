import ApiError from './api';
import { ApiErrorCode } from './codes';

export type ApiErrorResponse = {
	success: false;
	code: ApiErrorCode | string;
	message: string;
	details?: unknown;
};

const coerceStatusCode = (statusCode: unknown): number => {
	if (typeof statusCode === 'number' && Number.isFinite(statusCode)) return statusCode;
	if (typeof statusCode === 'string') {
		const n = parseInt(statusCode, 10);
		if (Number.isFinite(n)) return n;
	}
	return 500;
};

const sanitizeValidationDetails = (validation: unknown): unknown => {
	// Fastify typically provides an array of AJV error objects at `error.validation`
	return validation;
};

export const toErrorResponse = (error: any): { statusCode: number; body: ApiErrorResponse } => {
	const statusCode = coerceStatusCode(error?.statusCode);

	// Fastify schema validation error
	if (error?.validation) {
		return {
			statusCode: 400,
			body: {
				success: false,
				code: ApiErrorCode.VALIDATION_ERROR,
				message: 'Request validation failed',
				details: sanitizeValidationDetails(error.validation)
			}
		};
	}

	// Our domain error
	if (error instanceof ApiError) {
		return {
			statusCode: coerceStatusCode(error.statusCode),
			body: {
				success: false,
				code: error.code ?? (statusCode === 404 ? ApiErrorCode.NOT_FOUND : ApiErrorCode.INTERNAL_ERROR),
				message: error.message || (statusCode === 404 ? 'Not found' : 'Internal Server Error'),
				details: error.details
			}
		};
	}

	// Common HTTP cases
	if (statusCode === 404) {
		return {
			statusCode,
			body: {
				success: false,
				code: ApiErrorCode.NOT_FOUND,
				message: 'Not found'
			}
		};
	}
	if (statusCode === 401) {
		return {
			statusCode,
			body: {
				success: false,
				code: ApiErrorCode.UNAUTHORIZED,
				message: 'Unauthorized'
			}
		};
	}
	if (statusCode === 403) {
		return {
			statusCode,
			body: {
				success: false,
				code: ApiErrorCode.FORBIDDEN,
				message: 'Forbidden'
			}
		};
	}
	if (statusCode === 400) {
		return {
			statusCode,
			body: {
				success: false,
				code: ApiErrorCode.BAD_REQUEST,
				message: error?.message || 'Bad request'
			}
		};
	}

	return {
		statusCode,
		body: {
			success: false,
			code: ApiErrorCode.INTERNAL_ERROR,
			message: error?.message || 'Internal Server Error'
		}
	};
};
