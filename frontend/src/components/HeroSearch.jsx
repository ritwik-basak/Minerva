import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EXAMPLE_QUERIES = [
  "Latest breakthroughs in quantum computing 2025",
  "Role of Amul in India's dairy revolution",
  "History and legacy of the Roman Empire",
  "Recent advances in cancer immunotherapy",
  "How does large language model training work?",
]

export default function HeroSearch({ onSearch }) {
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = () => {
    if (query.trim()) onSearch(query.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') {
      setExpanded(false)
      setFocused(false)
      setQuery('')
    }
  }

  const handleExpand = () => {
    setExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 300)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16">

      {/* Hero heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16 max-w-3xl"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-xs font-mono text-gold-600 tracking-widest uppercase"
          style={{}}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
          Multi-Agent AI Research System
        </motion.div>

        <h1 className="font-display text-5xl md:text-7xl font-semibold text-obsidian-900 leading-tight mb-6">
          Where curiosity
          <br />
          {/* Golden shine effect on italic text */}
          <span className="relative inline-block italic">
            {/* Shadow-casting layer: page-bg colored text is opaque, so it naturally
                covers the top of its own shadow — same fade effect as "Where curiosity" */}
            {/* Visible gradient text on top */}
            <span
              className="relative text-gold-gradient italic"
              style={{
                background: 'linear-gradient(135deg, #d4a853, #b8860b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              meets intelligence
            </span>
            {/* Moving shine overlay */}
            <motion.span
              className="absolute inset-0 italic pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 20%, rgba(255,215,100,0.5) 50%, transparent 80%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                backgroundSize: '200% 200%',
              }}
              animate={{ backgroundPosition: ['-200% 0', '200% 0'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
            >
              meets intelligence
            </motion.span>
          </span>
        </h1>

        <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto font-light">
          Minerva deploys specialized AI agents to search, analyze, and synthesize
          knowledge from across the web — delivering structured research reports in seconds.
        </p>
      </motion.div>

      {/* Search interaction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl"
      >
        <AnimatePresence mode="wait">
          {!expanded ? (
            <motion.div
              key="button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              {/* Search button with golden glow */}
              <div className="relative">
                {/* Outer glow ring — slow pulse */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(212,168,83,0.3) 0%, transparent 70%)',
                    filter: 'blur(8px)',
                  }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Second glow ring — offset timing */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(212,168,83,0.2) 0%, transparent 70%)',
                    filter: 'blur(12px)',
                  }}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                />

                {/* The button itself */}
                <motion.button
                  onClick={handleExpand}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #d4a853 0%, #b8860b 50%, #9a7209 100%)',
                    boxShadow: 'none',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </motion.button>
              </div>

              <p className="text-sm text-gray-400 font-mono tracking-wider">CLICK TO BEGIN RESEARCH</p>
            </motion.div>
          ) : (
            <motion.div
              key="searchbar"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: focused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(30px)',
                  border: focused ? '1.5px solid rgba(212,168,83,0.5)' : '1.5px solid rgba(212,168,83,0.2)',
                  boxShadow: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="flex items-center px-5 py-4 gap-4">
                  <svg className="text-gold-400 flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Ask Minerva anything..."
                    className="flex-1 bg-transparent outline-none text-obsidian-900 text-lg placeholder-gray-300 font-sans"
                  />
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!query.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 rounded-xl gold-gradient text-white text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Research
                  </motion.button>
                </div>
              </div>

              {/* Example queries */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 flex flex-wrap gap-2 justify-center"
              >
                {EXAMPLE_QUERIES.map((example, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setQuery(example); setTimeout(handleSubmit, 100) }}
                    className="px-3 py-1.5 rounded-full text-xs text-gray-500 hover:text-gold-600 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(212,168,83,0.15)' }}
                  >
                    {example}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="flex items-center gap-8 mt-20 text-center"
      >
        {[
          { value: '4', label: 'Search Tools' },
          { value: 'AI', label: 'Agent Routing' },
          { value: '∞', label: 'Sources Available' },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="font-display text-2xl font-semibold text-gold-gradient">{stat.value}</span>
            <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">{stat.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}