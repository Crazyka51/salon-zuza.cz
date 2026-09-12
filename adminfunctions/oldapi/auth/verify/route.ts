import { type NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth-utils";

// Tato API route je vždy dynamická, protože pracuje s cookies
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateAdmin(request);

    if (!user) {
      return NextResponse.json({ error: "Uživatel není přihlášen" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        username: user.username,
        role: user.role,
        displayName: user.username === "pavel@example.com" ? "Pavel Fišer" : "Administrátor",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Chyba při ověřování uživatele" }, { status: 500 });
  }
}
