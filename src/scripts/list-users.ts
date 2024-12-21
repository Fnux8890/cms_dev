import { Database } from 'bun:sqlite'

const db = new Database('users.db')

try {
  const users = db.query('SELECT id, name, email, role FROM users').get()
  console.table(users ? [users] : [])
} catch (error) {
  console.error('Error fetching users:', error)
} 