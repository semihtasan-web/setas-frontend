"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Supabase ortam değişkenleri eksik (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace('/');
      return;
    }

    const { data: roleEntry } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .maybeSingle();

    const roleName = (roleEntry as { roles?: { name?: string } } | null)?.roles?.name;

    if (roleName === 'admin') {
      router.replace('/admin');
      return;
    }

    if (roleName === 'demo_guest') {
      router.replace('/demo');
      return;
    }

    if (roleName === 'restricted') {
      router.replace('/project-guest');
      return;
    }

    router.replace('/');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Supabase ortam değişkenleri eksik (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-16">
      <div className="mx-auto flex max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-white/90 px-8 py-10 shadow-[0_25px_80px_rgba(15,23,42,0.65)] shadow-indigo-950/60 backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-500">
            Şantiye Yönetim
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">Hesabına giriş yap</h1>
          <p className="text-sm text-slate-500">
            Raporlamaya ve saha takibine anında eriş.
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-sm font-medium text-rose-800">
              {error}
            </div>
          )}

          <label className="space-y-2 text-sm font-semibold text-slate-600">
            <span>E-posta</span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/30"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-600">
            <span>Şifre</span>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/30"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-900/70"
          >
            {loading ? 'Yükleniyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">
          <span className="h-px w-16 bg-slate-300/80" aria-hidden="true" />
          veya
          <span className="h-px w-16 bg-slate-300/80" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 transition hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-500"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200">
            <span className="text-[0.65rem] font-semibold text-slate-700">G</span>
          </span>
          {loading ? 'Giriş yönlendiriliyor...' : 'Google ile Giriş'}
        </button>
      </div>
    </main>
  );
}
