import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: Object, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const Resume = mongoose.model('Resume', resumeSchema);
