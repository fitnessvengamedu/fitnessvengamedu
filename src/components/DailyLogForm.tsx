'use client'

import { useState } from 'react'
import { Calendar, Flame, Droplet, Dumbbell, Save, Loader2, ArrowLeft } from 'lucide-react'
import { addDailyLog } from '@/app/dashboard/actions'
import Link from 'next/link'

export default function DailyLogForm() {
  const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format in local timezone
  const [date, setDate] = useState(todayStr)
  const [calories, setCalories] = useState('')
  const [water, setWater] = useState('')
  const [workout, setWorkout] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ text: '', type: '' })

    const calorieVal = parseInt(calories, 10) || 0
    const waterVal = parseFloat(water) || 0

    try {
      const result = await addDailyLog({
        date,
        calories: calorieVal,
        water: waterVal,
        workout
      })

      if (result.error) {
        setMessage({ text: result.error, type: 'error' })
      } else {
        setMessage({ text: 'Daily activity logged successfully!', type: 'success' })
        setCalories('')
        setWater('')
        setWorkout(false)
      }
    } catch (err) {
      setMessage({ text: 'Failed to record entry.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-glass-panel border border-glass-stroke p-8 rounded-2xl flex flex-col relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white font-sora flex items-center gap-2">
          <Calendar className="w-5 h-5 text-electric-lime" />
          LOG DAILY ACTIVITY
        </h3>
        <Link 
          href="/dashboard" 
          className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-electric-lime transition-colors border border-glass-stroke px-2.5 py-1.5 rounded-lg bg-[#161618]/50"
        >
          <ArrowLeft className="w-3 h-3" /> Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Log Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#161618] border border-glass-stroke text-white px-3 py-2 rounded focus:outline-none focus:border-electric-lime text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-1">
                <Flame className="w-3 h-3 text-yellow-500" />
                Calories (kcal)
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 2100"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-[#161618] border border-glass-stroke text-white px-3 py-2 rounded focus:outline-none focus:border-electric-lime text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-1">
                <Droplet className="w-3 h-3 text-cyan-400" />
                Water (Litres)
              </label>
              <input
                type="number"
                required
                step="0.1"
                min="0"
                placeholder="e.g. 2.5"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                className="w-full bg-[#161618] border border-glass-stroke text-white px-3 py-2 rounded focus:outline-none focus:border-electric-lime text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[#161618] border border-glass-stroke/50">
            <span className="text-xs font-mono uppercase tracking-wider text-white/60 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-electric-lime" />
              WORKOUT COMPLETED
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={workout}
                onChange={(e) => setWorkout(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#252528] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-electric-lime"></div>
            </label>
          </div>

          {message.text && (
            <p className={`text-xs font-mono ${message.type === 'error' ? 'text-apex-crimson' : 'text-electric-lime'}`}>
              {message.text}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-electric-lime text-deep-obsidian font-bold tracking-widest uppercase text-xs rounded hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(223,255,17,0.2)] mt-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Record Log
            </>
          )}
        </button>
      </form>
    </div>
  )
}
