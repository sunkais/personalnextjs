import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Member, Work } from '@/types/database';
import { AddWorkButton } from './AddWorkButton';

const TYPE_LABELS: Record<string, string> = {
  file: '文件',
  link: '链接',
  game: '游戏',
  app: '应用',
  note: '笔记',
};

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isCreator = user
    ? (await supabase.from('members').select('id').eq('auth_user_id', user.id).eq('id', id).single()).data
    : null;

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  if (memberError || !member) notFound();

  const { data: works } = await supabase
    .from('works')
    .select('*')
    .eq('member_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      {/* 成员信息 */}
      <section className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c44dff] to-[#a855f7] text-4xl font-bold text-white">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.name}
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            member.name.charAt(0)
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{member.name}</h1>
          <p className="mt-2 text-white/70">{member.bio || '暂无简介'}</p>
        </div>
      </section>

      {/* 作品列表 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white/90">作品</h2>
          <div className="flex items-center gap-3">
            {isCreator && <AddWorkButton memberId={id} />}
            <span className="text-sm text-white/50">共 {(works ?? []).length} 个</span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(works ?? []).map((work: Work) => (
              <Link
                key={work.id}
                href={`/member/${id}/work/${work.id}`}
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
                  <div className="mt-2 flex items-center gap-4 text-sm text-white/50">
                    <span>{TYPE_LABELS[work.type] || work.type}</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
