import type { APIRoute } from 'astro'
import { Database } from 'bun:sqlite'

// Initialize database
const db = new Database('users.db')

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const sessionId = cookies.get('session_id')?.value

    if (sessionId) {
      // Remove session from database
      db.run('DELETE FROM sessions WHERE id = $1', [sessionId])

      // Clear session cookie
      cookies.delete('session_id', { path: '/' })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Set-Cookie': 'session_id=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
      }
    })
  } catch (err) {
    console.error('Logout error:', err)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An error occurred during logout' 
      }),
      { status: 500 }
    )
  }
} 