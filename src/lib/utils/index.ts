import { z } from 'zod';

export const apiSuccess = (data: any) => ({ success: true, ...data });

export const apiError = (message: string, status = 400) => ({ error: message, status });

export const loginSchema = z.object({
 email: z.string().email(),
 password: z.string().min(1),
});
