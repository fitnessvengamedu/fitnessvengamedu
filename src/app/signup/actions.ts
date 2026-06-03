'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const bloodGroup = formData.get('bloodGroup') as string
  const street = formData.get('street') as string
  const area = formData.get('area') as string
  const district = formData.get('district') as string

  // Simple validation
  if (!email || !password || !fullName || !phone || !bloodGroup) {
    return { error: 'Please fill out all mandatory fields.' }
  }

  const supabase = await createClient()

  // Sign up with Supabase Auth
  // We pass the extra data in 'raw_user_meta_data' so our Postgres trigger can capture it
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        blood_group: bloodGroup,
        street: street,
        area: area,
        district: district,
        avatar_url: '' // Can be updated later
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  
  // Redirect to dashboard immediately after successful signup
  // Note: This assumes email confirmation is turned OFF in Supabase settings
  redirect('/dashboard')
}
