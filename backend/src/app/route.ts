import {NextResponse} from "next/server";

export async function OPTIONS() {
	const domain = process.env.DOMAIN ?? "";
	return new NextResponse(null, {
		status: 204, headers: {
			"Access-Control-Allow-Origin": domain,
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
		},
	});
}

/**
 * Get user information
 * @description Fetches detailed user information by ID
 * @response NextResponse
 * @openapi
 */
export async function GET() {
	return NextResponse.json({message: "API is running"});
}
