import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../config";
import "./Tasks.css";

export default function Tasks() {
  const { token, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [trashedTasks, setTrashedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkBar, setShowBulkBar] = useState(false);
  const [activeTab, setActiveTab] = useState("active"); // "active" or "trashed"
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    is_active: true,
    status: "pending",
    due_date: "",
  });

  // Fetch tasks based on active tab
  useEffect(() => {
    if (activeTab === "active") {
      fetchTasks();
    } else {
      fetchTrashedTasks();
    }
  }, [token, activeTab]);

  const fetchTasks = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const tasksData = data.tasks || data.data || data;
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } else if (response.status === 401) {
        logout();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Network error: Unable to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashedTasks = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/tasks/trashed`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const tasksData = data.tasks || data.data || data;
        setTrashedTasks(Array.isArray(tasksData) ? tasksData : []);
      } else if (response.status === 401) {
        logout();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch trashed tasks");
      }
    } catch (err) {
      console.error("Error fetching trashed tasks:", err);
      setError("Network error: Unable to fetch trashed tasks");
    } finally {
      setLoading(false);
    }
  };

  // Restore a single task
  const handleRestore = async (taskId) => {
    try {
      const response = await fetch(`${BASE_URL}/tasks/${taskId}/restore`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Remove from trashed list
        setTrashedTasks(trashedTasks.filter((task) => task.id !== taskId));
        // Refresh active tasks
        await fetchTasks();
        alert(data.message || "Task restored successfully!");
      } else {
        const errorData = await response.json();
        console.error("Failed to restore task:", errorData.message);
        alert(errorData.message || "Failed to restore task");
      }
    } catch (err) {
      console.error("Error restoring task:", err);
      alert("Network error: Unable to restore task");
    }
  };

  // Permanently delete a task (force delete)
  const handleForceDelete = async (taskId) => {
    if (
      !window.confirm(
        "Permanently delete this task? This action cannot be undone.",
      )
    )
      return;

    try {
      const response = await fetch(`${BASE_URL}/tasks/${taskId}/force`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTrashedTasks(trashedTasks.filter((task) => task.id !== taskId));
        alert("Task permanently deleted!");
      } else {
        const errorData = await response.json();
        console.error("Failed to delete task permanently:", errorData.message);
        alert(errorData.message || "Failed to delete task permanently");
      }
    } catch (err) {
      console.error("Error force deleting task:", err);
      alert("Network error: Unable to delete task permanently");
    }
  };

  // Bulk restore tasks
  const handleBulkRestore = async () => {
    if (selectedTasks.length === 0) {
      alert("Please select at least one task");
      return;
    }

    if (!window.confirm(`Restore ${selectedTasks.length} task(s)?`)) return;

    try {
      const promises = selectedTasks.map((taskId) =>
        fetch(`${BASE_URL}/tasks/${taskId}/restore`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const responses = await Promise.all(promises);
      const allOk = responses.every((res) => res.ok);

      if (allOk) {
        setTrashedTasks(
          trashedTasks.filter((task) => !selectedTasks.includes(task.id)),
        );
        await fetchTasks();
        setSelectedTasks([]);
        setShowBulkBar(false);
        alert("Selected tasks restored successfully!");
      } else {
        alert("Some tasks failed to restore");
      }
    } catch (err) {
      console.error("Error restoring tasks:", err);
      alert("Network error: Unable to restore tasks");
    }
  };

  // Bulk force delete tasks
  const handleBulkForceDelete = async () => {
    if (selectedTasks.length === 0) {
      alert("Please select at least one task");
      return;
    }

    if (
      !window.confirm(
        `Permanently delete ${selectedTasks.length} task(s)? This action cannot be undone.`,
      )
    )
      return;

    try {
      const promises = selectedTasks.map((taskId) =>
        fetch(`${BASE_URL}/tasks/${taskId}/force`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const responses = await Promise.all(promises);
      const allOk = responses.every((res) => res.ok);

      if (allOk) {
        setTrashedTasks(
          trashedTasks.filter((task) => !selectedTasks.includes(task.id)),
        );
        setSelectedTasks([]);
        setShowBulkBar(false);
        alert("Selected tasks permanently deleted!");
      } else {
        alert("Some tasks failed to delete");
      }
    } catch (err) {
      console.error("Error force deleting tasks:", err);
      alert("Network error: Unable to delete tasks");
    }
  };

  // Handle task selection for bulk actions
  const handleTaskSelection = (taskId) => {
    setSelectedTasks((prev) => {
      if (prev.includes(taskId)) {
        const newSelection = prev.filter((id) => id !== taskId);
        setShowBulkBar(newSelection.length > 0);
        return newSelection;
      } else {
        const newSelection = [...prev, taskId];
        setShowBulkBar(true);
        return newSelection;
      }
    });
  };

  // Select all tasks in current view
  const handleSelectAll = () => {
    const currentTasks = activeTab === "active" ? tasks : trashedTasks;
    if (selectedTasks.length === currentTasks.length) {
      setSelectedTasks([]);
      setShowBulkBar(false);
    } else {
      const allTaskIds = currentTasks.map((task) => task.id);
      setSelectedTasks(allTaskIds);
      setShowBulkBar(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingTask
      ? `${BASE_URL}/tasks/${editingTask.id}`
      : `${BASE_URL}/tasks`;

    const method = editingTask ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingTask) {
          setTasks(
            tasks.map((task) =>
              task.id === editingTask.id
                ? data.task || data.data || data
                : task,
            ),
          );
        } else {
          const newTask = data.task || data.data || data;
          setTasks([newTask, ...tasks]);
        }
        resetForm();
        await fetchTasks(); // Refresh the list
      } else {
        const errorData = await response.json();
        console.error("Failed to save task:", errorData.message);
        alert(errorData.message || "Failed to save task");
      }
    } catch (err) {
      console.error("Error saving task:", err);
      alert("Network error: Unable to save task");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      is_active: task.is_active,
      status: task.status,
      due_date: task.due_date || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Move this task to trash?")) return;

    try {
      const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTasks(tasks.filter((task) => task.id !== taskId));
        alert("Task moved to trash");
      } else {
        const errorData = await response.json();
        console.error("Failed to delete task:", errorData.message);
        alert(errorData.message || "Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Network error: Unable to delete task");
    }
  };

  const handleBulkComplete = async () => {
    if (selectedTasks.length === 0) {
      alert("Please select at least one task");
      return;
    }

    if (!window.confirm(`Mark ${selectedTasks.length} task(s) as completed?`))
      return;

    try {
      const response = await fetch(`${BASE_URL}/tasks/bulk-complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ task_ids: selectedTasks }),
      });

      if (response.ok) {
        setTasks(
          tasks.map((task) =>
            selectedTasks.includes(task.id)
              ? { ...task, status: "completed" }
              : task,
          ),
        );
        setSelectedTasks([]);
        setShowBulkBar(false);
        alert("Selected tasks marked as completed!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to complete tasks");
      }
    } catch (err) {
      console.error("Error completing tasks:", err);
      alert("Network error: Unable to complete tasks");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) {
      alert("Please select at least one task");
      return;
    }

    if (!window.confirm(`Move ${selectedTasks.length} task(s) to trash?`))
      return;

    try {
      const response = await fetch(`${BASE_URL}/tasks/bulk-delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ task_ids: selectedTasks }),
      });

      if (response.ok) {
        setTasks(tasks.filter((task) => !selectedTasks.includes(task.id)));
        setSelectedTasks([]);
        setShowBulkBar(false);
        alert("Selected tasks moved to trash!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete tasks");
      }
    } catch (err) {
      console.error("Error deleting tasks:", err);
      alert("Network error: Unable to delete tasks");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      is_active: true,
      status: "pending",
      due_date: "",
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "in_progress":
        return "status-in-progress";
      case "completed":
        return "status-completed";
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "in_progress":
        return "🔄";
      case "completed":
        return "✅";
      default:
        return "";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "";
    }
  };

  const currentTasks = activeTab === "active" ? tasks : trashedTasks;

  if (loading) {
    return (
      <div className="tasks-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-container">
        <div className="error-container">
          <p className="error-message">❌ {error}</p>
          <button
            onClick={activeTab === "active" ? fetchTasks : fetchTrashedTasks}
            className="btn-retry"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1>📋 Task Manager</h1>
        {activeTab === "active" && (
          <button className="btn-add" onClick={() => setShowForm(true)}>
            + Add New Task
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tasks-tabs">
        <button
          className={`tab ${activeTab === "active" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("active");
            setSelectedTasks([]);
            setShowBulkBar(false);
          }}
        >
          📌 Active Tasks
          <span className="tab-count">{tasks.length}</span>
        </button>
        <button
          className={`tab ${activeTab === "trashed" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("trashed");
            setSelectedTasks([]);
            setShowBulkBar(false);
          }}
        >
          🗑️ Trash
          <span className="tab-count">{trashedTasks.length}</span>
        </button>
      </div>

      {/* Bulk Action Bar */}
      {showBulkBar && (
        <div className="bulk-action-bar">
          <div className="bulk-info">
            <input
              type="checkbox"
              checked={
                selectedTasks.length === currentTasks.length &&
                currentTasks.length > 0
              }
              onChange={handleSelectAll}
              id="selectAll"
            />
            <label htmlFor="selectAll">
              {selectedTasks.length} task(s) selected
            </label>
          </div>
          <div className="bulk-actions">
            {activeTab === "active" ? (
              <>
                <button
                  onClick={handleBulkComplete}
                  className="bulk-complete-btn"
                >
                  ✅ Mark Complete
                </button>
                <button onClick={handleBulkDelete} className="bulk-delete-btn">
                  🗑️ Move to Trash
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBulkRestore}
                  className="bulk-restore-btn"
                >
                  ↩️ Restore
                </button>
                <button
                  onClick={handleBulkForceDelete}
                  className="bulk-force-delete-btn"
                >
                  ⚠️ Permanently Delete
                </button>
              </>
            )}
            <button
              onClick={() => {
                setSelectedTasks([]);
                setShowBulkBar(false);
              }}
              className="bulk-cancel-btn"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTask ? "Edit Task" : "Create New Task"}</h2>
              <button className="btn-close" onClick={resetForm}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter task title"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="in_progress">🔄 In Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    Active Task
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="tasks-stats">
        <div className="stat-card">
          <span className="stat-number">{currentTasks.length}</span>
          <span className="stat-label">
            {activeTab === "active" ? "Total Tasks" : "Trashed Tasks"}
          </span>
        </div>
        {activeTab === "active" && (
          <>
            <div className="stat-card">
              <span className="stat-number">
                {tasks.filter((t) => t.status === "pending").length}
              </span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {tasks.filter((t) => t.status === "in_progress").length}
              </span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {tasks.filter((t) => t.status === "completed").length}
              </span>
              <span className="stat-label">Completed</span>
            </div>
          </>
        )}
      </div>

      <div className="tasks-list">
        {currentTasks.length === 0 ? (
          <div className="no-tasks">
            <p>
              {activeTab === "active"
                ? "No tasks found. Create your first task!"
                : "Trash is empty. Deleted tasks will appear here."}
            </p>
          </div>
        ) : (
          currentTasks.map((task) => (
            <div
              key={task.id}
              className={`task-card ${!task.is_active ? "inactive" : ""} ${
                selectedTasks.includes(task.id) ? "selected" : ""
              } ${activeTab === "trashed" ? "trashed" : ""}`}
            >
              <div className="task-header">
                <div className="task-select">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => handleTaskSelection(task.id)}
                    className="task-checkbox"
                  />
                </div>
                <div className="task-title-section">
                  <h3>{task.title}</h3>
                  <div className="task-badges">
                    {activeTab === "active" && (
                      <>
                        <span
                          className={`priority-badge ${getPriorityColor(task.priority)}`}
                        >
                          {getPriorityIcon(task.priority)} {task.priority}
                        </span>
                        <span
                          className={`status-badge ${getStatusColor(task.status)}`}
                        >
                          {getStatusIcon(task.status)}{" "}
                          {task.status.replace("_", " ")}
                        </span>
                      </>
                    )}
                    {task.deleted_at && (
                      <span className="trashed-badge">
                        🗑️ Deleted:{" "}
                        {new Date(task.deleted_at).toLocaleDateString()}
                      </span>
                    )}
                    {!task.is_active && activeTab === "active" && (
                      <span className="inactive-badge">⚠️ Inactive</span>
                    )}
                  </div>
                </div>
                <div className="task-actions">
                  {activeTab === "active" ? (
                    <>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(task)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(task.id)}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-restore"
                        onClick={() => handleRestore(task.id)}
                      >
                        ↩️ Restore
                      </button>
                      <button
                        className="btn-force-delete"
                        onClick={() => handleForceDelete(task.id)}
                      >
                        ⚠️ Permanent Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="task-body">
                <p className="task-description">
                  {task.description || "No description provided"}
                </p>
                <div className="task-details">
                  <div className="detail-item">
                    <span className="detail-label">📅 Due Date:</span>
                    <span className="detail-value">
                      {task.due_date || "Not set"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">🆔 Task ID:</span>
                    <span className="detail-value">{task.id}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
