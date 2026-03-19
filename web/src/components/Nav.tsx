'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Member } from '@/types/database';

interface NavProps {
  members: Member[];
}

export function Nav({ members }: NavProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-[var(--accent-1)] via-[var(--accent-2)] to-[var(--accent-3)] bg-clip-text text-transparent">
            像素舱
          </span>
        </Link>

        {/* Desktop: 四人入口 */}
        <div className="hidden items-center gap-2 md:flex">
          {members.slice(0, 4).map((m, i) => (
            <Link
              key={m.id}
              href={`/member/${m.id}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/10 ${
                pathname === `/member/${m.id}` ? 'bg-white/10' : ''
              }`}
            >
              {m.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/profile/settings"
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20"
              >
                个人资料
              </Link>
              <Link
                href="/profile"
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20"
              >
                我的收藏
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20"
              >
                退出登录
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              登录
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded p-2 hover:bg-white/10"
            onClick={() => setOpen(!open)}
            aria-label="菜单"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[var(--card-border)] bg-[var(--background)] p-4 md:hidden">
          <div className="flex flex-col gap-2">
            {user && (
              <>
                <Link
                  href="/profile/settings"
                  className="rounded-lg px-4 py-2 hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  个人资料
                </Link>
                <Link
                  href="/profile"
                  className="rounded-lg px-4 py-2 hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  我的收藏
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-4 py-2 text-left hover:bg-white/10 w-full"
                >
                  退出登录
                </button>
              </>
            )}
            {members.map((m) => (
              <Link
                key={m.id}
                href={`/member/${m.id}`}
                className="rounded-lg px-4 py-2 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                {m.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
