// import React, { createContext, useContext, useState, useEffect } from "react";
// import { getAuthToken, clearAuthToken } from "./api";

// interface AuthContextType {
//   isAuthenticated: boolean;
//   role: "Student" | "Admin" | null;
//   userEmail: string | null;
//   login: (email: string, role: "Student" | "Admin") => void;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [role, setRole] = useState<"Student" | "Admin" | null>(null);
//   const [userEmail, setUserEmail] = useState<string | null>(null);

//   useEffect(() => {
//     const token = getAuthToken();
//     const savedRole = sessionStorage.getItem("userRole") as
//       | "Student"
//       | "Admin"
//       | null;
//     const savedEmail = sessionStorage.getItem("userEmail");

//     if (token && savedRole) {
//       setIsAuthenticated(true);
//       setRole(savedRole);
//       setUserEmail(savedEmail);
//     }
//   }, []);

//   const login = (email: string, userRole: "Student" | "Admin") => {
//     setIsAuthenticated(true);
//     setRole(userRole);
//     setUserEmail(email);
//     sessionStorage.setItem("userRole", userRole);
//     sessionStorage.setItem("userEmail", email);
//   };

//   const logout = () => {
//     setIsAuthenticated(false);
//     setRole(null);
//     setUserEmail(null);
//     clearAuthToken();
//     sessionStorage.removeItem("userRole");
//     sessionStorage.removeItem("userEmail");
//   };

//   return (
//     <AuthContext.Provider
//       value={{ isAuthenticated, role, userEmail, login, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

/*  ---------*/
import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuthToken, clearAuthToken } from "./api";

type UiRole = "Student" | "Administrator"; // UI role
type ApiRole = "Reader" | "Writer"; // API/Identity role

const API_TO_UI: Record<ApiRole, UiRole> = {
  Reader: "Student",
  Writer: "Administrator",
};

interface AuthContextType {
  isAuthenticated: boolean;
  role: UiRole | null;
  userEmail: string | null;
  // login pozivaj iz Login forme — prosleđuješ UI rolu (Student/Administrator)
  login: (email: string, role: UiRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// mala util funkcija za dekodiranje JWT (bez biblioteka)
function decodeJwt<T = any>(token: string): T | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
    return payload as T;
  } catch {
    return null;
  }
}

// najčešći claim ključevi za role u .NET Identity JWT
function extractApiRoles(payload: any): string[] {
  return (
    payload?.role || // "role": "Writer" | ["Writer","..."]
    payload?.roles || // "roles": [...]
    payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    []
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UiRole | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();

    // pokušaj da izvučeš UI rolu i email iz tokena (najpouzdanije)
    if (token) {
      const payload = decodeJwt<any>(token);
      const exp = payload?.exp ? payload.exp * 1000 : undefined;
      if (exp && Date.now() > exp) {
        // token istekao
        clearAuthToken();
      } else {
        const apiRoles = extractApiRoles(payload);
        const uiRole: UiRole | null = apiRoles?.includes("Writer")
          ? "Administrator"
          : apiRoles?.includes("Reader")
          ? "Student"
          : (sessionStorage.getItem("userRole") as UiRole | null); // fallback

        const email =
          payload?.email || payload?.sub || sessionStorage.getItem("userEmail");

        if (uiRole) sessionStorage.setItem("userRole", uiRole);
        if (email) sessionStorage.setItem("userEmail", email);

        setRole(uiRole ?? null);
        setUserEmail(email ?? null);
        setIsAuthenticated(true);
        return;
      }
    }

    // fallback ako nema validnog tokena: probaj iz sessionStorage
    const savedRole = sessionStorage.getItem("userRole") as UiRole | null;
    const savedEmail = sessionStorage.getItem("userEmail");
    if (savedRole) {
      setIsAuthenticated(true);
      setRole(savedRole);
      setUserEmail(savedEmail);
    }
  }, []);

  // login iz UI (prima UI rolu – Student/Administrator)
  const login = (email: string, uiRole: UiRole) => {
    setIsAuthenticated(true);
    setRole(uiRole);
    setUserEmail(email);
    sessionStorage.setItem("userRole", uiRole);
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
    <AuthContext.Provider
      value={{ isAuthenticated, role, userEmail, login, logout }}
    >
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
