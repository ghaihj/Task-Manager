// components/AdminRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading, admin } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  //   console.log(user.is_admin);
  if (!isAuthenticated && admin !== 1) {
    return <Navigate to="/login" />;
  }

  return children;
}
