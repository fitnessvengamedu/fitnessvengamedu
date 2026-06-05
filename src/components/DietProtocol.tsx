'use client'

import { useState, useEffect } from 'react'
import { Apple, Search, Sparkles, Loader2, Utensils } from 'lucide-react'

interface Product {
  name: string
  image: string | null
  calories: number
  protein: number
  carbohydrates: number
  fat: number
}

interface DietProtocolProps {
  initialGoal?: string
  targetCalories?: string
}

export default function DietProtocol({ initialGoal = '', targetCalories = '' }: DietProtocolProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')
  const [isLocal, setIsLocal] = useState(false)
  const [isFallback, setIsFallback] = useState(false)

  const calories = parseInt(targetCalories) || 2000
  // Macro calculations: 30% Protein, 45% Carbs, 25% Fat
  const targetProtein = Math.round((calories * 0.3) / 4)
  const targetCarbs = Math.round((calories * 0.45) / 4)
  const targetFat = Math.round((calories * 0.25) / 9)

  // Default recommendations based on goal
  let recommendationTitle = 'Maintenance Protocol'
  let recommendations = 'Whole grains, lean proteins (chicken, fish), healthy fats (almonds, olive oil), and plenty of fresh vegetables.'
  
  const goalLower = initialGoal.toLowerCase()
  if (goalLower.includes('gain') || goalLower.includes('bulk') || goalLower.includes('muscle')) {
    recommendationTitle = 'Mass Builder Protocol'
    recommendations = 'Caloric surplus targets: Eggs, chicken breast, peanut butter, brown rice, bananas, and whey protein.'
  } else if (goalLower.includes('lose') || goalLower.includes('cut') || goalLower.includes('fat') || goalLower.includes('shred')) {
    recommendationTitle = 'Shredding Protocol'
    recommendations = 'Caloric deficit targets: Egg whites, cod/tuna, broccoli, spinach, tofu, berries, and green tea.'
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setIsLocal(false)
    setIsFallback(false)
    try {
      const res = await fetch(`/api/diet/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('API failure')
      const data = await res.json()
      if (data.products) {
        setProducts(data.products)
        setIsLocal(!!data.isLocal)
        setIsFallback(!!data.isFallback)
        if (data.products.length === 0) {
          setError('No matching items found.')
        }
      }
    } catch (err) {
      setError('Could not connect to food database.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-glass-panel border border-glass-stroke p-8 rounded-2xl relative overflow-hidden group flex flex-col justify-between h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div>
        <h3 className="text-xl font-bold text-white font-sora mb-6 flex items-center gap-3">
          <Apple className="w-5 h-5 text-electric-lime" />
          DIET & MACRO PROTOCOL
        </h3>

        {/* Targets HUD */}
        <div className="grid grid-cols-4 gap-3 mb-6 bg-deep-obsidian/40 border border-glass-stroke p-4 rounded-lg text-center font-mono">
          <div className="space-y-1">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">CALORIES</div>
            <div className="text-sm font-bold text-electric-lime whitespace-nowrap">{calories} kcal</div>
          </div>
          <div className="space-y-1 border-l border-glass-stroke pl-3">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">PROTEIN</div>
            <div className="text-sm font-bold text-white whitespace-nowrap">{targetProtein}g</div>
          </div>
          <div className="space-y-1 border-l border-glass-stroke pl-3">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">CARBS</div>
            <div className="text-sm font-bold text-white whitespace-nowrap">{targetCarbs}g</div>
          </div>
          <div className="space-y-1 border-l border-glass-stroke pl-3">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">FAT</div>
            <div className="text-sm font-bold text-white whitespace-nowrap">{targetFat}g</div>
          </div>
        </div>

        {/* Database Food Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Query Food DB (e.g. Oats, Egg)..."
            className="flex-1 bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors text-xs font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 bg-white/5 hover:bg-electric-lime hover:text-deep-obsidian border border-glass-stroke hover:border-electric-lime transition-all duration-300 rounded-lg text-white flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </form>

        {isFallback && (
          <div className="text-[9px] font-mono text-amber-400 bg-amber-400/5 border border-amber-400/10 rounded px-2.5 py-1 mb-3 text-center">
            ⚠️ API Rate Limited — Showing Local Fitness Catalog
          </div>
        )}
        {isLocal && !isFallback && products.length > 0 && (
          <div className="text-[9px] font-mono text-electric-lime bg-electric-lime/5 border border-electric-lime/10 rounded px-2.5 py-1 mb-3 text-center">
            ✓ Found in Local Fitness Catalog
          </div>
        )}

        {/* Search Results Display */}
        <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar mb-4">
          {error && (
            <div className="text-center py-2 text-white/40 text-[10px] font-mono uppercase tracking-wider">
              {error}
            </div>
          )}
          {products.map((prod, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-deep-obsidian/30 border border-glass-stroke/50 p-2 rounded-lg hover:border-electric-lime/30 transition-colors"
            >
              {prod.image ? (
                <img
                  src={prod.image}
                  alt={prod.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded object-cover bg-white/5 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/40 text-[10px] font-mono flex-shrink-0">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">{prod.name}</div>
                <div className="text-[9px] text-white/50 font-mono flex items-center gap-1.5 flex-wrap">
                  <span className="text-electric-lime font-bold">{prod.calories} kcal</span>
                  <span>•</span>
                  <span>P: {prod.protein}g</span>
                  <span>•</span>
                  <span>C: {prod.carbohydrates}g</span>
                  <span>•</span>
                  <span>F: {prod.fat}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Recommendation Footer */}
      <div className="pt-4 border-t border-glass-stroke text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 text-electric-lime font-mono uppercase tracking-widest text-[9px] font-bold mb-1">
          <Sparkles className="w-3 h-3" />
          {recommendationTitle}
        </div>
        <p className="text-white/60 font-sans">{recommendations}</p>
      </div>
    </div>
  )
}
