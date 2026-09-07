'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, KeyRound, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'ADMIN' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to sign in.');
      router.push('/dashboard');
      router.refresh();
    } catch (loginError: unknown) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-photo auth-photo-login" aria-label="A photographer reviewing a finished gallery">
        <Link href="/" className="auth-brand"><span className="brand-mark">P</span> PhotoShare</Link>
        <div className="auth-photo-caption"><span>STUDIO ACCESS</span><strong>Lead the story<br /><em>with intention.</em></strong></div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <Link href="/" className="auth-back">Back to PhotoShare</Link>
          <div className="auth-heading"><p className="eyebrow"><KeyRound size={14} /> Admin workspace</p><h1>Welcome<br /><em>back, lead.</em></h1><p>Sign in to manage events, teams, photographs, and private galleries.</p></div>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="admin-email">Admin email</label>
            <div className="auth-input-wrap"><Mail size={17} /><input id="admin-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>
            <label htmlFor="admin-password">Password</label>
            <div className="auth-input-wrap"><Lock size={17} /><input id="admin-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></div>
            <button type="submit" disabled={loading} className="auth-submit">{loading ? 'Checking access...' : 'Enter workspace'} <ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">Need an admin account? <Link href="/auth/register">Create admin account</Link><br />Team member? <Link href="/auth/login">Use team login</Link></p>
        </div>
      </section>
    </main>
  );
}
