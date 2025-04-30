import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Proposal from "./pages/Proposal";
import User from "./pages/User";
import Faculty from "./pages/Faculty";
import FacultyHeadDashboard from "./pages/FacultyHeadDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import DekanDashboard from "./pages/DekanDashboard";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="proposals" element={<Proposal />} />
        <Route
          path="users"
          element={
            <AdminRoute>
              <User />
            </AdminRoute>
          }
        />
        <Route
          path="faculties"
          element={
            <AdminRoute>
              <Faculty />
            </AdminRoute>
          }
        />
        <Route path="facultyHead" element={<FacultyHeadDashboard />} />
        <Route path="reviewer" element={<ReviewerDashboard />} />
        <Route path="dekan" element={<DekanDashboard />} />
      </Route>
      {/* Redirect unknown routes to login or dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />{" "}
    </Routes>
  );
};

export default App;
