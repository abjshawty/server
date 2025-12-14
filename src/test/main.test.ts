/**
 * Basic test suite for server template
 */

const dbEnabled = process.env.TEST_DB_ENABLED === '1';
const itIfDb = dbEnabled ? it : it.skip;

describe('Server Template - Basic Tests', () => {
		describe('Database Connection', () => {
			itIfDb('should connect to the database', async () => {
				const { PrismaClient } = await import('@prisma/client');
				const prisma = new PrismaClient();
				await expect(prisma.$connect()).resolves.not.toThrow();
				await prisma.$disconnect();
			});

			itIfDb('should execute a raw query', async () => {
				const { PrismaClient } = await import('@prisma/client');
				const prisma = new PrismaClient();
				await prisma.$connect();
				const result = await prisma.$queryRaw`SELECT 1 as value`;
				expect(result).toBeDefined();
				expect(Array.isArray(result)).toBe(true);
				await prisma.$disconnect();
			});
		});

	describe('Environment Configuration', () => {
		it('should have required environment variables', () => {
			// Check critical environment variables are set
			expect(process.env.DATABASE_URL).toBeDefined();
		});

		it('should have valid port configuration', () => {
			const port = process.env.APP_PORT;
			if (port) {
				const portNumber = parseInt(port, 10);
				expect(portNumber).toBeGreaterThan(0);
				expect(portNumber).toBeLessThan(65536);
			}
		});
	});

	describe('TypeScript Configuration', () => {
		it('should support async/await', async () => {
			const asyncFunction = async () => {
				return 'success';
			};
			const result = await asyncFunction();
			expect(result).toBe('success');
		});

		it('should support ES6+ features', () => {
			const array = [1, 2, 3, 4, 5];
			const doubled = array.map(n => n * 2);
			expect(doubled).toEqual([2, 4, 6, 8, 10]);
		});
	});
});
