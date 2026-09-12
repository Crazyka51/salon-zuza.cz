import { NextRequest, NextResponse } from "next/server";
import { refreshSession } from "@/lib/auth-utils";

/**
 * API endpoint pro obnovení přístupového tokenu
 * 
 * GET /api/admin/auth/v2/refresh
 */
export async function GET(request: NextRequest) {
  try {
    const result = await refreshSession();
    
    if (!result) {
      return NextResponse.json(
        { success: false, message: "Nelze obnovit relaci" }, 
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Token byl úspěšně obnoven",
      token: result.accessToken,
      user: result.user
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Chyba serveru: " + error.message }, 
      { status: 500 }
    );
  }
}
