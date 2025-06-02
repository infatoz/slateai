// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./pages/ProtectedRoute";
import "./index.css"; // Include Tailwind here
import Subscribe from "./pages/Subscribe";
import Project from "./pages/Project";
import EditProfile from "./profile/EditProfile";
import Profile from "./profile/Profile";
import { Toaster } from "react-hot-toast";
import ForgotPassword from "./pages/ForgotPassword";
import HomePage from "./pages/HomePage";
import Canvas from "./pages/Canvas";
import { ThemeProvider } from "./context/ThemeContext";
import Dashboard from "./pages/Dashboard";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <React.StrictMode>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/slate/:id"
            element={<ProtectedRoute>{/* <App /> */}</ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscribe"
            element={
              <ProtectedRoute>
                <Subscribe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project"
            element={
              <ProtectedRoute>
                <Project />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  </ThemeProvider>
);
