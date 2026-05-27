import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [admin, setAdmin] = useState();
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const navigate = useNavigate();

  useEffect(
    (userData) => {
      const userInfo = fetch(BASE_URL + "/me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(userData),
      });

      if (userInfo) {
        setUser(userInfo);
      }
    },
    [token],
  );

  const register = async (userData) => {
    try {
      const response = await fetch(BASE_URL + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.access_token) {
        // localStorage.setItem("user", data.user);
        localStorage.setItem("token", data.access_token);
        setUser(data.user);
        setAdmin(data.user.is_admin);
        setToken(data.access_token);
        // console.log(data);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const login = async (userData) => {
    try {
      const response = await fetch(BASE_URL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.access_token) {
        // localStorage.setItem("user", data.user);
        localStorage.setItem("token", data.access_token);
        setUser(data.user);
        setAdmin(data.user.is_admin);
        setToken(data.access_token);
        console.log(data.user.is_admin);
        if (data.user.is_admin) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      const resposne = await fetch(BASE_URL + "/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      location.reload();
    } catch (err) {
      console.log(err);
    }
  };
  const isAuthenticated = !!token && !!user;

  const values = {
    register,
    login,
    user,
    token,
    logout,
    isAuthenticated,
    admin,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("Test");
  }

  return context;
};
