import type { APIRoute } from 'astro'
import { Database } from 'bun:sqlite'
import bcrypt from 'bcryptjs'

// Initialize database
const db = new Database('users.db')

// Create users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'editor', 'viewer'))
  )
`)

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, password } = await request.json()

    // Check if user exists
    const existingUser = db.query('SELECT * FROM users WHERE email = ?').get([email])
    if (existingUser) {
      console.log('Registration failed: Email already exists', email)
      return new Response(
        JSON.stringify({ success: false, error: 'Email already exists' }),
        { status: 400 }
      )
    }

    // Create new user
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const id = crypto.randomUUID()
      db.run(
        'INSERT INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)',
        [id, email, name, hashedPassword, 'viewer']
      )

      console.log('User registered successfully:', { id, email, name })
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { id, email, name, role: 'viewer' }
        }),
        { status: 201 }
      )
    } catch (dbError) {
      console.error('Database error during registration:', dbError)
      throw dbError
    }

  } catch (err) {
    console.error('Registration error:', err)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An error occurred during registration' 
      }),
      { status: 500 }
    )
  }
} 