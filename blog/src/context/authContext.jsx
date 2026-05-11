import axios from "axios";
import { createContext, useEffect, useState } from "react";

// Create the AuthContext
export const AuthContext = createContext();
// create API
const API = import.meta.env.VITE_API_URL;

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // Login function with error handling
  const login = async (inputs) => {
    try {
      const res = await axios.post(`${API}/api/auth/login`, inputs);
      setCurrentUser(res.data);
    } catch (error) {
      console.error("Login failed:", error);
      // Optionally, add a way to show the error message to the user
    }
  };

  // Logout function with error handling
  const logout = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`);
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally, add a way to show the error message to the user
    }
  };

  // Store the user in local storage whenever currentUser changes
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
