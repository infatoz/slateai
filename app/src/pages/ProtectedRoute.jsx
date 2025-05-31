// src/pages/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../auth/auth";

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
