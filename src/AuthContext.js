import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  // Load persisted auth data on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token) {
      setAuthData({
        isAuthenticated: true,
        token,
        user: user ? JSON.parse(user) : null,
      });
    }
  }, []);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuthData({
      isAuthenticated: true,
      token,
      user,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthData({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
