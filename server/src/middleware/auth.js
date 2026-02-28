import { verifyJwt } from '../utils/jwt.js';
import { User } from '../models/User.js';

// Protects routes by requiring a valid JWT.
// Expects header: Authorization: Bearer <token>
export async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const [, token] = auth.split(' ');

    if (!token) {
      return res.status(401).json({ message: 'Missing auth token' });
    }

    const decoded = verifyJwt(token);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
