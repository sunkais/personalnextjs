import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WorkContent } from './WorkContent';
import { LikeFavoriteButtons } from './LikeFavoriteButtons';
import { CommentSection } from './CommentSection';

export default async function WorkPage({
  params,
}: {
  params: Promise<{ id: string; workId: string }>;
}) {
  const { id: memberId, workId } = await params;
  const supabase = await createClient();

  const { data: work, error } = await supabase
    .from('works')
    .select('*, members(id, name, avatar_url)')
    .eq('id', workId)
    .eq('member_id', memberId)
    .single();

  if (error || !work) notFound();

  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('work_id', workId)
    .order('created_at', { ascending: true });

  const { count: likesCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('work_id', workId);

  return (
    <div className="space-y-8">
      <Link
        href={`/member/${memberId}`}
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
      >
        ← 返回 {work.members?.name} 的空间
      </Link>

      <article className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-white md:text-3xl">{work.title}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-white/50">
            <span>{work.members?.name}</span>
            <span>
              {new Date(work.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </header>

        {work.description && (
          <p className="text-white/80">{work.description}</p>
        )}

        <WorkContent work={work} />

        <LikeFavoriteButtons workId={workId} initialLikes={likesCount ?? 0} />

        <CommentSection workId={workId} comments={comments ?? []} redirectPath={`/member/${memberId}/work/${workId}`} />
      </article>
    </div>
  );
}
