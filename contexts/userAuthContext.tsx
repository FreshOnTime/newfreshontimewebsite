"use client";

import { User, onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { auth } from "@/config/firebase";

interface UserAuthContextType {
  user: User | null;
}

const userAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);

interface UserAuthContextProviderProps {
  children: ReactNode;
}

export function UserAuthContextProvider({
  children,
}: UserAuthContextProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value = {
    user,
  };

  return (
    <userAuthContext.Provider value={value}>
      {children}
    </userAuthContext.Provider>
  );
}

export function useAuth(): UserAuthContextType {
  const context = useContext(userAuthContext);
  if (context === undefined) {
    throw new Error(
      "useUserAuth must be used within a UserAuthContextProvider"
    );
  }
  return context;
}
