import { GET } from './src/app/sorting/upload/route'

async function updateCache() {
	try {
		const res = await GET()

		if (res.ok) {
			console.log(`Cache updated at ${new Date().toISOString()}`);
		}

	} catch (err) {
		console.error("Failed to update cache:", err);
	}
}

export function register() {
	updateCache();

	setInterval(updateCache, 10_000);
}