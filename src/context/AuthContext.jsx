import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("farmchain_token");
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("farmchain_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
    window.addEventListener("farmchain:unauthorized", logout);
    return () => window.removeEventListener("farmchain:unauthorized", logout);
  }, [loadUser, logout]);

  const saveSession = (data) => {
    localStorage.setItem("farmchain_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (credentials) => saveSession((await api.post("/auth/login", credentials)).data);
  const register = async (details) => saveSession((await api.post("/auth/register", details)).data);

  const updateProfile = async (details) => {
    const { data } = await api.put("/auth/me", details);
    setUser(data);
    return data;
  };

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, logout, updateProfile, refreshUser: loadUser }),
    [user, loading, loadUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
