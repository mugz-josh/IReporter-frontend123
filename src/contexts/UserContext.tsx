import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { storage } from "@/utils/storage";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_admin: boolean;
  profile_picture?: string;
  created_at: string;
  updated_at: string;

  name: string;
  role: "admin" | "user";
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      const userWithExtras: User = {
        ...currentUser,
        name: `${currentUser.first_name} ${currentUser.last_name}`,
        role: currentUser.is_admin ? "admin" : "user",
      };
      setUserState(userWithExtras);
    }
  }, []);

  const setUser = (newUser: User | null) => {
    if (newUser) {
      const userWithExtras: User = {
        ...newUser,
        name: `${newUser.first_name} ${newUser.last_name}`,
        role: newUser.is_admin ? "admin" : "user",
      };
      setUserState(userWithExtras);
      storage.setCurrentUser(userWithExtras);
    } else {
      setUserState(null);
      storage.clearCurrentUser();
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
