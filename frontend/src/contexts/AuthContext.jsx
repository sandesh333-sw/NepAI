import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8080");
      const res = await fetch(`${apiUrl}/api/auth/me`, {
        credentials: "include", // Include cookies
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8080");
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return { success: true };
      }
      const error = await res.json();
      return { success: false, message: error.message || "Login failed" };
    } catch (err) {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const register = async (email, password, displayName) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8080");
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return { success: true };
      }
      const error = await res.json();
      return { success: false, message: error.message || "Registration failed" };
    } catch (err) {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8080");
    await fetch(`${apiUrl}/api/auth/logout`, { 
        method: "POST", 
        credentials: "include" 
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);