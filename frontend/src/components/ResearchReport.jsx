import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

const TOOL_LABELS = {
  web_search:       { label: 'Web',      color: '#3b82f6' },
  news_search:      { label: 'News',     color: '#10b981' },
  academic_search:  { label: 'Academic', color: '#8b5cf6' },
  youtube_search:   { label: 'YouTube',  color: '#ef4444' },
  wikipedia_search: { label: 'Wikipedia',color: '#f59e0b' },
}

export default function ResearchReport({ query, report, sources, toolsUsed, retries, onNewSearch, onFollowUp }) {
  const [followUpQuery, setFollowUpQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const reportRef = useRef(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFollowUp = () => {
    if (followUpQuery.trim()) {
      onFollowUp(followUpQuery.trim())
      setFollowUpQuery('')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6 gap-4"
      >
        <div className="flex-1">
          <p className="text-xs font-mono text-gold-500 tracking-widest uppercase mb-2">Research Complete</p>
          <h2 className="font-display text-2xl md:text-4xl font-semibold text-obsidian-900 italic">"{query}"</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewSearch}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gold-600 transition-colors glass flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
          </svg>
          New Research
        </motion.button>
      </motion.div>

      {/* Meta badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-2 mb-6"
      >
        {toolsUsed.map(tool => (
          <span
            key={tool}
            className="px-3 py-1 rounded-full text-xs font-mono font-medium"
            style={{
              background: `${TOOL_LABELS[tool]?.color || '#9ca3af'}15`,
              color: TOOL_LABELS[tool]?.color || '#9ca3af',
              border: `1px solid ${TOOL_LABELS[tool]?.color || '#9ca3af'}30`
            }}
          >
            {TOOL_LABELS[tool]?.label || tool}
          </span>
        ))}
        {retries > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-mono text-amber-600 bg-amber-50 border border-amber-100">
            {retries} retr{retries === 1 ? 'y' : 'ies'}
          </span>
        )}
      </motion.div>

      {/* Main layout — wider report, narrower sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Report — takes up most space */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 min-w-0"
        >
          <div className="glass-strong rounded-2xl overflow-hidden h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gold-300/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold-400"></div>
                <span className="text-xs font-mono text-gray-400 tracking-wider">RESEARCH REPORT</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gold-600 transition-colors hover:bg-gold-50"
              >
                {copied ? (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
                ) : (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</>
                )}
              </motion.button>
            </div>

            {/* Report content — full height, no max-height restriction */}
            <div ref={reportRef} className="p-8 md:p-10 prose-minerva">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </div>
        </motion.div>

        {/* Sidebar — fixed width, sticks to right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:w-72 xl:w-80 flex flex-col gap-4 flex-shrink-0"
        >
          {/* Sources */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-mono text-gold-500 tracking-widest uppercase mb-4">Sources</p>
            <div className="flex flex-col gap-4">
              {sources.map((source, i) => (
                <motion.a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ x: 2 }}
                  className="flex items-start gap-3 group"
                >
                  <span className="text-xs font-mono text-gold-400 mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-obsidian-900 group-hover:text-gold-600 transition-colors leading-snug line-clamp-2">
                      {source.title || 'Untitled Source'}
                    </p>
                    <span className={`text-xs font-mono mt-1 inline-block ${source.score >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {source.score >= 0 ? '↑' : '↓'} {Math.abs(source.score).toFixed(2)}
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Follow-up */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-mono text-gold-500 tracking-widest uppercase mb-4">Ask a follow-up</p>
            <div className="flex flex-col gap-3">
              <textarea
                value={followUpQuery}
                onChange={(e) => setFollowUpQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFollowUp() } }}
                placeholder="Ask anything about this topic..."
                rows={3}
                className="w-full bg-white/60 rounded-xl px-4 py-3 text-sm text-obsidian-900 placeholder-gray-300 outline-none resize-none"
                style={{ border: '1px solid rgba(212,168,83,0.2)' }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFollowUp}
                disabled={!followUpQuery.trim()}
                className="w-full py-2.5 rounded-xl gold-gradient text-white text-sm font-medium disabled:opacity-30"
              >
                Ask Minerva
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}