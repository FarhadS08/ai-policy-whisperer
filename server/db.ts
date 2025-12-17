// Database helpers - Supabase ONLY
// NO Manus database (Drizzle/MySQL) - all data goes to Supabase

// This file is kept for backward compatibility but all actual database
// operations should use the Supabase client directly

// The Drizzle schema and MySQL connection are NOT used
// All conversation and message data is stored in Supabase

export async function getDb() {
  // Supabase is used instead - see client/src/services/supabaseService.ts
  console.warn("[Database] Drizzle/MySQL is disabled - use Supabase instead");
  return null;
}

// Legacy functions - not used, kept for type compatibility
export async function upsertUser() {
  console.warn("[Database] User management is handled by Clerk - not Drizzle");
  return;
}

export async function getUserByOpenId() {
  console.warn("[Database] User management is handled by Clerk - not Drizzle");
  return undefined;
}

// Conversation functions are handled by Supabase service
// See: client/src/services/supabaseService.ts
