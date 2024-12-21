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

// Create sessions table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`)

// Export database operations
export const db_ops = {
  createUser: async (email: string, name: string, password: string, role: string = 'viewer') => {
    const hashedPassword = await bcrypt.hash(password, 10)
    const id = crypto.randomUUID()
    db.run('INSERT INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, email, name, hashedPassword, role])
    return { id, email, name, role }
  },

  findUser: (email: string) => {
    return db.query('SELECT * FROM users WHERE email = ?').get([email]) as
      { id: string; email: string; name: string; password: string; role: string } | null
  },

  createSession: (userId: string) => {
    const id = crypto.randomUUID()
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    db.run('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [id, userId, expiresAt])
    return { id, expiresAt }
  },

  getSession: (sessionId: string) => {
    const now = Date.now()
    return db.query(`
      SELECT s.*, u.*
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND s.expires_at > ?
    `).get([sessionId, now]) as
      { id: string; user_id: string; expires_at: number; email: string; name: string; role: string } | null
  },

  removeSession: (sessionId: string) => {
    db.run('DELETE FROM sessions WHERE id = ?', [sessionId])
  },

  cleanupSessions: () => {
    const now = Date.now()
    db.run('DELETE FROM sessions WHERE expires_at <= ?', [now])
  }
}

// Clean up expired sessions periodically
setInterval(() => {
  db_ops.cleanupSessions()
}, 60 * 60 * 1000) // Every hour