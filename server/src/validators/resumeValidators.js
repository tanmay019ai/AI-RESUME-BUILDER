import { z } from 'zod';

export const resumeGenerateSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(6).max(30),
  skills: z.array(z.string().min(1).max(50)).min(1).max(50),
  projects: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().min(1).max(800),
      })
    )
    .max(20)
    .default([]),
  experience: z.string().min(1).max(4000),
  education: z.string().min(1).max(2000),
  targetRole: z.string().min(2).max(120),
});
