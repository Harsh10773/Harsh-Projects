
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for fake user in localStorage
    const checkFakeUser = () => {
      const fakeUser = localStorage.getItem('fake-user');
      if (fakeUser) {
        setUser(JSON.parse(fakeUser));
      }
      setLoading(false);
    };

    checkFakeUser();

    // Listen for storage changes (for logout from other tabs)
    const handleStorageChange = () => {
      checkFakeUser();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signOut = async () => {
    localStorage.removeItem('fake-user');
    setUser(null);
  };

  return {
    user,
    session: user ? { user } : null,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
}
