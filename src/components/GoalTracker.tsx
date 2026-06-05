'use client'

import { useState } from 'react'
import { Target, Weight, Flame, Clock, Edit2, Save, X, Trash2, Plus, Loader2 } from 'lucide-react'
import { updateGoalsList } from '@/app/dashboard/actions'
import Link from 'next/link'

interface Goal {
  id: string
  objective: string
  weight: string
  calories: string
  timeLimit: string
  active: boolean
}

interface GoalTrackerProps {
  initialGoal?: string
  initialWeight?: string
  initialCalories?: string
  initialTimeframe?: string
  initialGoalsList?: Goal[]
  dailyLogs?: any[]
}

const getValidDateStr = (val: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return val
  }
  return ''
}

export default function GoalTracker({
  initialGoal = '',
  initialWeight = '',
  initialCalories = '',
  initialTimeframe = '',
  initialGoalsList = [],
  dailyLogs = []
}: GoalTrackerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialize goals list with fallback to legacy single goal
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (initialGoalsList && initialGoalsList.length > 0) {
      return initialGoalsList
    }
    if (initialGoal) {
      return [{
        id: 'goal-1',
        objective: initialGoal,
        weight: initialWeight,
        calories: initialCalories,
        timeLimit: initialTimeframe || 'Ongoing',
        active: true
      }]
    }
    return []
  })

  // Local state for editing to prevent modifying page layout during typing
  const [editGoalsList, setEditGoalsList] = useState<Goal[]>([])

  const handleStartEdit = () => {
    setEditGoalsList(goals.length > 0 ? [...goals.map(g => ({ ...g }))] : [{
      id: Math.random().toString(),
      objective: '',
      weight: '',
      calories: '',
      timeLimit: '',
      active: true
    }])
    setIsEditing(true)
  }

  const handleAddNewGoalDirect = () => {
    const baseGoals = goals.length > 0 ? goals.map(g => ({ ...g })) : []
    if (baseGoals.length < 3) {
      baseGoals.push({
        id: Math.random().toString(),
        objective: '',
        weight: '',
        calories: '',
        timeLimit: '',
        active: baseGoals.length === 0
      })
    }
    setEditGoalsList(baseGoals)
    setIsEditing(true)
  }

  const handleAddSlot = () => {
    if (editGoalsList.length >= 3) return
    setEditGoalsList([
      ...editGoalsList,
      {
        id: Math.random().toString(),
        objective: '',
        weight: '',
        calories: '',
        timeLimit: '',
        active: editGoalsList.length === 0
      }
    ])
  }

  const handleRemoveSlot = (id: string) => {
    const updated = editGoalsList.filter(g => g.id !== id)
    // If we deleted the active one, mark the first remaining one as active
    if (updated.length > 0 && !updated.some(g => g.active)) {
      updated[0].active = true
    }
    setEditGoalsList(updated)
  }

  const handleGoalFieldChange = (id: string, field: keyof Goal, value: any) => {
    setEditGoalsList(editGoalsList.map(g => {
      if (g.id === id) {
        return { ...g, [field]: value }
      }
      return g
    }))
  }

  const handleSetActiveEdit = (id: string) => {
    setEditGoalsList(editGoalsList.map(g => ({
      ...g,
      active: g.id === id
    })))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate
    const invalid = editGoalsList.some(g => !g.objective || !g.weight || !g.calories || !g.timeLimit)
    if (invalid) {
      setError('Please fill in Objective, Weight, Calories, and Time Limit for all goals.')
      setIsLoading(false)
      return
    }

    try {
      const result = await updateGoalsList(editGoalsList)
      if (result.error) {
        setError(result.error)
      } else {
        setGoals(editGoalsList)
        setIsEditing(false)
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActiveDirect = async (id: string) => {
    const updated = goals.map(g => ({
      ...g,
      active: g.id === id
    }))
    setIsLoading(true)
    try {
      const result = await updateGoalsList(updated)
      if (!result.error) {
        setGoals(updated)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Active Goal Computation
  const activeGoal = goals.find(g => g.active) || goals[0]

  // Calculate today's progress metrics
  const todayStr = new Date().toLocaleDateString('en-CA')
  const todayLog = (dailyLogs || []).find((log: any) => log.date === todayStr) || { calories: 0, water: 0, workout: false }

  const targetCalVal = activeGoal ? parseInt(activeGoal.calories || '2500', 10) : 2500
  const targetWaterVal = 3.0 // default 3L water target

  const calProgressPercent = Math.min((todayLog.calories / targetCalVal) * 100, 100)
  const waterProgressPercent = Math.min((todayLog.water / targetWaterVal) * 100, 100)

  if (isEditing) {
    return (
      <div className="bg-glass-panel border border-glass-stroke p-8 rounded-2xl flex flex-col h-full relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white font-sora flex items-center gap-3">
            <Target className="w-5 h-5 text-electric-lime" />
            MANAGE GOALS ({editGoalsList.length}/3)
          </h3>
          <button 
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-6 overflow-y-auto max-h-[420px] pr-2 scrollbar-thin">
            {editGoalsList.map((g, idx) => (
              <div key={g.id} className="p-4 bg-white/5 border border-glass-stroke/40 rounded-xl space-y-4 relative">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-electric-lime uppercase tracking-wider">Goal Slot #{idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSetActiveEdit(g.id)}
                      className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border rounded-full transition-all ${
                        g.active
                          ? 'bg-electric-lime/10 border-electric-lime/40 text-electric-lime shadow-[0_0_8px_rgba(223,255,17,0.2)]'
                          : 'border-white/20 text-white/40 hover:border-white/40 hover:text-white'
                      }`}
                    >
                      {g.active ? 'ACTIVE' : 'SET ACTIVE'}
                    </button>
                    {editGoalsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(g.id)}
                        className="text-white/40 hover:text-apex-crimson transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">Objective</label>
                    <select
                      value={g.objective}
                      onChange={(e) => handleGoalFieldChange(g.id, 'objective', e.target.value)}
                      className="w-full bg-[#161618] border border-glass-stroke text-white px-3 py-2 rounded focus:outline-none focus:border-electric-lime text-sm"
                    >
                      <option value="">Select Objective</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Muscle Gain">Muscle Gain</option>
                      <option value="Endurance Training">Endurance Training</option>
                      <option value="General Health">General Health / Fitness</option>
                      <option value="Powerlifting">Powerlifting / Strength</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">Target Weight (kg)</label>
                      <input
                        type="number"
                        value={g.weight}
                        onChange={(e) => handleGoalFieldChange(g.id, 'weight', e.target.value)}
                        placeholder="e.g. 75"
                        className="w-full bg-[#161618] border border-glass-stroke text-white px-3 py-2 rounded focus:outline-none focus:border-electric-lime text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">Calorie Target</label>
                      <input
                        type="number"
                        value={g.calories}
                        onChange={(e) => handleGoalFieldChange(g.id, 'calories', e.target.value)}
                        placeholder="e.g. 2500"
                        className="w-full bg-[#161618] border border-glass-stroke text-white px-3 py-2 rounded focus:outline-none focus:border-electric-lime text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">Target Date / Deadline</label>
                    <input
                      type="date"
                      value={getValidDateStr(g.timeLimit)}
                      onChange={(e) => handleGoalFieldChange(g.id, 'timeLimit', e.target.value)}
                      className="w-full bg-[#161618] border border-glass-stroke text-white px-3 py-2 rounded focus:outline-none focus:border-electric-lime text-sm scheme-dark"
                    />
                  </div>
                </div>
              </div>
            ))}

            {editGoalsList.length < 3 && (
              <button
                type="button"
                onClick={handleAddSlot}
                className="w-full py-3 border border-dashed border-glass-stroke hover:border-electric-lime/50 text-white/40 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider bg-white/5"
              >
                <Plus className="w-4 h-4" /> Add Goal Slot ({editGoalsList.length}/3)
              </button>
            )}

            {error && <p className="text-xs text-apex-crimson font-mono mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-electric-lime text-deep-obsidian font-bold tracking-widest uppercase text-xs rounded hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(223,255,17,0.2)] mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Goals List
              </>
            )}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-glass-panel border border-glass-stroke p-8 rounded-2xl flex flex-col h-full relative overflow-hidden group justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white font-sora flex items-center gap-3">
          <Target className="w-5 h-5 text-electric-lime" />
          GOAL PROTOCOL
        </h3>
        <div className="flex items-center gap-2">
          {goals.length < 3 && (
            <button 
              type="button"
              onClick={handleAddNewGoalDirect}
              disabled={isLoading}
              className="p-1.5 rounded-lg border border-glass-stroke hover:border-electric-lime hover:bg-electric-lime/10 text-white/60 hover:text-electric-lime transition-all disabled:opacity-40"
              title="Add New Goal"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
          <button 
            type="button"
            onClick={handleStartEdit}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-glass-stroke hover:border-electric-lime hover:bg-electric-lime/10 text-white/60 hover:text-electric-lime transition-all disabled:opacity-40"
            title="Edit Goals"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {activeGoal ? (
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Active Goal Grid */}
            <div className="grid grid-cols-2 gap-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-electric-lime/10 flex items-center justify-center border border-electric-lime/20 flex-shrink-0">
                  <Target className="w-4 h-4 text-electric-lime" />
                </div>
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">Active Objective</div>
                  <div className="text-white font-bold text-sm tracking-tight truncate">{activeGoal.objective}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-apex-crimson/10 flex items-center justify-center border border-apex-crimson/20 flex-shrink-0">
                  <Weight className="w-4 h-4 text-apex-crimson" />
                </div>
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">Target Weight</div>
                  <div className="text-white font-bold text-sm">{activeGoal.weight} kg</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 flex-shrink-0">
                  <Flame className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">Daily Calories</div>
                  <div className="text-white font-bold text-sm">{activeGoal.calories} kcal</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 flex-shrink-0">
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">Time Limit</div>
                  <div className="text-white font-bold text-sm truncate">{activeGoal.timeLimit}</div>
                </div>
              </div>
            </div>

            {/* Today's Daily Update Progress Bars */}
            <div className="pt-4 border-t border-glass-stroke/30 space-y-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">Active Goal Telemetry</div>
              
              {/* Calories Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-white/60">Calories</span>
                  <span className="text-electric-lime">{todayLog.calories} / {targetCalVal} kcal</span>
                </div>
                <div className="w-full bg-[#161618] border border-glass-stroke/40 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-electric-lime h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(223,255,17,0.5)]" 
                    style={{ width: `${calProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Water Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-white/60">Water</span>
                  <span className="text-cyan-400">{todayLog.water.toFixed(1)} / {targetWaterVal.toFixed(1)} L</span>
                </div>
                <div className="w-full bg-[#161618] border border-glass-stroke/40 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
                    style={{ width: `${waterProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Other Configured Goals List */}
            {goals.length > 1 && (
              <div className="pt-4 border-t border-glass-stroke/30 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">Switch Goal Slot</div>
                <div className="flex flex-wrap gap-2">
                  {goals.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleToggleActiveDirect(g.id)}
                      className={`text-[9px] font-mono uppercase tracking-wider px-3 py-1.5 border rounded-lg transition-all flex items-center gap-1.5 ${
                        g.active
                          ? 'bg-electric-lime/10 border-electric-lime text-electric-lime font-bold shadow-[0_0_8px_rgba(223,255,17,0.2)]'
                          : 'bg-[#161618] border-glass-stroke text-white/50 hover:border-white/40 hover:text-white'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${g.active ? 'bg-electric-lime animate-pulse' : 'bg-white/20'}`} />
                      {g.objective || 'Goal'} ({g.timeLimit})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-glass-stroke/30 flex items-center justify-between text-[10px] font-mono">
            <Link href="/dashboard/goals" className="text-electric-lime hover:underline uppercase tracking-wider font-semibold">
              Track Daily Progress →
            </Link>
            <span className="text-white/40">APEX ELITE v1.0</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          <p className="text-sm text-white/60 mb-6 leading-relaxed">
            No fitness goals set yet. Initialize your target metrics to track weight, calories, and training objectives.
          </p>
          <button 
            type="button"
            onClick={handleStartEdit}
            className="w-full py-3 bg-white text-deep-obsidian font-bold tracking-widest uppercase text-xs rounded hover:bg-electric-lime transition-colors text-center mt-auto"
          >
            Configure Goals
          </button>
        </div>
      )}
    </div>
  )
}
