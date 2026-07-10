import { createContext, useContext } from 'react';
import { UserData } from '../types/navigation';

export interface AuthContextValue {
  user: UserData | null;
  signIn: (u: UserData) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<UserData>) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  signIn: async () => false,
  signOut: async () => {},
  updateUser: async () => false,
});

export const useAuth = () => useContext(AuthContext);