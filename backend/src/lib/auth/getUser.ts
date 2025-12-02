import {NextRequest} from "next/server";
import {verifyToken} from "./verifyToken";

export function getUser(req: NextRequest) {
    const token = req.cookies.get("session")?.value;
    if (!token) return null;

    const decoded: any = verifyToken(token);
    if (!decoded) return null;

    return decoded; // { user_id, email }
}