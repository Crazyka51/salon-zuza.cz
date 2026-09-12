import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth-utils";

export async function POST() {
  try {
    // Smaže session pomocí našeho auth utility
    await deleteSession();
    
    return NextResponse.json({
      success: true,
      message: "Odhlášení úspěšné",
    });
  } catch (error) {
    return NextResponse.json({ error: "Chyba při odhlašování" }, { status: 500 });
  }
}
