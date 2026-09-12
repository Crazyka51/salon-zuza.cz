import { type NextRequest, NextResponse } from "next/server";
import { settingsService } from "@/lib/settings-service";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/admin/settings
export const GET = requireAuth(
  async (request: NextRequest) => {
    try {
      const settings = await settingsService.getSettingsObject();
      return NextResponse.json(settings);
    } catch (error) {
      return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 });
    }
  },
  ["admin", "editor"],
);

// POST /api/admin/settings - Reset nastavení
export const POST = requireAuth(
  async (request: NextRequest) => {
    try {
      // Reset všech nastavení na výchozí hodnoty
      const settings = await settingsService.resetSettings();
      return NextResponse.json({ message: "Settings reset successfully", settings }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: "Failed to reset settings" }, { status: 500 });
    }
  },
  ["admin"],
);

// PUT /api/admin/settings - Aktualizace všech nastavení
export const PUT = requireAuth(
  async (request: NextRequest) => {
    try {
      const settings = await request.json();
      const updatedSettings = await settingsService.updateAllSettings(settings);
      return NextResponse.json({ 
        message: "Settings updated successfully", 
        settings: updatedSettings 
      }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: "Failed to update settings" }, { status: 500 });
    }
  },
  ["admin"],
);
