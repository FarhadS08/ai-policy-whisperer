// Environment configuration - Clerk + Supabase only
// NO Manus OAuth or database references

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Clerk authentication
  clerkPublishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY ?? "",
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? "",
  // Supabase database
  supabaseUrl: process.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY ?? "",
  // Built-in APIs (for LLM, storage, etc.)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
