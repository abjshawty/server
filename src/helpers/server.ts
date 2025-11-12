import Fastify, { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Server as messages } from '../messages';
import { die as killDatabase } from '../db';
import multipart from '@fastify/multipart';
import swagger_ui from '@fastify/swagger-ui';
import swagger from '@fastify/swagger';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import routes from '../routes';
import death from 'death';
import path from 'path';
import { env } from '.';
import { kafka } from '../utils';

class Server {
	private kafka: typeof kafka;
	private host: string;
	private role: env.role;
	private port: number;
	private server: FastifyInstance;
	constructor () {
		this.server = Fastify({
			logger: {
				transport: {
					targets: [
						// Error Console
						{
							target: 'pino-pretty',
							level: 'error',
							options: {
								colorize: true,
								translateTime: true
							}
						},
						// Error File
						{
							target: 'pino-pretty',
							level: 'error',
							options: {
								destination: path.join(__dirname, '../logs/error.log'),
								colorize: true,
								translateTime: true
							}
						},
						// Info Console (commented out by default)
						{
							target: 'pino-pretty',
							level: 'info',
							options: {
								colorize: true,
								translateTime: true
							}
						},
						// Info File
						{
							target: 'pino-pretty',
							level: 'info',
							options: {
								destination: path.join(__dirname, '../logs/server.log'),
								colorize: true,
								translateTime: true
							}
						},
						// Warning Console
						{
							target: 'pino-pretty',
							level: 'warn',
							options: {
								colorize: true,
								translateTime: true
							}
						},
						// Warning File
						{
							target: 'pino-pretty',
							level: 'warn',
							options: {
								destination: path.join(__dirname, '../logs/warnings.log'),
								colorize: true,
								translateTime: true
							}
						}
					]
				}
			}
		});
		this.port = env.port;
		this.host = env.host;
		this.config();
		this.docs();
		this.routes();
		this.errorHandler();
		this.kafka = kafka;
		this.role = env.role;
		if (this.role === 'producer' || this.role === 'both') this.kafka.produce();
		if (this.role === 'consumer' || this.role === 'both') this.kafka.consume();
	}
	/**
	 * Closes the server and kills the database connection.
	 * This method is called when the server is shutting down.
	 */
	private async bye (): Promise<void> {
		killDatabase();
		if (this.kafka) this.kafka.close();
		this.server
			.close()
			.then(() => {
				messages.close();
			})
			.catch(error => {
				messages.error(error);
			})
			.finally(() => {
				env.murder();
			});
	}

	/**
	 * Configures the server.
	 * This method is called when the server is starting up.
	 */
	private config (): void {
		if (env.jwtSecret === undefined) throw new Error('JWT secret not set');
		this.server.register(jwt, { secret: env.jwtSecret });
		this.server.register(multipart);
		this.helmet();
		this.hooks();
		this.cors();
		this.die();
	}

	/**
	 * Configures the CORS middleware.
	 * This method is called when the server is starting up.
	 */
	private cors (): void {
		this.server.register(cors, {
			origin: env.corsOrigin,
			methods: ['GET', 'POST', 'PUT', 'DELETE'],
			allowedHeaders: ['Content-Type', 'Authorization'],
			exposedHeaders: ['Content-Range', 'X-Content-Range'],
			credentials: true
		});
	}

	/**
	 * Configures the death middleware.
	 * This method is called when the server is starting up.
	 */
	private die (): void {
		death(() => this.bye());
	}

	/**
	 * Configures the documentation middleware.
	 * This method is called when the server is starting up.
	 */
	private docs (): void {
		this.server.register(swagger, {
			openapi: {
				info: {
					title: `${env.apiName} API`,
					version: env.apiVersion,
					description: `${env.apiName} API`
				},
				servers: [
					{
						url: `http://${env.host}:${env.port}`,
						description: `${env.apiName} API for local development`
					}
				]
			}
		});
		this.server.register(swagger_ui, {
			routePrefix: '/'
		});
	}

	/**
	 * Configures the error handler middleware.
	 * This method is called when the server is starting up.
	 */
	private errorHandler (): void {
		this.server.setErrorHandler((error: FastifyError, request: FastifyRequest, response: FastifyReply) => {
			this.server.log.error(error);
			response.status(error.statusCode ? error.statusCode : 500).send(error);
		});
	}

	/**
	 * Configures the helmet middleware.
	 * This method is called when the server is starting up.
	 */
	private helmet (): void {
		this.server.register(helmet);
	}

	/**
	 * Configures the hooks middleware.
	 * This method is called when the server is starting up.
	 */
	private hooks (): void {
		// this.server.addHook('onRequest', (request, reply, done) => {
		// 	this.server.log.info(`Request URL: ${request.url}`);
		// 	done();
		// });
	}

	/**
	 * Configures the routes middleware.
	 * This method is called when the server is starting up.
	 */
	private routes (): void {
		const options = {
			schema: {
				tags: ['Server'],
				response: {
					200: {
						type: 'object',
						properties: {
							info: { type: 'string' }
						}
					}
				}
			}
		};
		// Shutdown route
		this.server.route({
			method: 'GET',
			url: `/${env.apiVersion}/close`,
			schema: options.schema,
			handler: (request, response) => {
				response.status(200).send({ info: `${env.apiName} server closing gracefully.` });
				this.bye();
			}
		});
		// Info route
		this.server.route({
			method: 'GET',
			url: `/${env.apiVersion}/info`,
			handler: (request, response) => {
				response.status(200).send({ info: `${env.apiName} server info` });
			}
		});
		this.server.register(routes, { prefix: `/${env.apiVersion}` });
	}

	/**
	 * Starts the server.
	 * This method is called when the server is starting up.
	 */
	public async start (): Promise<void> {
		this.server
			.listen({ port: this.port, host: this.host })
			.then(() => {
				messages.start();
			})
			.catch(error => {
				this.server.log.error(error);
				env.murder();
			});
	}
}
export default new Server();
