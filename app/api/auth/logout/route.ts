import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/utils/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";

export async function POST() {
    try {
        await clearAuthCookies();
        return NextResponse.json(successResponse({ message: "Logged out" }));
    } catch (err) {
        return handleApiError(err);
    }
}
