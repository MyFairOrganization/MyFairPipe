async function updateCache() {
	try {
		const res = await fetch("http://localhost:3000/sorting/upload");
	} catch (err) {
		console.error("Failed to update cache:", err);
	}
}

export function register() {
	updateCache();

	setInterval(updateCache, 60_000);
}