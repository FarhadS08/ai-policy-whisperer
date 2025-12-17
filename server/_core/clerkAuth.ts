import { createClerkClient, verifyToken } from '@clerk/backend';
import type { Request } from 'express';

// Initialize Clerk with secret key
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkSecretKey) {
  console.error('[Clerk] ERROR: CLERK_SECRET_KEY is not configured!');
}

const clerk = createClerkClient({ secretKey: clerkSecretKey || '' });

export interface ClerkUser {
  id: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  role: 'user' | 'admin';
}

/**
 * Verify Clerk session token from request
 * Returns user info if authenticated, null otherwise
 */
export async function verifyClerkSession(req: Request): Promise<ClerkUser | null> {
  try {
    // Get the session token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : req.cookies?.__session;

    if (!sessionToken || !clerkSecretKey) {
      return null;
    }

    // Verify the session token with Clerk
    const payload = await verifyToken(sessionToken, {
      secretKey: clerkSecretKey,
    });

    const userId = payload.sub;

    if (!userId) {
      return null;
    }

    // Get user details from Clerk
    const user = await clerk.users.getUser(userId);

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || null,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
      imageUrl: user.imageUrl || null,
      role: 'user', // Default role, can be extended with Clerk metadata
    };
  } catch (error) {
    console.warn('[Clerk] Session verification failed:', error);
    return null;
  }
}

/**
 * Get user by Clerk user ID
 */
export async function getClerkUser(userId: string): Promise<ClerkUser | null> {
  try {
    const user = await clerk.users.getUser(userId);
    
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || null,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
      imageUrl: user.imageUrl || null,
      role: 'user',
    };
  } catch (error) {
    console.error('[Clerk] Failed to get user:', error);
    return null;
  }
}

export { clerk };
