import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { TemplatePicker } from '../templates/index.js';

function emptyProject() {
  return { title: '', description: '', bulletInput: '', bullets: [] };
}

function BulletEditor({ label, value, items, onChange, placeholder = 'Add bullet', hint }) {
  const [input, setInput] = useState('');

  const list = Array.isArray(value) ? value : Array.isArray(items) ? items : [];

  function add() {
    const v = input.trim();
    if (!v) return;
    if (list.includes(v)) {
      setInput('');
      return;
    }
    onChange([...list, v]);
    setInput('');
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          Add
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {list.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => onChange(list.filter((x) => x !== b))}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            title="Remove"
          >
            {b}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">{hint || 'Click a bullet chip to remove.'}</p>
    </div>
  );
}

export default function ResumeForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPro = Boolean(user?.isPro);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');

  const [templateId, setTemplateId] = useState('modern-clean');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [experienceBullets, setExperienceBullets] = useState([]);
  const [educationBullets, setEducationBullets] = useState([]);

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

  function addProjectBullet(index) {
    setProjects((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;
        const v = (p.bulletInput || '').trim();
        if (!v) return p;
        if ((p.bullets || []).includes(v)) return { ...p, bulletInput: '' };
        return { ...p, bulletInput: '', bullets: [...(p.bullets || []), v] };
      })
    );
  }

  function removeProjectBullet(index, bullet) {
    setProjects((prev) =>
      prev.map((p, i) => (i === index ? { ...p, bullets: (p.bullets || []).filter((b) => b !== bullet) } : p))
    );
  }

  async function onPhotoChange(file) {
    if (!file) {
      setPhotoDataUrl('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    // Keep payload small; server also validates.
    if (file.size > 300 * 1024) {
      setError('Photo is too large. Please upload an image under 300KB.');
      return;
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setError('');
    setPhotoDataUrl(dataUrl);
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
        templateId,
        photoDataUrl: photoDataUrl || undefined,
        fullName,
        email,
        phone,
        targetRole,
        experience: [
          experience,
          experienceBullets.length ? `Highlights:\n${experienceBullets.map((b) => `- ${b}`).join('\n')}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
        education: [
          education,
          educationBullets.length ? `Details:\n${educationBullets.map((b) => `- ${b}`).join('\n')}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
        skills: skillsToSend,
        projects: projects
          .map((p) => {
            const title = p.title.trim();
            const desc = p.description.trim();
            const bullets = (p.bullets || []).map((b) => `- ${b}`).join('\n');
            const combined = [desc, bullets ? `Highlights:\n${bullets}` : ''].filter(Boolean).join('\n\n');
            return { title, description: combined };
          })
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
        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-medium">Templates</div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Free plan: 3 templates. Pro plan: all 10 templates.
              </p>
            </div>
            {!isPro ? (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                Free
              </span>
            ) : (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                Pro
              </span>
            )}
          </div>

          <div className="mt-4">
            <TemplatePicker
              value={templateId}
              isPro={isPro}
              onChange={(id) => {
                setError('');
                setTemplateId(id);
              }}
              onLockedPick={() => {
                setError('Upgrade to Pro to unlock this template.');
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <div className="font-medium">Profile Photo (optional)</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            This will appear in the resume preview and PDF for most templates.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              {photoDataUrl ? (
                <img src={photoDataUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">No photo</div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => onPhotoChange(e.target.files?.[0])}
                className="text-sm"
              />
              {photoDataUrl ? (
                <button
                  type="button"
                  onClick={() => setPhotoDataUrl('')}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Tip: upload a square photo under 300KB.</p>
        </div>

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

                  <div>
                    <label className="text-sm">Project bullets</label>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={p.bulletInput || ''}
                        onChange={(e) => setProjectField(idx, 'bulletInput', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addProjectBullet(idx);
                          }
                        }}
                        placeholder="e.g. Reduced API latency by 35%"
                        className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => addProjectBullet(idx)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                      >
                        Add
                      </button>
                    </div>

                    {p.bullets?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.bullets.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => removeProjectBullet(idx, b)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                            title="Remove"
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    ) : null}
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
          <div className="mt-4">
            <BulletEditor
              label="Experience bullets"
              value={experienceBullets}
              onChange={setExperienceBullets}
              placeholder="e.g. Increased conversion rate by 18%"
              hint="Optional. These will be appended under Experience." 
            />
          </div>
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
          <div className="mt-4">
            <BulletEditor
              label="Education bullets"
              value={educationBullets}
              onChange={setEducationBullets}
              placeholder="e.g. Relevant coursework: DBMS, OS, CN"
              hint="Optional. These will be appended under Education." 
            />
          </div>
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
