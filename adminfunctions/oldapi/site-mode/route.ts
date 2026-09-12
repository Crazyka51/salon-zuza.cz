import { type NextRequest, NextResponse } from "next/server";
import { settingsService } from "@/lib/settings-service";
import { requireAuth } from "@/lib/auth-utils";

// GET - získá aktuální stav režimu 'under_construction'
export const GET = requireAuth(
  async (request: NextRequest) => {
    try {
      const record = await settingsService.getSetting("under_construction");
      const value = record?.value === "true";
      return NextResponse.json({ under_construction: value });
    } catch (error) {
      return NextResponse.json({ message: "Failed to fetch site mode" }, { status: 500 });
    }
  },
  ["admin", "editor"],
);

// PUT - nastaví hodnotu režimu
export const PUT = requireAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const enabled = !!body.under_construction;
      await settingsService.setSetting("under_construction", enabled ? "true" : "false");
      return NextResponse.json({ message: "Site mode updated", under_construction: enabled });
    } catch (error) {
      return NextResponse.json({ message: "Failed to update site mode" }, { status: 500 });
    }
  },
  ["admin"],
);
