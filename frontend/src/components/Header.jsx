import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    FaHome,
    FaTasks,
    FaSignInAlt,
    FaUserPlus,
    FaSignOutAlt,
    FaUser,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../components/Header.css";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAuthenticated, admin } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav>
            <div className="logo">
                <FaTasks className="logo-icon" />
                <span>Task Manager</span>
            </div>
            <ul>
                <li>
                    <Link
                        to="/"
                        className={location.pathname === "/" ? "active" : ""}
                    >
                        <FaHome className="icon" />
                        <span>Home</span>
                    </Link>
                </li>

                {/* Only show Tasks link if user is logged in */}
                {isAuthenticated && (
                    <li>
                        <Link
                            to="/tasks"
                            className={
                                location.pathname === "/tasks" ? "active" : ""
                            }
                        >
                            <FaTasks className="icon" />
                            <span>Tasks</span>
                        </Link>
                    </li>
                )}

                {/* Show Login/Register only if user is NOT logged in */}
                {!isAuthenticated ? (
                    <>
                        <li>
                            <Link
                                to="/login"
                                className={
                                    location.pathname === "/login"
                                        ? "active"
                                        : ""
                                }
                            >
                                <FaSignInAlt className="icon" />
                                <span>Login</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/register"
                                className={
                                    location.pathname === "/register"
                                        ? "active"
                                        : ""
                                }
                            >
                                <FaUserPlus className="icon" />
                                <span>Register</span>
                            </Link>
                        </li>
                    </>
                ) : (
                    <>
                        {/* Show user info and logout button when logged in */}
                        <li className="user-info">
                            <span className="user-name">
                                <FaUser className="icon" />
                                {user?.name || user?.email}
                            </span>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="logout-btn"
                            >
                                <FaSignOutAlt className="icon" />
                                <span>Logout</span>
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}
