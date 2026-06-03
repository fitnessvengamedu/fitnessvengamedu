'use client'

import { useState } from 'react'
import { Target, Weight, Flame, Edit2, Save, X, Loader2 } from 'lucide-react'
import { updateGoals } from '@/app/dashboard/actions'

interface GoalTrackerProps {
  initialGoal?: string
  initialWeight?: string
  initialCalories?: string
}

export default function GoalTracker({
  initialGoal = '',
  initialWeight = '',
  initialCalories = '',
}: GoalTrackerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [goal, setGoal] = useState(initialGoal)
  const [weight, setWeight] = useState(initialWeight)
  const [calories, setCalories] = useState(initialCalories)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await updateGoals(goal, weight, calories)
      if (result.error) {
        setError(result.error)
      } else {
        setIsEditing(false)
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-glass-panel border border-glass-stroke p-8 rounded-2xl flex flex-col h-full relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white font-sora flex items-center gap-2">
            <Target className="w-5 h-5 text-electric-lime" />
            SET ELITE GOALS
          </h3>
          <button 
            type="button"
            onClick={() => {
              setGoal(initialGoal)
              setWeight(initialWeight)
              setCalories(initialCalories)
              setIsEditing(false)
            }}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Fitness Objective</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Target Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 75"
                  className="w-full bg-[#161618] border border-glass-stroke text-white px-3 py-2 rounded focus:outline-none focus:border-electric-lime text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Daily Calorie Target</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full bg-[#161618] border border-glass-stroke text-white px-3 py-2 rounded focus:outline-none focus:border-electric-lime text-sm"
                />
              </div>
            </div>

            {error && <p className="text-xs text-apex-crimson font-mono">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-electric-lime text-deep-obsidian font-bold tracking-widest uppercase text-xs rounded hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(223,255,17,0.2)] mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Goals
              </>
            )}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-glass-panel border border-glass-stroke p-8 rounded-2xl flex flex-col h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white font-sora flex items-center gap-2">
          <Target className="w-5 h-5 text-electric-lime" />
          GOAL PROTOCOL
        </h3>
        <button 
          type="button"
          onClick={() => setIsEditing(true)}
          className="p-1.5 rounded-lg border border-glass-stroke hover:border-electric-lime hover:bg-electric-lime/10 text-white/60 hover:text-electric-lime transition-all"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {goal || weight || calories ? (
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {goal && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-electric-lime/10 flex items-center justify-center border border-electric-lime/20 flex-shrink-0">
                  <Target className="w-4 h-4 text-electric-lime" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">Objective</div>
                  <div className="text-white font-medium text-sm">{goal}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {weight && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-apex-crimson/10 flex items-center justify-center border border-apex-crimson/20 flex-shrink-0">
                    <Weight className="w-4 h-4 text-apex-crimson" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">Target Weight</div>
                    <div className="text-white font-medium text-sm">{weight} kg</div>
                  </div>
                </div>
              )}

              {calories && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 flex-shrink-0">
                    <Flame className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">Daily Calories</div>
                    <div className="text-white font-medium text-sm">{calories} kcal</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-glass-stroke/30 flex items-center justify-between text-[10px] font-mono text-white/40">
            <span>STATUS: ACTIVE</span>
            <span>APEX ELITE v1.0</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          <p className="text-sm text-white/60 mb-6 leading-relaxed">
            No fitness goals set yet. Initialize your target metrics to track weight, calories, and training objectives.
          </p>
          <button 
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full py-3 bg-white text-deep-obsidian font-bold tracking-widest uppercase text-xs rounded hover:bg-electric-lime transition-colors text-center mt-auto"
          >
            Configure Goals
          </button>
        </div>
      )}
    </div>
  )
}
