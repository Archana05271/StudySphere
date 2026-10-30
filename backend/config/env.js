import dotenv from 'dotenv';
dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];

export function validateEnv() {
  for (const key of required) {
    if (!process.env[key]) throw new Error(`${key} must be configured (see backend/.env.example)`);
  }
  if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
}

export const clientOrigins = () =>
  (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map((v) => v.trim()).filter(Boolean);
