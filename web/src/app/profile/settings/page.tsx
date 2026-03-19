'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ProfileSettingsPage() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [memberId, setMemberId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace('/login?redirect=/profile/settings');
        return;
      }
      const { data: member } = await supabase
        .from('members')
        .select('id, name, bio')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (!member) {
        router.replace('/onboarding');
        return;
      }
      setMemberId(member.id);
      setName(member.name || '');
      setBio(member.bio || '');
      setChecking(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !memberId) return;
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase
      .from('members')
      .update({ name: name.trim(), bio: bio.trim() || null })
      .eq('id', memberId);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  };

  if (checking) {
    return (
      <div className="mx-auto max-w-md text-center text-white/60">加载中...</div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <Link href="/profile" className="text-sm text-white/60 hover:text-white">
        ← 返回我的收藏
      </Link>
      <h1 className="text-2xl font-bold text-white">个人资料</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-white/70">昵称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：小明"
            required
            className="w-full rounded-lg border border-[var(--card-border)] bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-[var(--accent-2)] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">简介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="如：游戏爱好者"
            rows={3}
            className="w-full rounded-lg border border-[var(--card-border)] bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-[var(--accent-2)] focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] py-2.5 font-medium text-white disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
}
