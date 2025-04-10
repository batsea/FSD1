// Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data, status } = await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (status === 201 || status === 200) {
        alert("Registered! Now login.");
        navigate("/");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Register error:", error);
      alert(
        error.response?.data?.error ||
          "An error occurred during registration. Please try again."
      );
    }
  };

  return (
    <form onSubmit={handleRegister} className="register-form">
      <h2>Register</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <br />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <br />
      <button type="submit">Register</button>
    </form>
  );
}
