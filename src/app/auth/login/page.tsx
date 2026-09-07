'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-photo auth-photo-login" aria-label="A photographer reviewing a finished gallery">
        <Link href="/" className="auth-brand"><span className="brand-mark">P</span> PhotoShare</Link>
        <div className="auth-photo-caption"><span>01 / 03</span><strong>Keep the feeling<br /><em>in the frame.</em></strong></div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <Link href="/" className="auth-back">Back to PhotoShare</Link>
          <div className="auth-heading"><p className="eyebrow">Welcome back</p><h1>Good work<br /><em>awaits.</em></h1><p>Sign in to continue shaping your next gallery.</p></div>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="login-email">Email address</label>
            <div className="auth-input-wrap"><Mail size={17} /><input id="login-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrap"><Lock size={17} /><input id="login-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></div>
            <button type="submit" disabled={loading} className="auth-submit">{loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">New to PhotoShare? <Link href="/auth/register">Create an account</Link><br /><Link href="/auth/admin">Admin workspace access</Link></p>
        </div>
      </section>
    </main>
  );
}