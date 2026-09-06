'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { apiFetch } from '@/lib/api/client';
import { scheduleIdleTask } from '@/lib/utils/idleCallback';

interface User {
  userId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber: string;
  role: string;
  _id: string;
  registrationAddress?: {
    recipientName: string;
    streetAddress: string;
    streetAddress2?: string;
    town: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    phoneNumber: string;
    type: 'Home' | 'Business' | 'School' | 'Other';
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export interface ServerError extends Error {
  fieldErrors?: Record<string, string[]>;
}

interface SignupData {
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber: string;
  password: string;
  registrationAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const clearError = () => setError(null);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await apiFetch('/api/auth/refresh', { method: 'POST' });

      if (response.ok) {
        const userResponse = await apiFetch('/api/auth/me');
        if (userResponse.ok) {
          const data = await userResponse.json();
          setUser(data.user);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await apiFetch('/api/auth/me');

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else if (response.status === 401) {
          const data = await response.json().catch(() => null) as { canRefresh?: boolean } | null;
          if (data?.canRefresh) {
            await refreshAuth();
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    const shouldCheckImmediately =
      pathname.startsWith('/admin') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/orders') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/bags') ||
      pathname.startsWith('/wishlist') ||
      pathname.startsWith('/checkout');

    if (shouldCheckImmediately) {
      checkAuth();
      return;
    }

    const deferredTask = scheduleIdleTask(checkAuth, {
      timeout: 4000,
      fallbackDelayMs: 2500,
    });

    return () => deferredTask.cancel();
  }, [pathname, refreshAuth, user]);

  const login = async (identifier: string, password: string) => {
    try {
      clearError();
      setLoading(true);

      const response = await apiFetch('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        return data.user;
      }

      setError(data.error || 'Login failed');
      throw new Error(data.error || 'Login failed');
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      clearError();
      setLoading(true);

      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await credential.user.getIdToken();
      const response = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Google sign-in failed');

      setUser(data.user);
      return data.user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      clearError();
      setLoading(true);

      const response = await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const responseData = await response.json();

      if (response.ok) {
        setUser(responseData.user);
        return;
      }

      const err = new Error(responseData.error || 'Signup failed') as ServerError;
      if (responseData.details) err.fieldErrors = responseData.details;
      if (responseData.errors) err.fieldErrors = { ...(err.fieldErrors || {}), ...responseData.errors };
      setError(responseData.error || 'Signup failed');
      throw err;
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiFetch('/api/auth/logout', { method: 'POST' });
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const value = React.useMemo(() => ({
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    signup,
    logout,
    refreshAuth,
  }), [user, loading, error, refreshAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
