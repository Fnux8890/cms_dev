/// <reference types="astro/client" />
import { defineMiddleware } from 'astro:middleware'
import { Database } from 'bun:sqlite'

// Initialize database
const db = new Database('users.db')

export const onRequest = defineMiddleware(async ({ cookies, url, redirect, locals }, next) => {
  // Log incoming request
  console.log('--> Incoming request:', {
    path: url.pathname,
    sessionCookie: cookies.get('session_id')?.value
  })

  // Allow /api/ routes to bypass auth middleware
  if (url.pathname.startsWith('/api/')) {
    console.log('   Bypassing auth middleware for /api route.')
    return next()
  }

  const isAuthPage = url.pathname.startsWith('/auth/')
  const sessionId = cookies.get('session_id')?.value

  if (sessionId) {
    console.log(`   Checking session for sessionId = ${sessionId}`)
    const now = Date.now()
    const session = db.query(`
      SELECT s.*, u.*
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND s.expires_at > ?
    `).get([sessionId, now]) as
      { id: string; user_id: string; expires_at: number; email: string; name: string; role: string } | null

    if (session) {
      console.log(`   Session found for user: ${session.email}, expires at: ${new Date(session.expires_at)}`)
      // If on auth page and logged in, redirect to home
      if (isAuthPage) {
        console.log('   Already logged in, redirecting to /')
        return redirect('/')
      }

      // Add user info to locals
      locals.user = {
        id: session.user_id,
        email: session.email,
        name: session.name,
        role: session.role as "admin" | "editor" | "viewer"
      }
      console.log(`   Setting locals.user =>`, locals.user)
      return next()
    } else {
      console.log('   No valid session or session expired.')
    }
  } else {
    console.log('   No session_id cookie found.')
  }

  // Not logged in, not an auth page -> redirect to /auth/login
  if (!isAuthPage) {
    console.log('   Redirecting to /auth/login (no session).')
    return redirect('/auth/login')
  }

  // Auth page, let it pass
  console.log('   User not logged in but on auth page => allow')
  return next()
}) 