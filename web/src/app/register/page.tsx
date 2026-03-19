'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md space-y-8">
      <h1 className="text-2xl font-bold text-white">注册</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-white/70">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--card-border)] bg-white/5 px-4 py-2 text-white focus:border-[var(--accent-2)] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-[var(--card-border)] bg-white/5 px-4 py-2 text-white focus:border-[var(--accent-2)] focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] py-2.5 font-medium text-white disabled:opacity-50"
        >
          {loading ? '注册中...' : '注册'}
        </button>
      </form>
      <p className="text-center text-sm text-white/60">
        已有账号？{' '}
        <Link href="/login" className="text-[var(--accent-2)] hover:underline">
          登录
        </Link>
      </p>
    </div>
  );
}
