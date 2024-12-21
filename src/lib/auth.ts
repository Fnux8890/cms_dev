import { z } from "zod"
import bcrypt from 'bcryptjs'
import { db_ops } from './db'

// Define user schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["admin", "editor", "viewer"]),
})

export type User = z.infer<typeof userSchema>

// Session management
let currentSession: { id: string; user: User } | null = null

// Helper functions
export async function loginUser(email: string, password: string) {
  try {
    const user = db_ops.findUser(email)
    if (!user) {
      return { success: false, error: "User not found" }
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return { success: false, error: "Invalid password" }
    }

    // Create a new session
    const session = db_ops.createSession(user.id)
    const { password: _, ...userWithoutPassword } = user
    const userWithTypedRole = {
      ...userWithoutPassword,
      role: userWithoutPassword.role as "admin" | "editor" | "viewer"
    }
    currentSession = { id: session.id, user: userWithTypedRole }

    return { success: true, user: userWithTypedRole, sessionId: session.id }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function registerUser(name: string, email: string, password: string) {
  try {
    const existingUser = db_ops.findUser(email)
    if (existingUser) {
      return { success: false, error: "Email already exists" }
    }

    const user = await db_ops.createUser(email, name, password)
    return { success: true, user: { ...user, role: user.role as "admin" | "editor" | "viewer" } }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getCurrentUser() {
  if (!currentSession) {
    return null
  }

  const session = db_ops.getSession(currentSession.id)
  if (!session) {
    currentSession = null
    return null
  }

  return {
    id: session.user_id,
    email: session.email,
    name: session.name,
    role: session.role as "admin" | "editor" | "viewer",
  }
}

export async function logout() {
  if (currentSession) {
    db_ops.removeSession(currentSession.id)
    currentSession = null
  }
}

// Clean up function for tests
export function __cleanup() {
  currentSession = null
}
 