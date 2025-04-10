// Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", dueDate: "" });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Create an axios instance with auth header
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // If token is invalid/expired, logout and redirect
        localStorage.removeItem("token");
        navigate("/");
        return;
      }
      console.error("Fetch tasks error:", error);
      alert("Failed to load tasks. Please try again.");
    }
  };

  // Add new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", { title, description, dueDate });
      setTitle("");
      setDescription("");
      setDueDate("");
      fetchTasks();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }
      console.error("Add task error:", error);
      alert(error.response?.data?.error || "Failed to add task. Please try again.");
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }
      console.error("Delete error:", error);
      alert("Failed to delete task");
    }
  };

  // Start editing
  const startEdit = (task) => {
    setEditingId(task._id);
    setEditForm({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", description: "", dueDate: "" });
  };

  // Submit edit
  const submitEdit = async (id) => {
    try {
      await api.put(`/tasks/${id}`, editForm);
      cancelEdit();
      fetchTasks();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }
      console.error("Update error:", error);
      alert(error.response?.data?.error || "Failed to update task");
    }
  };

  // Change status
  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      fetchTasks();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }
      console.error("Status change error:", error);
      alert("Failed to update status");
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Your Tasks</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="add-task-form">
        <input
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Tasks List */}
      <div className="tasks-list">
        {tasks.length === 0 ? (
          <p>No tasks found</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="task-item">
              {editingId === task._id ? (
                <div className="edit-mode">
                  <input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                  />
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dueDate: e.target.value })
                    }
                  />
                  <button onClick={() => submitEdit(task._id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              ) : (
                <div className="view-mode">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <div>
                    <strong>Due:</strong> {task.dueDate?.slice(0, 10) || "N/A"}
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task._id, e.target.value)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button onClick={() => startEdit(task)}>Edit</button>
                  <button onClick={() => handleDelete(task._id)}>Delete</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
