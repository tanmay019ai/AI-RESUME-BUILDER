import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen grid place-items-center px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-950/60" />
        <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl dark:bg-cyan-950/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40"
      >
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Welcome back.</p>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <label className="text-sm">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800"
              required
            />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800"
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          No account?{' '}
          <Link to="/signup" className="text-slate-900 underline dark:text-slate-100">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
