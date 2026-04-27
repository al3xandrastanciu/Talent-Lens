import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Candidate Pages
import JobBoard from './pages/candidate/JobBoard';
import JobDetail from './pages/candidate/JobDetail';
import MyApplications from './pages/candidate/MyApplications';
import Profile from './pages/candidate/Profile';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import ManageJobs from './pages/recruiter/ManageJobs';
import JobApplications from './pages/recruiter/JobApplications';
import EvaluateApplication from './pages/recruiter/EvaluateApplication';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Candidate Routes */}
          <Route path="/jobs" element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <JobBoard />
            </ProtectedRoute>
          } />
          <Route path="/jobs/:id" element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <JobDetail />
            </ProtectedRoute>
          } />
          <Route path="/my-applications" element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <MyApplications />
            </ProtectedRoute>
          } />

          {/* Shared Routes (both roles) */}
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['CANDIDATE', 'RECRUITER']}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Recruiter Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <RecruiterDashboard />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/jobs" element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <ManageJobs />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/jobs/:jobId/applications" element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <JobApplications />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/evaluate/:applicationId" element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <EvaluateApplication />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;