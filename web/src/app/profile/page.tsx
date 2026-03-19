import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/profile');

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      work_id,
      works (
        id,
        title,
        type,
        cover_image,
        member_id,
        members (id, name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">我的收藏</h1>
      {favorites && favorites.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f) => {
            const work = Array.isArray(f.works) ? f.works[0] : f.works;
            if (!work) return null;
            const member = Array.isArray(work.members) ? work.members[0] : work.members;
            return (
              <Link
                key={work.id}
                href={`/member/${work.member_id}/work/${work.id}`}
                className="card-hover overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all hover:border-white/20"
              >
                <div className="aspect-video bg-white/5">
                  {work.cover_image ? (
                    <img
                      src={work.cover_image}
                      alt={work.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-white/20">
                      {work.type === 'file' ? '📄' : '🔗'}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white line-clamp-1">{work.title}</h3>
                  <p className="text-sm text-white/50">{member?.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-white/60">暂无收藏，去探索作品吧～</p>
      )}
    </div>
  );
}
