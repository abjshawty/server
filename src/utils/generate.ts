import { PrismaGenerator } from "../helpers/generator";
const generator = new PrismaGenerator();
generator.generate('Song').catch(console.error);