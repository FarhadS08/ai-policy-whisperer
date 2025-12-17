// This file is deprecated - use Clerk's useAuth from @/contexts/ClerkContext instead
// Keeping this file to prevent import errors from other parts of the codebase

export function useAuth() {
  console.warn('useAuth from _core/hooks is deprecated. Use useAuth from @/contexts/ClerkContext instead.');
  return {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    refresh: () => {},
    logout: () => {},
  };
}
