import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Proposal from "./pages/Proposal";
import FacultyHead from "./pages/FacultyHeadDashboard";
import User from "./pages/User";
import Faculty from "./pages/Faculty";
import FacultyHeadDashboard from "./pages/FacultyHeadDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import Review from "./pages/Review";

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
        <Route path="my-proposals" element={<Dashboard />} />
        <Route path="proposals" element={<Proposal />} />
        <Route path="reviews" element={<Review />} />
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
        <Route path="progress-reports" element={<FacultyHeadDashboard />} />
        <Route path="final-reports" element={<ReviewerDashboard />} />
        <Route path="research" element={<Review />} />
      </Route>
      {/* Redirect unknown routes to login or dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />{" "}
    </Routes>
  );
};

export default App;
