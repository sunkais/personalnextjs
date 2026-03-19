import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/auth/success'

  if (token_hash && type) {
    const supabase = await createClient()

    // 在服务端直接验证哈希码，避开大陆直连 supabase.co 的不稳定因素
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // 验证成功，带用户去成功落地页
      redirect(next)
    }
  }

  // 验证失败，带用户去错误提示页
  redirect('/auth-error')
}