const API_URL = "http://api.localhost/sorting/upload";

export function startRedditor(intervalMs: number = 60_000) {
	async function updateCache() {
		try {
			const res = await fetch(API_URL);
			const data = await res.json();
			console.log(`Cache updated: ${data.cached} videos at ${new Date().toISOString()}`);
		} catch (err) {
			console.error("Failed to update cache:", err);
		}
	}

	updateCache();

	setInterval(updateCache, intervalMs);
}
