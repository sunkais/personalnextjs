'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Comment } from '@/types/database';

interface CommentSectionProps {
  workId: string;
  comments: Comment[];
  redirectPath?: string;
}

export function CommentSection({ workId, comments: initialComments, redirectPath = '' }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) =>
      setUser(user?.id ?? null)
    );

    const channel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `work_id=eq.${workId}` },
        (payload) => {
          setComments((prev) => [...prev, payload.new as Comment]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workId]);

  const submit = async () => {
    if (!user || !content.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('comments')
      .insert({ work_id: workId, user_id: user, content: content.trim() });
    setLoading(false);
    if (!error) setContent('');
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-white/90">评论</h3>

      {user ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            className="flex-1 rounded-lg border border-[var(--card-border)] bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-[var(--accent-2)] focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={loading || !content.trim()}
            className="rounded-lg bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            发送
          </button>
        </div>
      ) : (
        <p className="text-sm text-white/50">
          <a href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="text-[var(--accent-2)] hover:underline">
            登录
          </a>
          后即可评论
        </p>
      )}

      <ul className="space-y-3">
        {comments.map((c) => (
          <li
            key={c.id}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4"
          >
            <p className="text-white/90">{c.content}</p>
            <p className="mt-1 text-xs text-white/40">
              {new Date(c.created_at).toLocaleString('zh-CN')}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
