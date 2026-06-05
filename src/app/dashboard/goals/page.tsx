import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import Link from 'next/link'
import DailyLogForm from '@/components/DailyLogForm'
import { BarChart3, Flame, Droplet, Dumbbell, Calendar } from 'lucide-react'

export default async function GoalsTrackingPage() {
  const supabase = await createClient()

  // Fetch current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/signin')
  }

  // Get user profile data using admin client to bypass RLS recursion
  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  const metadata = user.user_metadata || {}

  // Fetch logs and goals from metadata / profile fallback
  const dailyLogs = profile?.daily_logs || metadata.daily_logs || []
  const goalsList = profile?.goals_list || metadata.goals_list || []
  const activeGoal = goalsList.find((g: any) => g.active) || goalsList[0]

  const calorieGoal = activeGoal
    ? parseInt(activeGoal.calories || '2500', 10)
    : parseInt(profile?.target_calories || metadata.target_calories || '2500', 10)
  const waterGoal = parseFloat(profile?.target_water || metadata.target_water || '3.0') // Default 3L water goal

  // Sort logs by date ascending to render the chronological chart, take last 7 logs
  const chartLogs = [...dailyLogs]
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .slice(-7)

  // Pad the chart logs to always show at least 7 days for a full bar chart visual
  while (chartLogs.length < 7) {
    const d = new Date()
    d.setDate(d.getDate() - (7 - chartLogs.length))
    const dateStr = d.toLocaleDateString('en-CA')
    chartLogs.unshift({
      date: dateStr,
      calories: 0,
      water: 0,
      workout: false,
      placeholder: true
    })
  }

  return (
    <div className="min-h-screen bg-deep-obsidian text-white relative overflow-hidden flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-electric-lime/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#DFFF11]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full space-y-8 flex-1">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-glass-stroke/40 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-sora text-white flex items-center gap-3">
              <span className="text-electric-lime">GOAL</span> TRACKING PROTOCOL
            </h1>
            <p className="text-sm text-white/40 mt-1 uppercase font-mono tracking-widest">
              SYSTEM LEVEL: ELITE MEMBER • DATABASE STATUS: ACTIVE
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-[#161618] border border-glass-stroke text-white font-bold tracking-widest uppercase text-xs rounded-lg hover:bg-electric-lime hover:text-deep-obsidian hover:border-electric-lime hover:shadow-[0_0_15px_rgba(223,255,17,0.2)] transition-all text-center self-start"
          >
            Return to Dashboard
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Logging Form */}
          <div className="lg:col-span-4 h-full">
            <DailyLogForm />
          </div>

          {/* Right Column: Visual Charts & Logs */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Visual Bar Charts Card */}
            <div className="bg-glass-panel border border-glass-stroke p-8 rounded-2xl flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-8">
                <BarChart3 className="w-5 h-5 text-electric-lime" />
                <h3 className="text-lg font-bold text-white font-sora uppercase">Performance Metrics (Last 7 Days)</h3>
              </div>

              {/* The Bar Chart */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-64 border-b border-glass-stroke/50 pb-4 relative">
                  {chartLogs.map((log: any, idx: number) => {
                    const calPercent = Math.min((log.calories / calorieGoal) * 100, 100)
                    const waterPercent = Math.min((log.water / waterGoal) * 100, 100)
                    
                    const dateObj = new Date(log.date)
                    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                    const dayNum = dateObj.toLocaleDateString('en-US', { day: '2-digit' })

                    return (
                      <div key={idx} className="flex flex-col items-center gap-3 h-full justify-end group/bar relative">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-[105%] opacity-0 group-hover/bar:opacity-100 transition-opacity bg-deep-obsidian border border-glass-stroke p-3 rounded-lg text-[10px] font-mono pointer-events-none shadow-2xl z-10 w-32 text-left space-y-1">
                          <div className="text-white/60 uppercase text-[9px] tracking-wider mb-1 border-b border-glass-stroke pb-0.5">{log.date}</div>
                          <div className="text-white flex justify-between">
                            <span>Cal:</span>
                            <span className="text-electric-lime">{log.calories} / {calorieGoal} kcal</span>
                          </div>
                          <div className="text-white flex justify-between">
                            <span>Water:</span>
                            <span className="text-cyan-400">{log.water.toFixed(1)} / {waterGoal.toFixed(1)}L</span>
                          </div>
                          <div className="text-white flex justify-between">
                            <span>Workout:</span>
                            <span className={log.workout ? 'text-electric-lime' : 'text-white/40'}>
                              {log.workout ? 'YES' : 'NO'}
                            </span>
                          </div>
                        </div>

                        {/* Bars container */}
                        <div className="flex gap-1.5 h-full items-end justify-center w-full">
                          {/* Calorie Bar */}
                          <div 
                            className="w-3 sm:w-4 rounded-t-sm bg-gradient-to-t from-electric-lime/40 to-electric-lime shadow-[0_0_10px_rgba(223,255,17,0.3)] transition-all duration-500" 
                            style={{ height: `${log.placeholder ? 5 : Math.max(calPercent, 5)}%` }}
                          />
                          {/* Water Bar */}
                          <div 
                            className="w-3 sm:w-4 rounded-t-sm bg-gradient-to-t from-cyan-500/40 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-500" 
                            style={{ height: `${log.placeholder ? 5 : Math.max(waterPercent, 5)}%` }}
                          />
                        </div>

                        {/* Dumbbell Indicator */}
                        <div className="h-4 flex items-center justify-center">
                          {log.workout ? (
                            <Dumbbell className="w-3.5 h-3.5 text-electric-lime" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* X Axis Labels */}
                <div className="grid grid-cols-7 gap-3 sm:gap-6 pt-3 text-center">
                  {chartLogs.map((log: any, idx: number) => {
                    const dateObj = new Date(log.date)
                    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                    const dayNum = dateObj.toLocaleDateString('en-US', { day: '2-digit' })
                    return (
                      <div key={idx} className="space-y-0.5">
                        <div className="text-[10px] font-bold text-white/80 font-sora">{dayLabel}</div>
                        <div className="text-[9px] text-white/40 font-mono">{dayNum}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-6 mt-8 pt-4 border-t border-glass-stroke/30 text-[10px] font-mono text-white/50 justify-center sm:justify-start">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-electric-lime" />
                  <span>CALORIE GOAL ({calorieGoal} kcal)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-cyan-400" />
                  <span>WATER GOAL ({waterGoal.toFixed(1)} L)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-electric-lime" />
                  <span>WORKOUT COMPLETED</span>
                </div>
              </div>
            </div>

            {/* Historical Entries Log Table */}
            <div className="bg-glass-panel border border-glass-stroke p-8 rounded-2xl relative overflow-hidden flex-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-electric-lime" />
                <h3 className="text-lg font-bold text-white font-sora uppercase">Activity Registry</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-glass-stroke text-white/40 uppercase tracking-widest text-[9px]">
                      <th className="pb-3 font-normal">Date</th>
                      <th className="pb-3 font-normal">Calories</th>
                      <th className="pb-3 font-normal">Water</th>
                      <th className="pb-3 font-normal">Workout Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-stroke/30 text-white/80">
                    {dailyLogs.length > 0 ? (
                      dailyLogs.map((log: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 font-medium text-white">{log.date}</td>
                          <td className="py-3">
                            <span className={log.calories >= calorieGoal ? 'text-electric-lime' : ''}>
                              {log.calories} kcal
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={log.water >= waterGoal ? 'text-cyan-400' : ''}>
                              {log.water.toFixed(1)} L
                            </span>
                          </td>
                          <td className="py-3">
                            {log.workout ? (
                              <span className="px-2 py-0.5 text-[9px] bg-electric-lime/10 border border-electric-lime/20 text-electric-lime rounded-full uppercase tracking-wider">
                                Completed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[9px] bg-white/5 border border-glass-stroke text-white/40 rounded-full uppercase tracking-wider">
                                Rest Day
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-white/40">
                          No logged activity entries found. Set your daily goals and start tracking.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
