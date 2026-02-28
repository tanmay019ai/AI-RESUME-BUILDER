import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { motion } from 'framer-motion';

function emptyProject() {
  return { title: '', description: '' };
}

export default function ResumeForm() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');

  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([emptyProject()]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasAnySkill = useMemo(() => {
    return skills.length > 0 || Boolean(skillInput.trim());
  }, [skills, skillInput]);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim() &&
      email.trim() &&
      phone.trim() &&
      targetRole.trim() &&
      experience.trim() &&
      education.trim() &&
      hasAnySkill
    );
  }, [fullName, email, phone, targetRole, experience, education, hasAnySkill]);

  const missing = useMemo(() => {
    const items = [];
    if (!fullName.trim()) items.push('full name');
    if (!targetRole.trim()) items.push('target role');
    if (!email.trim()) items.push('email');
    if (!phone.trim()) items.push('phone');
    if (!experience.trim()) items.push('experience');
    if (!education.trim()) items.push('education');
    if (!hasAnySkill) items.push('at least 1 skill (press Enter or click Add)');
    return items;
  }, [fullName, targetRole, email, phone, experience, education, hasAnySkill]);

  function addSkill() {
    const s = skillInput.trim();
    if (!s) return;
    if (skills.includes(s)) {
      setSkillInput('');
      return;
    }
    setSkills((prev) => [...prev, s]);
    setSkillInput('');
  }

  function removeSkill(skill) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  function setProjectField(index, field, value) {
    setProjects((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function addProject() {
    setProjects((prev) => [...prev, emptyProject()]);
  }

  function removeProject(index) {
    setProjects((prev) => prev.filter((_, i) => i !== index));
  }

  async function onGenerate(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const typedSkill = skillInput.trim();
      const skillsToSend = skills.length > 0 ? skills : typedSkill ? [typedSkill] : [];
      if (skillsToSend.length === 0) {
        setError('Add at least 1 skill (press Enter or click Add).');
        return;
      }

      const payload = {
        fullName,
        email,
        phone,
        targetRole,
        experience,
        education,
        skills: skillsToSend,
        projects: projects
          .map((p) => ({ title: p.title.trim(), description: p.description.trim() }))
          .filter((p) => p.title && p.description),
      };

      const { data } = await api.post('/resumes/generate', payload);
      navigate(`/app/resume/${data.resume.id}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate resume');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div>
        <h1 className="text-xl font-semibold">Resume Form</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Fill your details and generate a structured ATS-friendly resume.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <form onSubmit={onGenerate} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800"
              required
            />
          </div>
          <div>
            <label className="text-sm">Target job role</label>
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800"
              required
            />
          </div>
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
            <label className="text-sm">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800"
              required
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <div className="font-medium">Skills</div>
          <div className="mt-3 flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="e.g. React"
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800"
            />
            <button
              type="button"
              onClick={addSkill}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              Add
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => removeSkill(s)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                title="Remove"
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">Click a skill chip to remove.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="font-medium">Projects</div>
            <button
              type="button"
              onClick={addProject}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              Add project
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {projects.map((p, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Project {idx + 1}</div>
                  {projects.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="text-xs text-slate-600 underline hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="mt-3 grid gap-3">
                  <div>
                    <label className="text-sm">Title</label>
                    <input
                      value={p.title}
                      onChange={(e) => setProjectField(idx, 'title', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Description</label>
                    <textarea
                      value={p.description}
                      onChange={(e) => setProjectField(idx, 'description', e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <div className="font-medium">Experience</div>
          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            rows={6}
            placeholder="Describe your experience. Include role, company, duration, and achievements."
            className="mt-3 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800"
            required
          />
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <div className="font-medium">Education</div>
          <textarea
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            rows={4}
            placeholder="Your education details."
            className="mt-3 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800"
            required
          />
        </div>

        <button
          disabled={loading || !canSubmit}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Generating…' : 'Generate Resume'}
        </button>

        {!canSubmit && !loading ? (
          <div className="text-xs text-slate-500">
            To enable: fill {missing.join(', ')}.
          </div>
        ) : null}
      </form>
    </motion.div>
  );
}
