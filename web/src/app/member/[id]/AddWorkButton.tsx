'use client';

import Link from 'next/link';

interface AddWorkButtonProps {
  memberId: string;
}

export function AddWorkButton({ memberId }: AddWorkButtonProps) {
  return (
    <Link
      href={`/member/${memberId}/add`}
      className="rounded-full bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
    >
      + 添加作品
    </Link>
  );
}
