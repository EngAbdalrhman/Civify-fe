// Mock auth hook for demonstration
export function useAuth() {
  // Mock user data - treat as admin for testing
  const user = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin", // Change to 'user' to test non-admin view
    avatar: null
  };

  const isAdmin = user.role === 'admin';

  return {
    user,
    isAdmin,
    isLoading: false
  };
}
