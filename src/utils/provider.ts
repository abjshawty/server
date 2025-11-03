export type database_provider = "mysql" | "sqlite" | "mongodb" | "cockroachdb" | "postgresql" | "sqlserver";

class Provider {
    static format_url (database_url: string): database_provider {
        const provider = database_url.split(':')[0];
        switch (provider) {
            case 'mysql':
                return 'mysql';
            case 'postgres':
                return 'postgresql';
            case 'sqlite':
                return 'sqlite';
            case 'mariadb':
                return 'mysql';
            case 'mssql':
                return 'sqlserver';
            case 'mongodb':
                return 'mongodb';
            case 'monogdb+srv':
                return 'mongodb';
            default:
                return 'mysql';
        }
    }
}

export default Provider;