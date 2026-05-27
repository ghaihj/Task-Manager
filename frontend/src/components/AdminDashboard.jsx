import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../config";
import "./Admin.css";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { token, user, logout, admin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: "",
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // console.log(user);
  const navigate = useNavigate();

  // Fetch all users for admin
  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data.data || data);
      } else if (response.status === 401) {
        logout();
      } else {
        showNotification("error", "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      showNotification("error", "Network error: Unable to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailForm({
      ...emailForm,
      [name]: value,
    });
  };

  const sendToOneUser = async (e) => {
    e.preventDefault();
    setSendingEmail(true);

    try {
      const response = await fetch(
        `${BASE_URL}/admin/mail/user/${selectedUser.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(emailForm),
        },
      );

      if (response.ok) {
        const data = await response.json();
        showNotification(
          "success",
          data.message || `Email sent to ${selectedUser.email}`,
        );
        closeEmailModal();
      } else {
        const errorData = await response.json();
        showNotification("error", errorData.message || "Failed to send email");
      }
    } catch (err) {
      console.error("Error sending email:", err);
      showNotification("error", "Network error: Unable to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const sendToAllUsers = async (e) => {
    e.preventDefault();
    setSendingEmail(true);

    try {
      const response = await fetch(`${BASE_URL}/admin/mail/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailForm),
      });

      if (response.ok) {
        const data = await response.json();
        showNotification(
          "success",
          data.message || "Broadcast email sent to all users",
        );
        closeBroadcastModal();
      } else {
        const errorData = await response.json();
        showNotification(
          "error",
          errorData.message || "Failed to send broadcast",
        );
      }
    } catch (err) {
      console.error("Error sending broadcast:", err);
      showNotification("error", "Network error: Unable to send broadcast");
    } finally {
      setSendingEmail(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const openEmailModal = (user) => {
    setSelectedUser(user);
    setEmailForm({ subject: "", message: "" });
    setShowEmailModal(true);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setSelectedUser(null);
    setEmailForm({ subject: "", message: "" });
  };

  const openBroadcastModal = () => {
    setEmailForm({ subject: "", message: "" });
    setShowBroadcastModal(true);
  };

  const closeBroadcastModal = () => {
    setShowBroadcastModal(false);
    setEmailForm({ subject: "", message: "" });
  };

  const getRoleBadgeClass = (role) => {
    return role === "admin" ? "badge-admin" : "badge-user";
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span className="notification-icon">
            {notification.type === "success" ? "✅" : "❌"}
          </span>
          <span className="notification-message">{notification.message}</span>
          <button
            className="notification-close"
            onClick={() =>
              setNotification({ show: false, type: "", message: "" })
            }
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div className="admin-title">
          <h1>👑 Admin Dashboard</h1>
          <p>Manage users and send notifications</p>
        </div>
        <button className="btn-broadcast" onClick={openBroadcastModal}>
          📢 Broadcast to All Users
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-number">{users.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <h3>Admins</h3>
            <p className="stat-number">
              {users.filter((u) => u.is_admin === 1).length}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <h3>Regular Users</h3>
            <p className="stat-number">
              {users.filter((u) => u.is_admin === 0).length}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <div className="stat-info">
            <h3>Emails Sent</h3>
            <p className="stat-number">0</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <div className="table-header">
          <h2>📋 Registered Users</h2>
          <div className="table-actions">
            <input
              type="text"
              placeholder="Search users..."
              className="search-input"
              id="userSearch"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll(".user-row");
                rows.forEach((row) => {
                  const name = row
                    .querySelector(".user-name")
                    ?.textContent.toLowerCase();
                  const email = row
                    .querySelector(".user-email")
                    ?.textContent.toLowerCase();
                  if (
                    name?.includes(searchTerm) ||
                    email?.includes(searchTerm)
                  ) {
                    row.style.display = "";
                  } else {
                    row.style.display = "none";
                  }
                });
              }}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="user-row">
                    <td className="user-id">{user.id}</td>
                    <td className="user-name">
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="user-email">{user.email}</td>
                    <td>
                      <span
                        className={`role-badge ${getRoleBadgeClass(user.role)}`}
                      >
                        {user.role === "admin" ? "👑 Admin" : "👤 User"}
                      </span>
                    </td>
                    <td className="user-date">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="user-actions">
                      <button
                        className="btn-send-email"
                        onClick={() => openEmailModal(user)}
                        title="Send email to this user"
                      >
                        📧 Send Email
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Email Modal (Single User) */}
      {showEmailModal && (
        <div className="modal-overlay" onClick={closeEmailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📧 Send Email to {selectedUser?.name}</h2>
              <button className="btn-close" onClick={closeEmailModal}>
                ✕
              </button>
            </div>
            <form onSubmit={sendToOneUser}>
              <div className="form-group">
                <label>Recipient</label>
                <input
                  type="email"
                  value={selectedUser?.email || ""}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={emailForm.subject}
                  onChange={handleEmailInputChange}
                  required
                  placeholder="Enter email subject"
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={emailForm.message}
                  onChange={handleEmailInputChange}
                  required
                  rows="8"
                  placeholder="Write your message here..."
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeEmailModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={sendingEmail}
                >
                  {sendingEmail ? "Sending..." : "Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal (All Users) */}
      {showBroadcastModal && (
        <div className="modal-overlay" onClick={closeBroadcastModal}>
          <div
            className="modal-content broadcast-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>📢 Broadcast to All Users</h2>
              <button className="btn-close" onClick={closeBroadcastModal}>
                ✕
              </button>
            </div>
            <div className="broadcast-warning">
              ⚠️ This will send an email to all {users.length} registered users.
            </div>
            <form onSubmit={sendToAllUsers}>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={emailForm.subject}
                  onChange={handleEmailInputChange}
                  required
                  placeholder="Enter broadcast subject"
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={emailForm.message}
                  onChange={handleEmailInputChange}
                  required
                  rows="8"
                  placeholder="Write your broadcast message here..."
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeBroadcastModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={sendingEmail}
                >
                  {sendingEmail
                    ? "Sending to all users..."
                    : `Send to ${users.length} Users`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
