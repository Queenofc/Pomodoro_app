import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const getInitialAuthData = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    let user = localStorage.getItem("user");
    if (user && user !== "undefined") {
      try {
        user = JSON.parse(user);
      } catch (error) {
        user = null;
      }
    } else {
      user = null;
    }
    return {
      isAuthenticated: !!token,
      token,
      user,
    };
  }
  return {
    isAuthenticated: false,
    token: null,
    user: null,
  };
};

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(getInitialAuthData());

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
      token: null,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
