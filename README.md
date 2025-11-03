# Server Template

A production-ready backend server template built with Fastify, Prisma, and TypeScript. This template provides a solid foundation for building scalable and maintainable API services.

## Features

- **Fastify** - High performance web framework with automatic OpenAPI documentation
- **Prisma** - Type-safe database client with migrations
- **TypeScript** - Full type safety across the stack
- **JWT Authentication** - Secure API endpoints with @fastify/jwt
- **File Uploads** - Handle multipart file uploads with @fastify/multipart
- **Swagger UI** - Interactive API documentation at root path
- **CORS & Helmet** - Security best practices built-in
- **Structured Logging** - Pino logger with file and console outputs
- **Error Handling** - Centralized error handling with custom error classes
- **Kafka Integration** - Optional event streaming support
- **Testing** - Jest test framework
- **Docker Support** - Containerized deployment ready

## Prerequisites

- Node.js 18+
- Yarn or npm package manager
- MySQL, PostgreSQL, or MongoDB (configured via DATABASE_URL)
- Docker & Docker Compose (optional, for containerized deployment)
- Kafka (optional, for event streaming)
- Redis (optional, for caching/sessions)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/abjshawty/server.git
cd server
```

### 2. Install dependencies

```bash
yarn install
# or
npm install
```

### 3. Set up environment variables

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Central Config
APP_HOST='0.0.0.0'                    # Host address
APP_PORT=3000                          # Server port
AUTH_ENABLED=1                         # Enable authentication (1 for true, 0 for false)
CORS_ORIGIN='*'                        # CORS Origin
DATABASE_URL='mysql://user:password@localhost:3306/dbname'  # Database connection string
JWT_SECRET='your-secret-key'           # JWT Secret for token signing
LANGUAGE='en-US'                       # Default language

# Kafka (optional - for event streaming)
KAFKA_BROKER=''                        # Kafka broker address
KAFKA_CLIENT_ID=''                     # Kafka client identifier
KAFKA_GROUP_ID=''                      # Kafka consumer group
KAFKA_ROLE=''                          # Role: 'producer', 'consumer', 'both', or 'none'
KAFKA_TOPICS=''                        # Comma-separated list of topics
KAFKAJS_NO_PARTITIONER_WARNING=1       # Disable partitioner warning

# Redis (optional)
REDIS_URL=''                           # Redis connection URL

# Additional integrations available in .env.example:
# - AWS S3 (file storage)
# - Mail (SMTP configuration)
# - Paydunya (payment gateway)
# - Twilio (SMS/messaging)
```

### 4. Database Setup

Run database migrations:

```bash
# Generate Prisma Client
yarn db:gen
# or
npx prisma generate

# Run migrations
yarn db:migrate
# or
npx prisma migrate dev --name dev

# Reset database (if needed)
yarn db:reset
```

## Development

### Start development server

```bash
yarn dev
# or
npm run dev
```

The server will start with:
- **API Documentation**: `http://localhost:3000/` (Swagger UI)
- **API Endpoints**: `http://localhost:3000/v0/*` (versioned API routes)
- **Health Check**: `http://localhost:3000/v0/close` (graceful shutdown endpoint)

### Build for production

```bash
# Build TypeScript
yarn build
# or
npm run build

# Start production server
yarn start
# or
npm start
```

## Code Generation

Generate CRUD endpoints and related files:

```bash
yarn create
# or
npm run create
```

This command will:
1. Generate Prisma client
2. Run the generator helper to create controllers, services, routes, and schemas
3. Format the code with Prettier

## Testing

Run tests in watch mode:

```bash
yarn test
# or
npm test
```

## Docker

Build and run the application using Docker:

```bash
# Build the Docker image
docker build -t server-template .

# Run the container
docker run -p 3000:3000 --env-file .env server-template
```

## Project Structure

```
server/
├── src/
│   ├── index.ts          # Application entry point
│   ├── api/              # API handlers (request/response logic)
│   ├── controllers/      # Database controllers (data access layer)
│   ├── db/               # Database connection and utilities
│   ├── errors/           # Custom error classes
│   ├── helpers/          # Core helpers (server, env, factories)
│   ├── locales/          # Internationalization files
│   ├── logs/             # Application logs (error, info, warnings)
│   ├── messages/         # System messages and notifications
│   ├── routes/           # Route definitions and registration
│   ├── schemas/          # JSON schemas for validation and docs
│   ├── services/         # Business logic layer
│   ├── test/             # Test setup and utilities
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions (auth, init, etc.)
├── prisma/
│   └── schema.prisma     # Database schema and models
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment variables template
├── .gitignore
├── .prettierrc           # Prettier configuration
├── package.json
├── tsconfig.json         # TypeScript configuration
└── yarn.lock             # Yarn dependency lock file
```

## Available Scripts

- `yarn build` - Build TypeScript to production
- `yarn dev` - Start development server with hot-reload (nodemon)
- `yarn start` - Start production server
- `yarn test` - Run tests in watch mode with Jest
- `yarn format` - Format code with Prettier
- `yarn db:gen` - Generate Prisma client from schema
- `yarn db:migrate` - Run database migrations
- `yarn db:reset` - Reset database, reinstall dependencies, and run migrations
- `yarn create` - Generate CRUD endpoints (controllers, services, routes, schemas) and format code

## Architecture

This template follows a layered architecture pattern:

1. **Routes Layer** (`src/routes/`) - Defines HTTP endpoints and registers them with Fastify
2. **API Layer** (`src/api/`) - Handles request/response logic and formatting
3. **Service Layer** (`src/services/`) - Contains business logic
4. **Controller Layer** (`src/controllers/`) - Manages database operations via Prisma
5. **Schema Layer** (`src/schemas/`) - Defines validation and OpenAPI documentation

### Example Flow

```
HTTP Request → Route → Auth Middleware → API Handler → Service → Controller → Database
                ↓                                                                  ↓
         JSON Schema Validation                                          Prisma Query
                ↓                                                                  ↓
          Swagger Docs                                                    Type-safe Result
```

## Authentication

JWT authentication is built-in and can be enabled/disabled via the `AUTH_ENABLED` environment variable.

- Authentication middleware is located in `src/utils/auth.ts`
- Routes can be protected by adding the `auth` preHandler
- JWT secret must be configured in `.env` as `JWT_SECRET`

Example protected route:
```typescript
server.route({
    method: 'POST',
    url: '/',
    schema: schema.create,
    preHandler: auth,  // Requires valid JWT token
    handler: api.create
});
```

## Logging

The server uses Pino for structured logging with multiple output targets:

- **Console Outputs**: Error, Warning (Info console output is commented out by default)
- **File Outputs**: 
  - `src/logs/error.log` - Error level logs
  - `src/logs/server.log` - Info level logs
  - `src/logs/warnings.log` - Warning level logs

Logs include timestamps and are formatted with `pino-pretty` for readability.

## API Documentation

Interactive API documentation is automatically generated and available at the root path (`/`) when the server is running. The documentation is powered by Swagger UI and reflects all defined schemas and routes.

Features:
- Try out API endpoints directly from the browser
- View request/response schemas
- See all available endpoints organized by tags
- Automatic OpenAPI 3.0 specification generation

## License

This project is licensed under the WTFPL License - see the [license](https://www.wtfpl.net/txt/copying/ "WTFPL License") file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
