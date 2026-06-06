'use client'

import { useState } from 'react'
import { Activity, User, Info } from 'lucide-react'

export default function BmiCalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [bmi, setBmi] = useState<number | null>(null)
  const [category, setCategory] = useState('')
  const [insight, setInsight] = useState('')

  const calculateBmi = (e: React.FormEvent) => {
    e.preventDefault()
    if (!height || !weight) return

    const h = parseFloat(height) / 100 // cm to m
    const w = parseFloat(weight)
    
    if (h > 0 && w > 0) {
      const result = w / (h * h)
      const calculatedBmi = parseFloat(result.toFixed(1))
      setBmi(calculatedBmi)
      
      let cat = ''
      let ins = ''

      if (calculatedBmi < 18.5) {
        cat = 'Underweight'
        ins = gender === 'male'
          ? 'Caloric surplus recommended. Goal: Increase lean muscle mass and structural strength.'
          : 'Hormonal & metabolic health priority. Caloric surplus recommended to reach healthy fat baseline.'
      } else if (calculatedBmi < 25) {
        cat = 'Optimal'
        ins = gender === 'male'
          ? 'Optimal range. Healthy male body fat baseline is 12% - 20%. Keep up the resistance training!'
          : 'Optimal range. Healthy female body fat baseline is 21% - 32%. Excellent composition balance!'
      } else if (calculatedBmi < 30) {
        cat = 'Overweight'
        ins = gender === 'male'
          ? 'Caloric deficit recommended. Note: Muscular individuals may score high here without excess fat.'
          : 'Caloric deficit recommended. Focus on resistance training & protein to protect lean mass.'
      } else {
        cat = 'Obese'
        ins = gender === 'male'
          ? 'Immediate protocol required. Focus on metabolic conditioning, cardio, and a controlled deficit.'
          : 'Immediate protocol required. Focus on caloric deficit, light resistance, and insulin sensitivity.'
      }

      setCategory(cat)
      setInsight(ins)
    }
  }

  // Calculate pointer percentage for standard BMI range of 15 to 35
  const getBmiPercentage = () => {
    if (bmi === null) return 0
    return Math.min(Math.max(((bmi - 15) / (35 - 15)) * 100, 0), 100)
  }

  const indicatorPercent = getBmiPercentage()

  return (
    <div className="bg-glass-panel border border-glass-stroke p-8 rounded-2xl relative overflow-hidden group h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      
      <div>
        <h3 className="text-xl font-bold text-white font-sora mb-6 flex items-center gap-3">
          <Activity className="w-5 h-5 text-electric-lime" />
          BMI TELEMETRY
        </h3>
        
        <form onSubmit={calculateBmi} className="space-y-4">
          {/* Gender Selector */}
          <div className="space-y-1">
            <label className="text-xs text-white/70 font-mono uppercase tracking-wider ml-1">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  gender === 'male'
                    ? 'bg-electric-lime border-electric-lime text-deep-obsidian font-bold shadow-[0_0_10px_rgba(223,255,17,0.15)]'
                    : 'bg-deep-obsidian/30 border-glass-stroke text-white/60 hover:text-white hover:border-white/25'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  gender === 'female'
                    ? 'bg-electric-lime border-electric-lime text-deep-obsidian font-bold shadow-[0_0_10px_rgba(223,255,17,0.15)]'
                    : 'bg-deep-obsidian/30 border-glass-stroke text-white/60 hover:text-white hover:border-white/25'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Female
              </button>
            </div>
          </div>

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
      </div>

      {bmi !== null && (
        <div className="mt-6 pt-6 border-t border-glass-stroke">
          {/* Result Header */}
          <div className="text-center mb-5">
            <div className="text-4xl font-sora font-extrabold text-electric-lime mb-1">{bmi}</div>
            <div className="text-xs font-mono text-white/70 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span>Category:</span>
              <span className={`font-bold ${
                category === 'Optimal' ? 'text-electric-lime' :
                category === 'Underweight' ? 'text-blue-400' :
                category === 'Overweight' ? 'text-amber-400' : 'text-rose-500'
              }`}>{category}</span>
            </div>
          </div>

          {/* Telemetry Segmented Bar Graph */}
          <div className="relative mb-5 px-1">
            <div className="w-full h-2.5 rounded-full flex overflow-hidden bg-white/5 border border-white/5 relative">
              {/* Underweight Segment (<18.5) - 17.5% width */}
              <div className="bg-blue-500/20 border-r border-white/5 w-[17.5%] h-full" title="Underweight (< 18.5)" />
              {/* Optimal Segment (18.5 - 25) - 32.5% width */}
              <div className="bg-electric-lime/30 border-r border-white/5 w-[32.5%] h-full" title="Optimal (18.5 - 25.0)" />
              {/* Overweight Segment (25 - 30) - 25% width */}
              <div className="bg-amber-500/20 border-r border-white/5 w-[25%] h-full" title="Overweight (25.0 - 30.0)" />
              {/* Obese Segment (>30) - 25% width */}
              <div className="bg-rose-500/20 w-[25%] h-full" title="Obese (>= 30.0)" />
            </div>

            {/* Glowing Pointer Cursor */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-electric-lime shadow-[0_0_12px_#dfff11] -ml-2 transition-all duration-700 ease-out"
              style={{ left: `${indicatorPercent}%` }}
            />
          </div>

          {/* Segment Range Scale Labels */}
          <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase tracking-wider mb-4 px-1">
            <span>15.0</span>
            <span>18.5</span>
            <span>25.0</span>
            <span>30.0</span>
            <span>35.0+</span>
          </div>

          {/* Gender-specific insight card */}
          <div className="bg-deep-obsidian/40 border border-glass-stroke p-3 rounded-lg flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-electric-lime shrink-0 mt-0.5" />
            <div className="text-[10px] leading-relaxed text-white/70">
              <span className="font-bold text-white uppercase font-mono block mb-0.5">Composition Insight:</span>
              {insight}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
