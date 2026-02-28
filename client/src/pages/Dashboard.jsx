import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function upgradeToPro() {
    setError('');
    setLoading(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error('Failed to load Razorpay');

      const { data } = await api.post('/payments/order');
      const { order, keyId } = data;

      const rz = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'AI Resume Builder',
        description: 'Pro plan',
        order_id: order.id,
        handler: async function (response) {
          const verifyRes = await api.post('/payments/verify', response);
          setUser(verifyRes.data.user);
        },
      });

      rz.open();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Upgrade failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40"
      >
        <div className="text-sm text-slate-600 dark:text-slate-400">Welcome</div>
        <div className="mt-1 text-xl font-semibold">{user?.name}</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Plan: <span className="font-medium text-slate-900 dark:text-slate-100">{user?.isPro ? 'Pro' : 'Free'}</span>
          {' · '}Resume generations used: <span className="font-medium">{user?.resumeCount ?? 0}</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/app/resume/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            Create resume
          </Link>
          {!user?.isPro ? (
            <button
              type="button"
              onClick={upgradeToPro}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              {loading ? 'Opening…' : 'Upgrade to Pro'}
            </button>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}
      </motion.div>

      <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
        Tip: Keep experience bullet points quantified and role-relevant for better ATS results.
      </div>
    </div>
  );
}
