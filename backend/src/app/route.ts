import {NextResponse} from "next/server";

/**
 * Get user information
 * @description Fetches detailed user information by ID
 * @response NextResponse
 * @openapi
 */
export async function GET() {
	return NextResponse.json({message: "Hello world!"});
}
