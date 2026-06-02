// Sign Up Page — Community GreenToken
// Route: /signup
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function SignUpPage() {
  const router = useRouter();
  const { token: inviteToken, org: orgName } = router.query;
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [strength, setStrength] = useState(0);

  function calcStrength(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-primary'];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!agree) { setError('Please accept the Terms of Service and Privacy Policy.'); return; }
    setLoading(true); setError('');
    const { data, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { display_name: form.name } } });
    if (authErr) { setError(authErr.message); setLoading(false); return; }
    if (inviteToken) {
      await fetch(`/api/invites/${inviteToken}/accept`, { method: 'POST' });
      router.push('/dashboard');
    } else {
      router.push('/org/setup');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-page px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <img src="/branding/community-greentoken-logo.png" alt="Community GreenToken" className="h-14" />
        </div>

        {inviteToken && orgName && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center mb-6">
            <p className="text-sm text-green-700 font-medium">You&apos;re joining <strong>{orgName}</strong></p>
          </div>
        )}

        <h1 className="text-2xl font-bold text-center text-text-dark mb-6">Create Your Account</h1>

        {error && <div role="alert" className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-1">Full Name</label>
            <input id="name" type="text" required value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Alice Mokoena" />
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-text-dark mb-1">Email</label>
            <input id="signup-email" type="email" required value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-text-dark mb-1">Password</label>
            <div className="relative">
              <input id="signup-password" type="password" required minLength={8} value={form.password}
                onChange={e => { setForm({...form, password: e.target.value}); setStrength(calcStrength(e.target.value)); }}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Min. 8 characters" />
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-gray-100'}`} />
                  ))}
                </div>
                <p className="text-xs text-text-secondary mt-1">{strengthLabel[strength]}</p>
              </div>
            )}
          </div>
          <div className="flex items-start gap-2">
            <input id="terms" type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}
              className="mt-0.5 accent-primary" />
            <label htmlFor="terms" className="text-xs text-text-secondary">
              I agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener" className="text-primary hover:underline" aria-label="Terms of Service (opens in new tab)">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" rel="noopener" className="text-primary hover:underline" aria-label="Privacy Policy (opens in new tab)">Privacy Policy</a>
            </label>
          </div>
          <button type="submit" disabled={loading || !agree} aria-busy={loading}
            className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <a href="/signin" className="text-primary font-medium hover:underline">Sign In</a>
        </p>
      </div>
    </main>
  );
}
