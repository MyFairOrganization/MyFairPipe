async function updateCache() {
	try {
		const res = await fetch("http://localhost:3000/sorting/upload");

		if (res.ok) {
			console.log(`Cache updated at ${new Date().toISOString()}`);
		}

	} catch (err) {
		console.error("Failed to update cache:", err);
	}
}

export function register() {
	updateCache();

	setInterval(updateCache, 60_000);
}