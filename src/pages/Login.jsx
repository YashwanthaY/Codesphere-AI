// WHAT THIS FILE DOES:
// Beautiful login page shown to unauthenticated users
// Single "Sign in with Google" button
// Shows app features to convince user to sign up

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Zap, GitBranch, Database, Cpu,
  Code2, BarChart3, MessageSquare, Sparkles,
} from "lucide-react";

const FEATURES = [
  { icon: GitBranch,    color: "text-emerald-400", bg: "bg-emerald-500/10", label: "DSA Visualizer",  desc: "Animate 9+ algorithms"     },
  { icon: Database,     color: "text-cyan-400",    bg: "bg-cyan-500/10",    label: "SQL Playground",  desc: "Live SQL in browser"        },
  { icon: Cpu,          color: "text-amber-400",   bg: "bg-amber-500/10",   label: "OS Simulator",    desc: "CPU scheduling & paging"    },
  { icon: Code2,        color: "text-green-400",   bg: "bg-green-500/10",   label: "AI Code Review",  desc: "Gemini AI reviews your code"},
  { icon: BarChart3,    color: "text-pink-400",    bg: "bg-pink-500/10",    label: "GitHub Analytics",desc: "Power BI style dashboard"   },
  { icon: MessageSquare,color: "text-violet-400",  bg: "bg-violet-500/10",  label: "Interview Coach", desc: "AI mock interviews"         },
];

export default function Login() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    await signIn();
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">

        {/* ── MAIN CARD ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* LEFT — Branding */}
            <div className="p-10 flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-800">

              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CodeSphere AI</h1>
                  <p className="text-xs text-blue-400 tracking-widest uppercase">
                    Developer Platform
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
                Your AI-Powered
                <span className="text-blue-400"> Developer</span>
                <br />Productivity Platform
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Master DSA, practice SQL, simulate OS concepts, get AI code reviews,
                track GitHub stats, and ace interviews — all in one place.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "8",    label: "Modules"    },
                  { value: "AI",   label: "Powered"    },
                  { value: "Free", label: "Forever"    },
                ].map(function(stat) {
                  return (
                    <div key={stat.label}
                         className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
                      <p className="text-xl font-bold text-blue-400">{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT — Login form */}
            <div className="p-10 flex flex-col justify-center">

              <h3 className="text-xl font-semibold text-white mb-2">
                Get started for free
              </h3>
              <p className="text-sm text-slate-400 mb-8">
                Sign in with your Google account — no password needed
              </p>

              {/* Features grid */}
              <div className="grid grid-cols-2 gap-2 mb-8">
                {FEATURES.map(function(f) {
                  const Icon = f.icon;
                  return (
                    <div key={f.label}
                         className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 border border-slate-700">
                      <div className={"w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 " + f.bg}>
                        <Icon size={13} className={f.color} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">{f.label}</p>
                        <p className="text-[10px] text-slate-500 truncate">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3
                           py-3.5 bg-white hover:bg-gray-50
                           disabled:opacity-70 disabled:cursor-not-allowed
                           rounded-xl text-sm font-semibold text-gray-700
                           transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {loading ? "Signing in..." : "Continue with Google"}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                By signing in you agree to use this platform for learning.
                <br />No spam. No credit card required.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-slate-600 mt-4">
          Built with React.js · Python Flask · Google Gemini AI
        </p>
      </div>
    </div>
  );
}