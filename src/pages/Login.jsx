import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Login() {
  const { user, isAdmin, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Bounce already-logged-in users to their dashboard
  useEffect(() => {
    if (!loading && user) navigate(isAdmin ? '/admin' : '/account', { replace: true });
  }, [loading, user, isAdmin, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      toast(error.message || 'Sign in failed. Check your details and try again.', 'error');
      return;
    }
    toast('Welcome back!', 'success');
    // navigation handled by the effect above (waits for profile/isAdmin)
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast('Password must be at least 6 characters.', 'error');
      return;
    }
    setSubmitting(true);
    const { error } = await signUp(email.trim(), password, whatsapp.trim());
    setSubmitting(false);
    if (error) {
      toast(error.message || 'Sign up failed. Please try again.', 'error');
      return;
    }
    toast('Account created! Welcome to MALIK Digital Store.', 'success');
    // navigation handled by the effect above
  };

  const inputCls =
    'w-full rounded-xl border border-white/10 bg-[#0b0b12] px-4 py-3 text-white placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b12]">
        <div className="mx-auto max-w-md px-4 py-24">
          <div className="h-80 animate-pulse rounded-3xl bg-[#15151d]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      <div className="mx-auto max-w-md px-4 py-12">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Login' }]} />
        <div className="mt-6 rounded-3xl border border-white/10 bg-[#15151d] p-8">
          <h1 className="text-2xl font-extrabold text-white text-center">
            <span className="bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] bg-clip-text text-transparent">
              MALIK
            </span>{' '}
            Digital Store
          </h1>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in to track orders and download your products.
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#0b0b12] p-1">
            {['signin', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-lg py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] ${
                  mode === m ? 'bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="mt-6 space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                aria-label="Email address"
                className={inputCls}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                className={inputCls}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] px-6 py-3.5 font-bold text-white transition hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
              >
                {submitting ? 'Signing In…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="mt-6 space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                aria-label="Email address"
                className={inputCls}
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                aria-label="Password"
                className={inputCls}
              />
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp number (optional)"
                aria-label="WhatsApp number"
                className={inputCls}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#00b4ff] px-6 py-3.5 font-bold text-white transition hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
              >
                {submitting ? 'Creating Account…' : 'Create Account'}
              </button>
              <p className="text-xs text-gray-500 text-center">
                Your WhatsApp number helps us deliver your files and order updates faster.
              </p>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            You can also check out as a guest —{' '}
            <Link to="/shop" className="text-[#ff2e88] hover:underline">
              continue shopping
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
