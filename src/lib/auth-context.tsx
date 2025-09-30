import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuthToken, clearAuthToken } from "./api";

interface AuthContextType {
  isAuthenticated: boolean;
  role: "Student" | "Admin" | null;
  userEmail: string | null;
  login: (email: string, role: "Student" | "Admin") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<"Student" | "Admin" | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const savedRole = sessionStorage.getItem("userRole") as "Student" | "Admin" | null;
    const savedEmail = sessionStorage.getItem("userEmail");
    
    if (token && savedRole) {
      setIsAuthenticated(true);
      setRole(savedRole);
      setUserEmail(savedEmail);
    }
  }, []);

  const login = (email: string, userRole: "Student" | "Admin") => {
    setIsAuthenticated(true);
    setRole(userRole);
    setUserEmail(email);
    sessionStorage.setItem("userRole", userRole);
    sessionStorage.setItem("userEmail", email);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUserEmail(null);
    clearAuthToken();
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userEmail");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
