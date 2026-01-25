# bun-server

A backend server template built with **Bun** and **Convex**.

This is a rewrite of a previous template that used Node.js, Fastify, and Prisma. The goal of this rewrite is to be faster, simpler to maintain, and modular by default.

## What you get

- **Modular / plugin-centric structure**
  - Keep the base server lightweight.
  - Add capabilities only when you need them.
- **Swagger documentation**
- **Convex UI** for managing your database

> Note: Auth, Payment, Queue, Storage, and Cache plugins are **not included by default**.

## Core technologies

- **Bun Server** — A fast, all-in-one JavaScript runtime. (Considering upgrading to Elysia if necessary)
- **Convex** — A serverless backend framework for managing databases.
- **TypeScript** — JavaScript with static types.

## Planned plugins

- **Auth**: Better-Auth
- **Payment**: Stripe / BetterAuth with Stripe
- **Queue**: Kafka
- **Storage**: S3 Buckets
- **Cache**: Redis
- **Notifications**: Email via Resend/NodeMailer & SMS via Twilio
- **Analytics**: PostHog
- **Security**: Rate Limiting, IP Blocking, API Key Management
- **Logging**: Bun Logger
- **Monitoring**: Sentry

## Installation

Install dependencies:

```bash
bun install
```

Run the server:

```bash
bun start
```

## Notes

This project was created using `bun init` in bun v1.3.6. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.