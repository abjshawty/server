import { config } from "dotenv";
import { version } from "../../package.json";

export type role = "producer" | "consumer" | "both" | "none";

process.env.node_env !== "production" ? config() : "";
export const apiVersion: string = `v${version.split(".")[0]}` || "v1";
export const authEnabled: boolean = process.env.AUTH_ENABLED === "1" || false;
export const corsOrigin: string =
  process.env.CORS_ORIGIN ||
  `http://${process.env.APP_HOST || "localhost"}:${process.env.APP_PORT || 3000}`;
export const database_url: string =
  `${process.env.DATABASE_URL}` || "mysql://root@localhost:3306/data";
export const host: string = process.env.APP_HOST || "localhost";
export const jwtSecret: string = process.env.JWT_SECRET || "secret";
export const kafkaBroker: string = process.env.KAFKA_BROKER || "localhost:9092";
export const kafkaClientId: string = process.env.KAFKA_CLIENT_ID || "server";
export const kafkaGroupId: string = process.env.KAFKA_GROUP_ID || "server";
export const language: string = process.env.LANGUAGE || "en-US";
export const murder: () => void = () => process.exit(0);
export const port: number = process.env.APP_PORT
  ? parseInt(process.env.APP_PORT)
  : 3000;
export const topics: string[] = process.env.KAFKA_TOPICS
  ? process.env.KAFKA_TOPICS.split(",")
  : ["server"];
export const role: role = (process.env.KAFKA_ROLE as role) || "none";
