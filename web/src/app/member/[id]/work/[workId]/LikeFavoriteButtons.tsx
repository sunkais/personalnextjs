'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LikeFavoriteButtonsProps {
  workId: string;
  initialLikes?: number;
  initialFavorited?: boolean;
  initialLiked?: boolean;
}

export function LikeFavoriteButtons({
  workId,
  initialLikes = 0,
  initialFavorited = false,
  initialLiked = false,
}: LikeFavoriteButtonsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user?.id ?? null);
      if (user) {
        const [{ data: likedData }, { data: favData }] = await Promise.all([
          supabase.from('likes').select('user_id').eq('work_id', workId).eq('user_id', user.id).maybeSingle(),
          supabase.from('favorites').select('user_id').eq('work_id', workId).eq('user_id', user.id).maybeSingle(),
        ]);
        setLiked(!!likedData);
        setFavorited(!!favData);
      }
    });
  }, [workId]);

  const toggleLike = async () => {
    if (!user) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname || '/');
      return;
    }
    const supabase = createClient();
    if (liked) {
      await supabase.from('likes').delete().eq('work_id', workId).eq('user_id', user);
      setLikesCount((c) => c - 1);
    } else {
      await supabase.from('likes').insert({ work_id: workId, user_id: user });
      setLikesCount((c) => c + 1);
    }
    setLiked(!liked);
  };

  const toggleFavorite = async () => {
    if (!user) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname || '/');
      return;
    }
    const supabase = createClient();
    if (favorited) {
      await supabase.from('favorites').delete().eq('work_id', workId).eq('user_id', user);
    } else {
      await supabase.from('favorites').insert({ work_id: workId, user_id: user });
    }
    setFavorited(!favorited);
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={toggleLike}
        className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
          liked ? 'bg-pink-500/30 text-pink-400' : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        <span>{liked ? '❤️' : '🤍'}</span>
        <span>{likesCount}</span>
      </button>
      <button
        onClick={toggleFavorite}
        className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
          favorited ? 'bg-amber-500/30 text-amber-400' : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        <span>{favorited ? '⭐' : '☆'}</span>
        <span>{favorited ? '已收藏' : '收藏'}</span>
      </button>
    </div>
  );
}
