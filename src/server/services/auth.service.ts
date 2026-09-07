import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/client';
import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthService {
  static async register(data: z.infer<typeof RegisterSchema>) {
    const { email, password, ...rest } = data;
    const exists = await db.user.findUnique({ where: { email } });
    if (exists) throw new Error('User already exists');

    const passwordHash = await bcrypt.hash(password, 12);
    return db.user.create({
      data: { ...rest, email, passwordHash, role: 'ADMIN' },
    });
  }

  static async login(data: z.infer<typeof LoginSchema>) {
    const { email, password } = data;
    const user = await db.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new Error('Invalid credentials');

    return user;
  }
}
