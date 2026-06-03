'use server'

import { createClient } from '@/utils/supabase/server'

export async function forgotPassword(formData: FormData, origin: string) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password reset link has been sent to your email.' }
}
