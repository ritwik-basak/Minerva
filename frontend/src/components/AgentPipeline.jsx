import { motion } from 'framer-motion'

const AGENTS = [
  {
    id: 'supervisor',
    label: 'Supervisor',
    desc: 'Selecting tools via Gemini',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12l9-3"/><circle cx="12" cy="12" r="3"/>
      </svg>
    )
  },
  {
    id: 'search',
    label: 'Search',
    desc: 'Scouring the web',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    )
  },
  {
    id: 'reranker',
    label: 'Reranker',
    desc: 'Ranking by relevance',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M7 12h10M11 18h2"/>
      </svg>
    )
  },
  {
    id: 'summarizer',
    label: 'Summarizer',
    desc: 'Synthesizing knowledge',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    )
  },
  {
    id: 'writer',
    label: 'Writer',
    desc: 'Crafting your report',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
      </svg>
    )
  }
]

export default function AgentPipeline({ agentStates }) {
  const getStatus = (agentId) => agentStates[agentId]?.status || 'waiting'
  const getMessage = (agentId) => agentStates[agentId]?.message || ''

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="glass rounded-3xl p-8 md:p-12">
        <p className="text-xs font-mono text-gold-500 tracking-widest uppercase mb-8 text-center">
          Agent Pipeline
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          {AGENTS.map((agent, index) => {
            const status = getStatus(agent.id)
            const isRunning = status === 'running'
            const isDone = status === 'done'
            const isWaiting = status === 'waiting'

            return (
              <div key={agent.id} className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center gap-3 flex-1 md:flex-none"
                >
                  {/* Agent circle */}
                  <motion.div
                    animate={isRunning ? {
                      boxShadow: ['0 0 0 0 rgba(212,168,83,0.4)', '0 0 0 12px rgba(212,168,83,0)', '0 0 0 0 rgba(212,168,83,0)'],
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                    style={{
                      background: isDone
                        ? 'linear-gradient(135deg, #d4a853, #b8860b)'
                        : isRunning
                          ? 'rgba(212,168,83,0.15)'
                          : 'rgba(245,240,232,0.8)',
                      border: isDone
                        ? 'none'
                        : isRunning
                          ? '1.5px solid rgba(212,168,83,0.6)'
                          : '1.5px solid rgba(212,168,83,0.15)',
                      color: isDone ? 'white' : isRunning ? '#b8860b' : '#9ca3af',
                      transition: 'all 0.4s ease'
                    }}
                  >
                    {isRunning && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{ background: 'rgba(212,168,83,0.1)' }}
                      />
                    )}
                    {isDone ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        {agent.icon}
                      </motion.div>
                    ) : (
                      agent.icon
                    )}
                  </motion.div>

                  {/* Label */}
                  <div className="text-center">
                    <p className={`text-xs font-semibold tracking-wide transition-colors ${
                      isDone ? 'text-gold-600' : isRunning ? 'text-obsidian-900' : 'text-gray-300'
                    }`}>
                      {agent.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 max-w-20 text-center leading-tight">
                      {isDone && getMessage(agent.id) ? getMessage(agent.id) : agent.desc}
                    </p>
                  </div>
                </motion.div>

                {/* Connector line */}
                {index < AGENTS.length - 1 && (
                  <div className="hidden md:flex items-center flex-1">
                    <div className="w-full h-px relative overflow-hidden" style={{ background: 'rgba(212,168,83,0.15)' }}>
                      {isDone && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="absolute inset-0 origin-left"
                          style={{ background: 'linear-gradient(90deg, #d4a853, #b8860b)' }}
                        />
                      )}
                    </div>
                    <div className="w-2 h-2 rotate-45 flex-shrink-0 ml-0.5" style={{
                      borderTop: '1.5px solid rgba(212,168,83,0.3)',
                      borderRight: '1.5px solid rgba(212,168,83,0.3)'
                    }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}