import type { APIRoute } from 'astro'
import { Database } from 'bun:sqlite'
import bcrypt from 'bcryptjs'

// Initialize database
const db = new Database('users.db')

// Create sessions table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`)

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = db.query('SELECT * FROM users WHERE email = ?').get([email]) as
      { id: string; email: string; name: string; password: string; role: string } | null

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid password' }),
        { status: 401 }
      )
    }

    // Create session
    const sessionId = crypto.randomUUID()
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    db.run(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionId, user.id, expiresAt]
    )

    // Clean up old sessions
    db.run('DELETE FROM sessions WHERE expires_at <= ?', [Date.now()])

    const { password: _, ...userWithoutPassword } = user

    return new Response(
      JSON.stringify({
        success: true,
        user: userWithoutPassword,
        sessionId
      }),
      {
        status: 200,
        headers: {
          'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
        }
      }
    )
  } catch (err) {
    console.error('Login error:', err)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An error occurred during login' 
      }),
      { status: 500 }
    )
  }
} 