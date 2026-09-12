import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyAccessToken } from "@/lib/auth-utils";
import { compare } from "bcryptjs";
// Použijeme relativní cestu místo alias
import prisma from '../../../../../../lib/prisma-client';

/**
 * API endpoint pro přihlášení uživatele
 * 
 * POST /api/admin/auth/v2/login
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Uživatelské jméno a heslo jsou povinné" }, 
        { status: 400 }
      );
    }
    
    // Vyhledání uživatele v tabulce admin_users podle username
    const users = await prisma.$queryRaw`
      SELECT id, username, email, role, password_hash as password
      FROM admin_users
      WHERE username = ${username} AND is_active = true
    `;
    
    // Výsledek SQL dotazu je pole, vezmeme první záznam
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Nesprávné uživatelské jméno nebo heslo" }, 
        { status: 401 }
      );
    }
    
    // Porovnání hesla
    const isValid = await compare(password, user.password);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Nesprávné uživatelské jméno nebo heslo" }, 
        { status: 401 }
      );
    }
    
    // Vytvoření tokenů - používáme username pro identifikaci
    const { accessToken } = await createSession(
      user.id,
      user.username, // Používáme username jako identifikátor
      user.role // Používáme roli z databáze
    );
    
    // Navrácení access tokenu a základních informací o uživateli
    return NextResponse.json({
      success: true,
      message: "Přihlášení proběhlo úspěšně",
      token: accessToken,
      user: {
        id: user.id,
        username: user.username, // Používáme uživatelské jméno
        displayName: user.username, // Používáme username jako displayName
        email: user.email, // Přidáme email pro úplnost
        role: user.role // Používáme roli z databáze
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Chyba serveru: " + error.message }, 
      { status: 500 }
    );
  }
}
