import { User } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signJwt } from '../utils/jwt.js';
import { loginSchema, signupSchema } from '../validators/authValidators.js';

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isPro: user.isPro,
    resumeCount: user.resumeCount,
    createdAt: user.createdAt,
  };
}

export async function signup(req, res) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
  }

  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed });

  const token = signJwt({ userId: user._id.toString() });
  return res.status(201).json({ token, user: publicUser(user) });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signJwt({ userId: user._id.toString() });
  return res.json({ token, user: publicUser(user) });
}

export async function me(req, res) {
  return res.json({ user: publicUser(req.user) });
}
