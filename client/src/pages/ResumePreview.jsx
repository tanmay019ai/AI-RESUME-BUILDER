import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import { TemplatePicker, TemplateRenderer } from '../templates/index.js';

export default function ResumePreview() {
  const { id } = useParams();
  const { user } = useAuth();
  const isPro = Boolean(user?.isPro);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [templateSaving, setTemplateSaving] = useState(false);

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
  const templateId = resume?.templateId || 'modern-clean';

  async function changeTemplate(nextTemplateId) {
    if (templateSaving) return;
    const def = TEMPLATE_DEFS.find((t) => t.id === nextTemplateId);
    const locked = !isPro && def && !def.free;
    if (locked) {
      setError('Upgrade to Pro to unlock this template.');
      return;
    }

    setTemplateSaving(true);
    setError('');
    try {
      const { data } = await api.patch(`/resumes/${id}/template`, { templateId: nextTemplateId });
      setResume(data.resume);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change template');
    } finally {
      setTemplateSaving(false);
    }
  }

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

  if (loading)
    return (
      <div className="space-y-4">
        <div className="h-7 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="rounded-2xl border border-slate-200 bg-white/40 p-6 dark:border-slate-800 dark:bg-slate-950/20">
          <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
          <div className="mt-6 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
            <div className="h-3 w-4/6 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
          </div>
        </div>
      </div>
    );
  if (!resume) return <div className="text-sm text-red-600">{error || 'Resume not found'}</div>;

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
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={downloadPdf}
            disabled={downloading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:opacity-60"
          >
            {downloading ? 'Preparing…' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/40 p-4 dark:border-slate-800 dark:bg-slate-950/20">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-medium">Choose a template</div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">All 10 templates show a thumbnail preview.</p>
          </div>
          {templateSaving ? <div className="text-xs text-slate-500">Saving…</div> : null}
        </div>

        <div className="mt-4">
          <TemplatePicker
            value={templateId}
            isPro={isPro}
            onChange={(id) => changeTemplate(id)}
            onLockedPick={() => setError('Upgrade to Pro to unlock this template.')}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {downloadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {downloadError}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={templateId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-white">
            <div className="overflow-x-auto">
              <div className="mx-auto w-full md:w-[210mm]">
                <div className="min-h-[297mm] bg-white text-slate-900">
                  <TemplateRenderer templateId={templateId} profile={profile} content={content} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
