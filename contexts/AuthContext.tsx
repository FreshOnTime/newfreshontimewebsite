'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

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

  const clearError = () => setError(null);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Retry getting user info
        const userResponse = await fetch('/api/auth/me', {
          credentials: 'include'
        });

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

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else if (response.status === 401) {
          // Try to refresh token
          await refreshAuth();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [refreshAuth]);

  const login = async (identifier: string, password: string) => {
    try {
      clearError();
      setLoading(true);
      console.log('AuthContext: Starting login request...');

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();
      console.log('AuthContext: Login response data:', data);

      if (response.ok) {
        console.log('AuthContext: Setting user data:', data.user);
        setUser(data.user);
        return data.user; // Return user data for immediate use
      } else {
        setError(data.error || 'Login failed');
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      clearError();
      setLoading(true);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (response.ok) {
        setUser(responseData.user);
      } else {
        // If backend returned validation details, include them on the thrown error
        const err = new Error(responseData.error || 'Signup failed') as ServerError;
        if (responseData.details) {
          err.fieldErrors = responseData.details;
        }
        // Sometimes backend returns nested errors or arrays
        if (responseData.errors) {
          err.fieldErrors = { ...(err.fieldErrors || {}), ...responseData.errors };
        }
        setError(responseData.error || 'Signup failed');
        throw err;
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
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
    signup,
    logout,
    refreshAuth
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
