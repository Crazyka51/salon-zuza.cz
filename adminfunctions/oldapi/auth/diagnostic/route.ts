import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth-utils";

/**
 * API endpoint pro diagnostiku autentizačního systému
 * GET /api/admin/auth/diagnostic
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateAdmin(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Uživatel není přihlášen nebo nemá oprávnění administrátora",
        authStatus: "unauthorized"
      }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Autentizace je funkční",
      authStatus: "authenticated",
      user: {
        username: user.username,
        role: user.role
      },
      diagnosticInfo: {
        timestamp: new Date().toISOString(),
        authMethod: "JWT + refresh token",
        envChecks: {
          databaseUrl: process.env.DATABASE_URL ? "Nastaveno" : "Chybí",
          jwtSecret: process.env.JWT_SECRET ? "Nastaveno" : "Chybí",
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Interní chyba serveru při diagnostice autentizace",
      error: error.message,
      authStatus: "error"
    }, { status: 500 });
  }
}
