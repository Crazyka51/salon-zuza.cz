// Database setup example using new Neon credentials
import { neon } from "@neondatabase/serverless"

const sql = neon(
  process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_9X0OfSNxFydi@ep-wispy-cloud-agr15smi-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require",
)

export async function initializeDatabase() {
  try {
    console.log("Initializing admin database...")

    // Test database connection
    const result = await sql`SELECT NOW() as current_time`
    console.log("Database connected successfully:", result[0].current_time)

    // Check if admin_users table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'admin_users'
    `

    if (tables.length === 0) {
      console.log("Admin tables not found. Please run the SQL scripts in the scripts/ folder.")
      return false
    }

    console.log("Admin database initialized successfully!")
    return true
  } catch (error) {
    console.error("Database initialization failed:", error)
    return false
  }
}

export async function createAdminUser(email: string, name: string, password: string, role = "admin") {
  try {
    // In a real implementation, you'd hash the password properly
    const bcrypt = await import("bcryptjs")
    const passwordHash = await bcrypt.hash(password, 10)

    const permissions =
      role === "admin"
        ? ["users.read", "users.create", "users.update", "users.delete", "settings.read", "settings.update"]
        : ["users.read"]

    const [user] = await sql`
      INSERT INTO admin_users (email, name, password_hash, role, permissions)
      VALUES (${email}, ${name}, ${passwordHash}, ${role}, ${JSON.stringify(permissions)})
      RETURNING id, email, name, role, permissions
    `

    console.log("Admin user created:", user)
    return user
  } catch (error) {
    console.error("Failed to create admin user:", error)
    return null
  }
}

export async function getUserByEmail(email: string) {
  try {
    const users = await sql`
      SELECT id, email, name, role, permissions, created_at
      FROM admin_users 
      WHERE email = ${email}
    `
    return users[0] || null
  } catch (error) {
    console.error("Failed to get user by email:", error)
    return null
  }
}
