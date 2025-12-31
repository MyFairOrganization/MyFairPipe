import { GET } from './src/app/sorting/upload/route'

async function updateCache() {
	try {
		await GET()

	} catch (err) {
		console.error("Failed to update cache:", err);
	}
}

export function register() {
	updateCache();

	setInterval(updateCache, 10_000);
}