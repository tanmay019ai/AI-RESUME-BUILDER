import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppShell from './components/AppShell.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ResumeForm from './pages/ResumeForm.jsx';
import ResumePreview from './pages/ResumePreview.jsx';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Landing />
          </>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="resume/new" element={<ResumeForm />} />
        <Route path="resume/:id" element={<ResumePreview />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="min-h-screen grid place-items-center">
            <div className="text-sm text-slate-500">Page not found</div>
          </div>
        }
      />
    </Routes>
  );
}
