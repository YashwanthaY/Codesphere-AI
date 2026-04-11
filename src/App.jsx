import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ToastProvider } from "./context/ToastContext"
import { XPProvider } from "./context/XPContext"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Layout from "./components/Layout/Layout"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import DSAVisualizer from "./pages/DSAVisualizer"
import SQLPlayground from "./pages/SQLPlayground"
import OSSimulator from "./pages/OSSimulator"
import AICodeReviewer from "./pages/AICodeReviewer"
import AnalyticsDashboard from "./pages/AnalyticsDashboard"
import InterviewCoach from "./pages/InterviewCoach"
import PortfolioGenerator from "./pages/PortfolioGenerator"
import Leaderboard from "./pages/Leaderboard"

// ── Protected Route — redirects to login if not authenticated ─────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent
                          rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading CodeSphere AI...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ── Inner app (inside AuthProvider) ──────────────────────────────────────────
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected routes — all inside Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/"            element={<Dashboard />}          />
                <Route path="/dsa"         element={<DSAVisualizer />}      />
                <Route path="/sql"         element={<SQLPlayground />}      />
                <Route path="/os"          element={<OSSimulator />}        />
                <Route path="/review"      element={<AICodeReviewer />}     />
                <Route path="/analytics"   element={<AnalyticsDashboard />} />
                <Route path="/interview"   element={<InterviewCoach />}     />
                <Route path="/portfolio"   element={<PortfolioGenerator />} />
                <Route path="/leaderboard" element={<Leaderboard />}        />
                <Route path="*"            element={<Navigate to="/" />}    />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <XPProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </XPProvider>
      </ToastProvider>
    </AuthProvider>
  );
}