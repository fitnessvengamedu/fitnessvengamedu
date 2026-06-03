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

export async function addDailyLog(log: { date: string; calories: number; water: number; workout: boolean }) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Unauthorized' }
  }

  // Fetch current metadata
  const metadata = user.user_metadata || {}
  const currentLogs = metadata.daily_logs || []

  // Upsert the log for the given date (replace if already exists, else append)
  const newLogs = [...currentLogs.filter((l: any) => l.date !== log.date), log]
  
  // Sort logs by date descending
  newLogs.sort((a: any, b: any) => b.date.localeCompare(a.date))

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      daily_logs: newLogs
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
        daily_logs: newLogs
      })
      .eq('id', user.id)
  } catch (e) {
    console.error('Gracefully caught database update error:', e)
  }

  revalidatePath('/dashboard/goals')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateGoalsList(goals: Array<{ id: string; objective: string; weight: string; calories: string; timeLimit: string; active: boolean }>) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Unauthorized' }
  }

  if (goals.length > 3) {
    return { error: 'Maximum of 3 goals allowed.' }
  }

  // Ensure active goal is set correctly
  const activeGoal = goals.find(g => g.active) || goals[0]
  if (activeGoal) {
    activeGoal.active = true
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      goals_list: goals,
      fitness_goal: activeGoal?.objective || '',
      target_weight: activeGoal?.weight || '',
      target_calories: activeGoal?.calories || '',
      target_timeframe: activeGoal?.timeLimit || ''
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  try {
    await supabase
      .from('profiles')
      .update({
        goals_list: goals,
        fitness_goal: activeGoal?.objective || '',
        target_weight: activeGoal?.weight || '',
        target_calories: activeGoal?.calories || '',
        target_timeframe: activeGoal?.timeLimit || ''
      })
      .eq('id', user.id)
  } catch (e) {
    console.error('Gracefully caught database update error:', e)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/goals')
  return { success: true }
}


