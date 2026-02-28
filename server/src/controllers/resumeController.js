import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';
import { generateResumeJson } from '../services/geminiService.js';
import { generateResumePdf } from '../services/pdfService.js';
import { resumeGenerateSchema } from '../validators/resumeValidators.js';
import { assertTemplateAllowed, getTemplateDef } from '../templates/registry.js';
import { env } from '../config/env.js';

export async function generate(req, res) {
  const parsed = resumeGenerateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
  }

  const user = req.user;
  if (!user.isPro && user.resumeCount >= 1) {
    return res.status(403).json({ message: 'Free plan limit reached. Upgrade to Pro for unlimited generation.' });
  }

  const input = parsed.data;

  // Enforce template access rules.
  assertTemplateAllowed({ templateId: input.templateId, isPro: user.isPro });

  // Feed structured input to Gemini.
  const content = await generateResumeJson({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    skills: input.skills,
    projects: input.projects,
    experience: input.experience,
    education: input.education,
    targetRole: input.targetRole,
  });

  const resume = await Resume.create({
    userId: user._id,
    templateId: input.templateId,
    content: {
      profile: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        targetRole: input.targetRole,
        photoDataUrl: input.photoDataUrl,
      },
      ai: content,
    },
  });

  // Increment resumeCount atomically.
  await User.updateOne({ _id: user._id }, { $inc: { resumeCount: 1 } });

  return res.status(201).json({
    resume: {
      id: resume._id,
      templateId: resume.templateId,
      content: resume.content,
      createdAt: resume.createdAt,
    },
  });
}

export async function getById(req, res) {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }
  return res.json({
    resume: { id: resume._id, templateId: resume.templateId, content: resume.content, createdAt: resume.createdAt },
  });
}

export async function updateTemplate(req, res) {
  const templateId = String(req.body?.templateId || '');
  if (!templateId) {
    return res.status(400).json({ message: 'templateId is required' });
  }

  assertTemplateAllowed({ templateId, isPro: req.user.isPro });

  const resume = await Resume.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { templateId } },
    { new: true }
  );
  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  return res.json({
    resume: { id: resume._id, templateId: resume.templateId, content: resume.content, createdAt: resume.createdAt },
  });
}

export async function downloadPdf(req, res) {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  const watermark = !req.user.isPro;
  const profile = resume.content.profile;
  const content = resume.content.ai;
  const templateId = resume.templateId || 'modern-clean';

  // Prevent a user from downloading a Pro-only template if their plan changed.
  const def = getTemplateDef(templateId);
  if (!req.user.isPro && def && !def.free) {
    return res
      .status(403)
      .json({ message: 'This resume uses a Pro template. Upgrade to download without changing template.' });
  }

  const pdf = await generateResumePdf({
    templateId,
    profile,
    content,
    isPro: req.user.isPro,
    watermark,
    brandName: env.BRAND_NAME,
  });

  // Puppeteer returns a Uint8Array; convert to Buffer so Express always writes binary.
  const pdfBuffer = Buffer.from(pdf);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=resume-${resume._id}.pdf`);
  res.setHeader('Content-Length', String(pdfBuffer.length));
  return res.send(pdfBuffer);
}
