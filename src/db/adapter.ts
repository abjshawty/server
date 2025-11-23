import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/default";
const dbms = connectionString?.split("://")[0];

function selectDatabaseAdapter () {
    switch (dbms) {
        case "postgresql": return new PrismaPg({ connectionString });
        case "mysql": return new PrismaMariaDb({
            host: "localhost" // TODO
        });
        default: return new PrismaPg({ connectionString });
    }
};

export default selectDatabaseAdapter();