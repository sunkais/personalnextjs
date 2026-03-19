'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AddWorkPage() {
  const params = useParams();
  const memberId = params.id as string;
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [checking, setChecking] = useState(true);
  const [type, setType] = useState<'file' | 'link'>('link');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user?.id ?? null);
      if (user) {
        const { data } = await supabase
          .from('members')
          .select('id')
          .eq('auth_user_id', user.id)
          .eq('id', memberId)
          .maybeSingle();
        setIsCreator(!!data);
      }
      setChecking(false);
    })();
  }, [memberId]);

  if (checking) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center text-white/60">
        加载中...
      </div>
    );
  }

  if (user && !isCreator) {
    return (
      <div className="text-center text-white/70">
        <p>你没有权限在此空间上传作品</p>
        <Link href={`/member/${memberId}`} className="mt-4 inline-block text-[var(--accent-2)] hover:underline">
          返回
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-white/70">
        <p>请先登录</p>
        <Link href={`/login?redirect=/member/${memberId}/add`} className="mt-4 inline-block text-[var(--accent-2)] hover:underline">
          去登录
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();

    try {
      if (type === 'link') {
        if (!embedUrl.trim()) {
          setError('请输入链接');
          setLoading(false);
          return;
        }
        const { error } = await supabase.from('works').insert({
          member_id: memberId,
          title: title.trim(),
          type: 'link',
          embed_url: embedUrl.trim(),
          description: description.trim() || null,
        });
        if (error) throw error;
      } else {
        if (!file) {
          setError('请选择文件');
          setLoading(false);
          return;
        }
        const ext = file.name.split('.').pop()?.toLowerCase();
        const path = `${memberId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('works')
          .upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('works').getPublicUrl(path);
        const { error } = await supabase.from('works').insert({
          member_id: memberId,
          title: title.trim() || file.name,
          type: 'file',
          file_url: urlData.publicUrl,
          description: description.trim() || null,
        });
        if (error) throw error;
      }
      router.push(`/member/${memberId}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link href={`/member/${memberId}`} className="text-sm text-white/60 hover:text-white">
        ← 返回
      </Link>
      <h1 className="text-2xl font-bold text-white">添加作品</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-white/70">类型</label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="type"
                value="link"
                checked={type === 'link'}
                onChange={() => setType('link')}
              />
              <span className="text-white">链接</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="type"
                value="file"
                checked={type === 'file'}
                onChange={() => setType('file')}
              />
              <span className="text-white">文件</span>
            </label>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="作品名称"
            className="w-full rounded-lg border border-[var(--card-border)] bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-[var(--accent-2)] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="可选"
            rows={3}
            className="w-full rounded-lg border border-[var(--card-border)] bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-[var(--accent-2)] focus:outline-none"
          />
        </div>
        <div className={type === 'link' ? '' : 'hidden'}>
          <label className="mb-1 block text-sm text-white/70">链接</label>
          <input
            type="url"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="https://xxx.itch.io/game 或 CodePen 链接等"
            className="w-full rounded-lg border border-[var(--card-border)] bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-[var(--accent-2)] focus:outline-none"
          />
        </div>
        <div className={type === 'file' ? '' : 'hidden'}>
          <label className="mb-1 block text-sm text-white/70">文件</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.md,.txt"
            className="w-full rounded-lg border border-[var(--card-border)] bg-white/5 px-4 py-2 text-white file:mr-4 file:rounded file:border-0 file:bg-[var(--accent-2)] file:px-4 file:py-2 file:text-white"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] py-2.5 font-medium text-white disabled:opacity-50"
        >
          {loading ? '提交中...' : '提交'}
        </button>
      </form>
    </div>
  );
}
