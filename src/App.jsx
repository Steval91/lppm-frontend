import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import NonAdminRoute from "./routes/NonAdminRoute";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Proposal from "./pages/Proposal";
import Review from "./pages/Review";
import Approval from "./pages/Approval";
import FacultyHead from "./pages/FacultyHeadDashboard";
import User from "./pages/User";
import Faculty from "./pages/Faculty";
import FacultyHeadDashboard from "./pages/FacultyHeadDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import ProgressReport from "./pages/ProgressReport";

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
        <Route
          path="my-proposals"
          element={
            <NonAdminRoute>
              <Dashboard />
            </NonAdminRoute>
          }
        />
        <Route
          path="proposals"
          element={
            <NonAdminRoute>
              <Proposal />
            </NonAdminRoute>
          }
        />
        <Route
          path="reviews"
          element={
            <NonAdminRoute>
              <Review />
            </NonAdminRoute>
          }
        />
        <Route
          path="approvals"
          element={
            <NonAdminRoute>
              <Approval />
            </NonAdminRoute>
          }
        />
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
        <Route path="progress-reports" element={<ProgressReport />} />
        <Route path="final-reports" element={<ReviewerDashboard />} />
        <Route path="research" element={<Review />} />
      </Route>
      {/* Redirect unknown routes to login or dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />{" "}
    </Routes>
  );
};

export default App;
