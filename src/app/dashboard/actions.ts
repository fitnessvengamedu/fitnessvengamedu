'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateGoals(goal: string, targetWeight: string, targetCalories: string) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Unauthorized' }
  }

  // Update user_metadata (this is always writable for the current user)
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      fitness_goal: goal,
      target_weight: targetWeight,
      target_calories: targetCalories
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  // Gracefully try to update profiles table if columns exist
  try {
    await supabase
      .from('profiles')
      .update({
        fitness_goal: goal,
        target_weight: targetWeight,
        target_calories: targetCalories
      })
      .eq('id', user.id)
  } catch (e) {
    console.error('Gracefully caught database update error:', e)
  }

  revalidatePath('/dashboard')
  return { success: true }
}
