import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/" replace />;
  }
  
  // If authenticated, render the child component(s)
  return children;
}