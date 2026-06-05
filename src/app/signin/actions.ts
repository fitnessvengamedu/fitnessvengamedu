'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/utils/supabase/server'

export async function signin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  let role = 'member'
  if (authData?.user) {
    const adminSupabase = await createAdminClient()
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()
    if (profile?.role) {
      role = profile.role
    }
  }

  return { success: true, role }
}
