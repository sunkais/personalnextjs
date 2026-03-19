import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { OnboardingGate } from '@/components/OnboardingGate';
import { createClient } from '@/lib/supabase/server';

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <OnboardingGate />
        <Nav members={members ?? []} />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
