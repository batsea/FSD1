import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ 
    title: "", 
    description: "", 
    dueDate: "" 
  });
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/");
      }
      return Promise.reject(error);
    }
  );

  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/tasks", {
        params: { search: searchTerm }
      });
      setTasks(data);
    } catch (error) {
      console.error("Fetch tasks error:", error);
    }
  };

  

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", { title, description, dueDate });
      setTitle("");
      setDescription("");
      setDueDate("");
      fetchTasks();
    } catch (error) {
      console.error("Add task error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditForm({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", description: "", dueDate: "" });
  };

  const submitEdit = async (id) => {
    try {
      await api.put(`/tasks/${id}`, editForm);
      cancelEdit();
      fetchTasks();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      fetchTasks();
    } catch (error) {
      console.error("Status change error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      <div>
        <h2>Your Tasks</h2>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleLogout}>Logout</button>
      </div>

      <form onSubmit={handleAddTask}>
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

      <div>
        {tasks.length === 0 ? (
          <p>No tasks found</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id}>
              {editingId === task._id ? (
                <div>
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
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <div>Due: {task.dueDate?.slice(0, 10) || "N/A"}</div>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
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
