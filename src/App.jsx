import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastProvider } from "./context/ToastContext"
import { XPProvider } from "./context/XPContext"
import Layout from "./components/Layout/Layout"
import Dashboard from "./pages/Dashboard"
import DSAVisualizer from "./pages/DSAVisualizer"
import SQLPlayground from "./pages/SQLPlayground"
import OSSimulator from "./pages/OSSimulator"
import AICodeReviewer from "./pages/AICodeReviewer"
import AnalyticsDashboard from "./pages/AnalyticsDashboard"
import InterviewCoach from "./pages/InterviewCoach"
import PortfolioGenerator from "./pages/PortfolioGenerator"
import Leaderboard from "./pages/Leaderboard";

function Placeholder({ name }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"400px", gap:"12px" }}>
      <div style={{ fontSize:"48px" }}>🚧</div>
      <p style={{ color:"#94a3b8", fontSize:"18px" }}>{name}</p>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <XPProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/"          element={<Dashboard />}          />
              <Route path="/dsa"       element={<DSAVisualizer />}      />
              <Route path="/sql"       element={<SQLPlayground />}      />
              <Route path="/os"        element={<OSSimulator />}        />
              <Route path="/review"    element={<AICodeReviewer />}     />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/interview" element={<InterviewCoach />}     />
              <Route path="/portfolio" element={<PortfolioGenerator />} />
              <Route path="*"          element={<Placeholder name="404 — Page Not Found" />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </XPProvider>
    </ToastProvider>
  );
}