import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./utils/auth";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Proposal from "./pages/Proposal";
import User from "./pages/User";
import Faculty from "./pages/Faculty";
import FacultyHeadDashboard from "./pages/FacultyHeadDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import DekanDashboard from "./pages/DekanDashboard";

const ProtectedRoute = ({ children }) => {
  if (isAuthenticated()) return <Navigate to="/login" />;
  return children;
};

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
        <Route path="users" element={<User />} />
        {/* <Route path="faculties" element={<Faculty />} /> */}
        {/* <Route path="proposals" element={<FacultyHeadDashboard />} /> */}
        {/* <Route path="proposals" element={<DekanDashboard />} /> */}
      </Route>
    </Routes>
  );
};

export default App;
