'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const EXEMPT_PATHS = ['/onboarding', '/login', '/register', '/auth'];

export function OnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) return;

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (!member) {
        router.replace('/onboarding');
      }
    });
  }, [pathname, router]);

  return null;
}
