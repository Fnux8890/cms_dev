/// <reference types="astro/client" />

declare module 'bun:sqlite' {
  export class Database {
    constructor(filename: string)
    run(sql: string, params?: any[]): void
    query(sql: string): { get(params?: any[]): any }
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    fetch: typeof fetch
  }
  const fetch: typeof fetch
  const Response: typeof Response
  const crypto: Crypto
}

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "editor" | "viewer"
}

declare namespace App {
  interface Locals {
    user?: User | null
  }
}

declare namespace Astro {
  interface APIContext {
    session: {
      get(key: string): Promise<any>
      set(key: string, value: any): Promise<void>
      clear(): Promise<void>
    }
  }

  interface MiddlewareContext {
    session: {
      get(key: string): Promise<any>
      set(key: string, value: any): Promise<void>
      clear(): Promise<void>
    }
  }
} 