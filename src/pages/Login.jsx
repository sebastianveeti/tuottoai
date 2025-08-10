import { useState } from 'react';
import { supabase } from '../supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMsg('');
    const redirectTo = window.location.origin + '/dashboard';
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setSending(false);
    setMsg(error ? error.message : 'Check your email for the login link.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        <h1 className="text-xl font-semibold">Sign in to Tuotto</h1>
        <p className="text-sm text-slate-600 mt-1">We’ll email you a magic link.</p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="mt-6 w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <button
          type="submit"
          disabled={sending}
          className="mt-4 w-full rounded-md bg-black text-white p-3 disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Send magic link'}
        </button>
        {msg && <p className="mt-3 text-sm text-slate-700">{msg}</p>}
      </form>
    </div>
  );
}
