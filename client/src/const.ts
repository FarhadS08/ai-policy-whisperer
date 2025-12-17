// Clerk handles authentication - no manual OAuth URL needed
// This file is kept for backward compatibility

export const getLoginUrl = () => {
  // Clerk handles login via SignInButton component
  // This function is deprecated
  return '/';
};
