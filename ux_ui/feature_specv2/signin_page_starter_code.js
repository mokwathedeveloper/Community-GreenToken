// Sign In Page — Community GreenToken
// Route: /signin
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEmailSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/dashboard');
  }

  async function handleWalletConnect() {
    // Wallet integration placeholder
    alert('Wallet connect — integrate MetaMask / Phantom here');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/branding/community-greentoken-logo.png" alt="Community GreenToken" className="h-14" />
        </div>

        <h1 className="text-2xl font-bold text-center text-text-dark mb-2">Welcome Back</h1>
        <p className="text-sm text-center text-text-secondary mb-6">
          Sign in to your GreenToken account
        </p>

        {error && (
          <div role="alert" className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">Email</label>
            <input
              id="email" type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-1">Password</label>
            <input
              id="password" type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
          <div className="flex justify-end">
            <a href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</a>
          </div>
          <button
            type="submit" disabled={loading}
            aria-busy={loading}
            className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or</div>
        </div>

        <button
          onClick={handleWalletConnect}
          className="w-full border border-primary text-primary font-medium py-3 rounded-lg hover:bg-green-50 transition"
        >
          Connect Wallet
        </button>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-primary font-medium hover:underline">Sign Up</a>
        </p>
      </div>
    </main>
  );
}
