'use client'

import { useState } from 'react'
import { Activity } from 'lucide-react'

export default function BmiCalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bmi, setBmi] = useState<number | null>(null)
  const [category, setCategory] = useState('')

  const calculateBmi = (e: React.FormEvent) => {
    e.preventDefault()
    if (!height || !weight) return

    const h = parseFloat(height) / 100 // cm to m
    const w = parseFloat(weight)
    
    if (h > 0 && w > 0) {
      const result = w / (h * h)
      setBmi(parseFloat(result.toFixed(1)))
      
      if (result < 18.5) setCategory('Underweight - Requires Caloric Surplus')
      else if (result < 25) setCategory('Optimal - Maintain Baseline')
      else if (result < 30) setCategory('Overweight - Recommend Caloric Deficit')
      else setCategory('Obese - Immediate Protocol Required')
    }
  }

  return (
    <div className="bg-glass-panel border border-glass-stroke p-8 rounded-2xl relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <h3 className="text-xl font-bold text-white font-sora mb-6 flex items-center gap-3">
        <Activity className="w-5 h-5 text-electric-lime" />
        BMI TELEMETRY
      </h3>
      
      <form onSubmit={calculateBmi} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-white/70 font-mono uppercase tracking-wider ml-1">Height (cm)</label>
            <input 
              type="number" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors text-sm"
              placeholder="175"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-white/70 font-mono uppercase tracking-wider ml-1">Weight (kg)</label>
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors text-sm"
              placeholder="70"
              required
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full py-3 bg-white text-deep-obsidian font-extrabold tracking-widest uppercase rounded-lg hover:bg-electric-lime transition-colors text-xs"
        >
          ANALYZE METRICS
        </button>
      </form>

      {bmi && (
        <div className="mt-6 pt-6 border-t border-glass-stroke text-center">
          <div className="text-4xl font-sora font-extrabold text-electric-lime mb-1">{bmi}</div>
          <div className="text-xs font-mono text-white/70 uppercase tracking-widest">{category}</div>
        </div>
      )}
    </div>
  )
}
