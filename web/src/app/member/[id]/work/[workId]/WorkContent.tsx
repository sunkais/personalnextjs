import type { Work } from '@/types/database';

function isEmbeddable(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes('itch.io') ||
    u.includes('codepen.io') ||
    u.includes('codesandbox.io')
  );
}

interface WorkContentProps {
  work: Work & { members?: { id: string; name: string; avatar_url: string | null } };
}

export function WorkContent({ work }: WorkContentProps) {
  if (work.type === 'file' && work.file_url) {
    const ext = work.file_url.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return (
        <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
          <iframe
            src={work.file_url}
            className="h-[60vh] w-full"
            title={work.title}
          />
        </div>
      );
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return (
        <div className="overflow-hidden rounded-xl border border-[var(--card-border)]">
          <img
            src={work.file_url}
            alt={work.title}
            className="w-full object-contain"
          />
        </div>
      );
    }
    return (
      <a
        href={work.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-white transition-colors hover:bg-white/20"
      >
        下载文件
      </a>
    );
  }

  if (work.type === 'link' && work.embed_url) {
    if (isEmbeddable(work.embed_url)) {
      return (
        <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
          <iframe
            src={work.embed_url}
            className="aspect-video w-full"
            title={work.title}
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <a
        href={work.embed_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] px-5 py-2.5 text-white transition-opacity hover:opacity-90"
      >
        在新标签页打开
      </a>
    );
  }

  return null;
}
