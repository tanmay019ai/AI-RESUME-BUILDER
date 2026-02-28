import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/60 blur-3xl dark:bg-indigo-950/60" />
        <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl dark:bg-cyan-950/40" />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid gap-10 md:grid-cols-2 md:items-center"
        >
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Build an{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                ATS-friendly
              </span>{' '}
              resume in minutes
            </h1>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Fill a simple form, generate a structured resume with Gemini, preview a clean template, and download a PDF.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-indigo-500"
              >
                Get started
              </Link>
              <a
                href="#pricing"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                View pricing
              </a>
            </div>
          </div>

          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40"
          >
            <div className="text-sm font-medium">What you get</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>• ATS-friendly single-column format</li>
              <li>• Modern, clean typography</li>
              <li>• Downloadable PDF</li>
              <li>• Pro plan for unlimited generations</li>
            </ul>
            <div className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600/10 to-cyan-500/10 p-4 text-xs text-slate-700 dark:from-indigo-600/10 dark:to-cyan-500/10 dark:text-slate-300">
              Free plan includes 1 generation + watermark. Upgrade anytime.
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-semibold">Features</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: 'Guided form', desc: 'Collect the right inputs: skills, projects, experience, education, target role.' },
            { title: 'AI generation', desc: 'Gemini returns structured JSON for reliable rendering and PDF export.' },
            { title: 'PDF export', desc: 'Server generates a PDF from HTML template with optional watermark.' },
          ].map((f) => (
            <motion.div
              key={f.title}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="rounded-xl border border-slate-200 bg-white/60 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="font-medium">{f.title}</div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-semibold">Pricing</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35 }}
            className="rounded-xl border border-slate-200 bg-white/60 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40"
          >
            <div className="text-sm font-medium">Free</div>
            <div className="mt-2 text-3xl font-semibold">₹0</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>• 1 resume generation</li>
              <li>• Watermark on PDF</li>
              <li>• Standard template</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-600/10 to-cyan-500/10 p-6 dark:border-slate-800"
          >
            <div className="text-sm font-medium">Pro</div>
            <div className="mt-2 text-3xl font-semibold">Unlimited</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>• Unlimited generations</li>
              <li>• No PDF watermark</li>
              <li>• Premium template header</li>
            </ul>
            <div className="mt-5">
              <Link
                to="/signup"
                className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-indigo-500"
              >
                Start Pro
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
