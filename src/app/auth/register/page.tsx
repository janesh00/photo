'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, UserRound } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      window.location.assign('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-photo auth-photo-register" aria-label="A couple walking through a wedding venue">
        <Link href="/" className="auth-brand"><span className="brand-mark">P</span> PhotoShare</Link>
        <div className="auth-photo-caption"><span>START HERE</span><strong>Make space for<br /><em>the good part.</em></strong></div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <Link href="/" className="auth-back">Back to PhotoShare</Link>
          <div className="auth-heading"><p className="eyebrow">Start your workspace</p><h1>Bring it all<br /><em>together.</em></h1><p>Create an account and give your next event room to unfold.</p></div>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="register-name">Full name</label>
            <div className="auth-input-wrap"><UserRound size={17} /><input id="register-name" type="text" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></div>
            <label htmlFor="register-email">Email address</label>
            <div className="auth-input-wrap"><Mail size={17} /><input id="register-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>
            <label htmlFor="register-password">Password</label>
            <div className="auth-input-wrap"><Lock size={17} /><input id="register-password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></div>
            <button type="submit" disabled={loading} className="auth-submit">{loading ? 'Creating account...' : 'Create account'} <ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">Already have an account? <Link href="/auth/login">Sign in instead</Link></p>
        </div>
      </section>
    </main>
  );
}