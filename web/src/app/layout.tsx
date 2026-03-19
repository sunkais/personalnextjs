import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { OnboardingGate } from '@/components/OnboardingGate';
import { createClient } from '@/lib/supabase/server';
import type { Member } from '@/types/database';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '像素舱 - 四人学习分享',
  description: '四位同学的学习作品展示空间，游戏、应用、笔记一网打尽',
};

async function withTimeout<T>(promise: Promise<T>, fallback: T, ms = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  
  // 使用异步包装器，确保传给 withTimeout 的是纯正的 Promise<Member[]>
  const members = await withTimeout(
    (async () => {
      const { data } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: true });
      return (data as Member[]) || []; // 强制断言并处理空值
    })(),
    [] as Member[], // 后备方案也是纯数组
    4000
  );

  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <OnboardingGate />
        {/* 这里的 members 现在是纯正的 Member[] 类型 */}
        <Nav members={members} />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}