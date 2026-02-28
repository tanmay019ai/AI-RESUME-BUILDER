import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';
import { generateResumeJson } from '../services/geminiService.js';
import { generateResumePdf } from '../services/pdfService.js';
import { resumeGenerateSchema } from '../validators/resumeValidators.js';

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
    content: {
      profile: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        targetRole: input.targetRole,
      },
      ai: content,
    },
  });

  // Increment resumeCount atomically.
  await User.updateOne({ _id: user._id }, { $inc: { resumeCount: 1 } });

  return res.status(201).json({
    resume: {
      id: resume._id,
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
  return res.json({ resume: { id: resume._id, content: resume.content, createdAt: resume.createdAt } });
}

export async function downloadPdf(req, res) {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  const watermark = !req.user.isPro;
  const profile = resume.content.profile;
  const content = resume.content.ai;

  const pdf = await generateResumePdf({ profile, content, isPro: req.user.isPro, watermark });

  // Puppeteer returns a Uint8Array; convert to Buffer so Express always writes binary.
  const pdfBuffer = Buffer.from(pdf);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=resume-${resume._id}.pdf`);
  res.setHeader('Content-Length', String(pdfBuffer.length));
  return res.send(pdfBuffer);
}
