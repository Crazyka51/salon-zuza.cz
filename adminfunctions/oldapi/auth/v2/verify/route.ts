import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, refreshSession } from "@/lib/auth-utils";

/**
 * API endpoint pro ověření platnosti tokenu
 * 
 * GET /api/admin/auth/v2/verify
 */
export async function GET(request: NextRequest) {
  try {
    // Získání access tokenu z hlavičky
    const authHeader = request.headers.get("Authorization");
    const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      if (payload) {
        // Token je platný
        return NextResponse.json({
          success: true,
          user: {
            userId: payload.userId,
            username: payload.username,
            role: payload.role
          }
        });
      }
    }
    
    // Pokud access token není nebo je neplatný, zkusíme refresh token
    const refreshResult = await refreshSession();
    if (refreshResult) {
      return NextResponse.json({
        success: true,
        message: "Access token byl obnoven",
        token: refreshResult.accessToken,
        user: refreshResult.user
      });
    }
    
    // Žádný validní token nebyl nalezen
    return NextResponse.json(
      { success: false, message: "Neplatný token" }, 
      { status: 401 }
    );
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Chyba serveru: " + error.message }, 
      { status: 500 }
    );
  }
}
