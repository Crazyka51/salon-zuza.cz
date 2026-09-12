import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth-utils";

/**
 * API endpoint pro odhlášení uživatele
 * 
 * POST /api/admin/auth/v2/logout
 */
export async function POST(request: NextRequest) {
  try {
    await deleteSession();
    
    return NextResponse.json({
      success: true,
      message: "Odhlášení proběhlo úspěšně"
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Chyba serveru: " + error.message }, 
      { status: 500 }
    );
  }
}
