import axios from "axios";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
export const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL;

export const AuthContextProvider = ({ children }) => {
  AuthContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // LOGIN
  const login = async (inputs) => {
    try {
      const res = await axios.post(`${API}/api/login`, inputs, {
        withCredentials: true,
      });

      setCurrentUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // LOGOUT (frontend-only for now)
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};