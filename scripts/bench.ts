import autocannon from 'autocannon';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const hostEnv = process.env.APP_HOST || 'localhost';
const host = hostEnv === '0.0.0.0' ? 'localhost' : hostEnv;
const port = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000;

// Keep this aligned with src/helpers/env.ts (apiVersion computed from package.json major)
const apiVersion = 'v0';

const url = `http://${host}:${port}/${apiVersion}/info`;

const connections = process.env.BENCH_CONNECTIONS ? parseInt(process.env.BENCH_CONNECTIONS, 10) : 50;
const durationSeconds = process.env.BENCH_DURATION ? parseInt(process.env.BENCH_DURATION, 10) : 20;
const pipelining = process.env.BENCH_PIPELINING ? parseInt(process.env.BENCH_PIPELINING, 10) : 1;

console.log(`Benchmarking ${url}`);
console.log(`connections=${connections} duration=${durationSeconds}s pipelining=${pipelining}`);
console.log('Tip: start the server first (yarn dev)');

const instance = autocannon(
	{
		url,
		connections,
		duration: durationSeconds,
		pipelining
	},
	(err, result) => {
		if (err) {
			console.error(err);
			process.exitCode = 1;
			return;
		}
		autocannon.printResult(result);
	}
);

autocannon.track(instance, { renderProgressBar: true });
