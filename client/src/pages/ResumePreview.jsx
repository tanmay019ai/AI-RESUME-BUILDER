import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';

function Section({ title, children }) {
  return (
    <section className="mt-6">
      <h2 className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export default function ResumePreview() {
  const { id } = useParams();
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  async function extractErrorMessage(err) {
    const msg = err?.response?.data?.message || err?.message;
    if (msg) return msg;

    // When axios is called with responseType: 'blob', error payload may still be a Blob.
    const data = err?.response?.data;
    if (data && typeof Blob !== 'undefined' && data instanceof Blob) {
      try {
        const text = await data.text();
        try {
          const json = JSON.parse(text);
          return json?.message || text;
        } catch {
          return text;
        }
      } catch {
        // ignore
      }
    }

    return 'Download failed';
  }

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/resumes/${id}`);
        if (alive) setResume(data.resume);
      } catch (err) {
        if (alive) setError(err?.response?.data?.message || 'Failed to load resume');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [id]);

  const profile = resume?.content?.profile;
  const content = resume?.content?.ai;

  const skillLine = useMemo(() => {
    const skills = content?.skills || [];
    return skills.join(' • ');
  }, [content]);

  async function downloadPdf() {
    setDownloading(true);
    setDownloadError('');
    try {
      const res = await api.get(`/resumes/${id}/pdf`, { responseType: 'blob' });

      const contentType = String(res?.headers?.['content-type'] || '');
      if (contentType && !contentType.includes('application/pdf')) {
        try {
          const text = await res.data.text();
          try {
            const json = JSON.parse(text);
            throw new Error(json?.message || text);
          } catch {
            throw new Error(text);
          }
        } catch (e) {
          throw new Error(e?.message || 'Download failed');
        }
      }

      // Axios returns a Blob already when responseType is 'blob'.
      const blob = res?.data instanceof Blob ? res.data : new Blob([res.data], { type: 'application/pdf' });

      // Defensive check: verify file signature so we don't save JSON/HTML as a PDF.
      try {
        const head = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
        const magic = new TextDecoder().decode(head);
        if (magic !== '%PDF-') {
          const text = await blob.text();
          try {
            const json = JSON.parse(text);
            throw new Error(json?.message || text);
          } catch {
            throw new Error(text || 'Server did not return a valid PDF');
          }
        }
      } catch (e) {
        throw new Error(e?.message || 'Server did not return a valid PDF');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Some browsers can cancel the download if we revoke immediately.
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1500);
    } catch (err) {
      const message = await extractErrorMessage(err);
      setDownloadError(message);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-500">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!resume) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Resume Preview</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {user?.isPro ? 'Premium template (no watermark)' : 'Standard template (PDF has watermark)'}
          </p>
        </div>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={downloading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {downloading ? 'Preparing…' : 'Download PDF'}
        </button>
      </div>

      {downloadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {downloadError}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight">{profile?.fullName}</div>
            {user?.isPro ? (
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{content?.headline}</div>
            ) : null}
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <div>{profile?.email}</div>
            <div>{profile?.phone}</div>
          </div>
        </div>

        <Section title="SUMMARY">
          <p className="text-sm leading-6 text-slate-800 dark:text-slate-200">{content?.summary}</p>
        </Section>

        <Section title="SKILLS">
          <p className="text-sm text-slate-800 dark:text-slate-200">{skillLine}</p>
        </Section>

        <Section title="EXPERIENCE">
          <div className="space-y-4">
            {(content?.experience || []).map((e, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-sm font-medium">
                    {e.title} — {e.company}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {e.startDate} - {e.endDate}
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{e.location}</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800 dark:text-slate-200">
                  {(e.bullets || []).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="PROJECTS">
          <div className="space-y-4">
            {(content?.projects || []).map((p, idx) => (
              <div key={idx}>
                <div className="text-sm font-medium">
                  {p.name}{' '}
                  {p.tech?.length ? (
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({p.tech.join(', ')})</span>
                  ) : null}
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800 dark:text-slate-200">
                  {(p.bullets || []).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="EDUCATION">
          <div className="space-y-4">
            {(content?.education || []).map((ed, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-sm font-medium">
                    {ed.school} — {ed.degree}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {ed.startDate} - {ed.endDate}
                  </div>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800 dark:text-slate-200">
                  {(ed.details || []).map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </motion.div>
  );
}
