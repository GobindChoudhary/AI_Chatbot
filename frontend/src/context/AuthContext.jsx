import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/auth/me`,
        { method: "GET", credentials: "include" },
      );
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_DOMAIN}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      },
    );

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } else {
      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.message || "Login failed" };
    }
  };

  const register = async (userName, email, password) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_DOMAIN}/api/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userName, email, password }),
      },
    );

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } else {
      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.message || "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
