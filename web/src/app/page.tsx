import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Member } from '@/types/database';

const COLORS = [
  'from-[#ff6b9d] to-[#ff8fab]',
  'from-[#c44dff] to-[#a855f7]',
  'from-[#4dd4ff] to-[#22d3ee]',
  'from-[#ffd93d] to-[#fbbf24]',
];

export default async function Home() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: true });

  const { data: recentWorks } = await supabase
    .from('works')
    .select('id, member_id, title, type, cover_image, created_at, members(id, name)')
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          <span className="bg-gradient-to-r from-[var(--accent-1)] via-[var(--accent-2)] to-[var(--accent-3)] bg-clip-text text-transparent">
            像素舱
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-white/70">
          四位同学的学习作品展示空间 · 游戏、应用、笔记一网打尽
        </p>
      </section>

      {/* 四人入口卡片 */}
      <section>
        <h2 className="mb-6 text-xl font-semibold text-white/90">探索空间</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(members ?? []).map((member: Member, i) => (
              <Link
                key={member.id}
                href={`/member/${member.id}`}
                className={`card-hover group relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 transition-all duration-300 hover:border-white/20`}
              >
                <div
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${COLORS[i % 4]} opacity-30 blur-2xl transition-opacity group-hover:opacity-50`}
                />
                <div className="relative">
                  <div
                    className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${COLORS[i % 4]} text-2xl font-bold text-white`}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                  <p className="mt-1 text-sm text-white/60 line-clamp-2">
                    {member.bio || '暂无简介'}
                  </p>
                </div>
              </Link>
          ))}
        </div>
      </section>

      {/* 最新动态 */}
      {recentWorks && recentWorks.length > 0 && (
        <section>
          <h2 className="mb-6 text-xl font-semibold text-white/90">最新动态</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(recentWorks ?? []).map((work) => {
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
        </section>
      )}
    </div>
  );
}
