import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import HeroSearch from './components/HeroSearch'
import AgentPipeline from './components/AgentPipeline'
import ResearchReport from './components/ResearchReport'
import Footer from './components/Footer'
import BackgroundOrbs from './components/BackgroundOrbs'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function App() {
  const [phase, setPhase] = useState('idle')
  const [query, setQuery] = useState('')
  const [agentStates, setAgentStates] = useState({})
  const [report, setReport] = useState(null)
  const [sources, setSources] = useState([])
  const [toolsUsed, setToolsUsed] = useState([])
  const [retries, setRetries] = useState(0)
  const [conversationHistory, setConversationHistory] = useState([])
  const [loadingMessage, setLoadingMessage] = useState('Awakening intelligence...')

  const loadingMessages = [
    'Awakening intelligence...',
    'Selecting research tools...',
    'Scouring the web...',
    'Ranking by relevance...',
    'Synthesizing knowledge...',
    'Crafting your report...',
  ]

  const updateAgent = (agent, status, message) => {
    setAgentStates(prev => ({ ...prev, [agent]: { status, message } }))
  }

  const handleResearch = useCallback(async (userQuery) => {
    setQuery(userQuery)
    setPhase('loading')
    setAgentStates({})
    setReport(null)
    setSources([])
    setLoadingMessage('Awakening intelligence...')

    let msgIndex = 0
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length
      setLoadingMessage(loadingMessages[msgIndex])
    }, 4000)

    try {
      // Check follow-up vs new topic
      if (conversationHistory.length > 0) {
        const topicCheck = await axios.post(`${API_BASE}/check-topic`, {
          query: userQuery,
          conversation_history: conversationHistory
        })

        if (!topicCheck.data.is_new_topic) {
          clearInterval(msgInterval)
          const followupRes = await axios.post(`${API_BASE}/followup`, {
            question: userQuery,
            conversation_history: conversationHistory
          })
          setReport(followupRes.data.answer)
          setPhase('complete')
          setConversationHistory(prev => [
            ...prev,
            { role: 'user', content: userQuery },
            { role: 'assistant', content: followupRes.data.answer }
          ])
          return
        }
      }

      // Full pipeline — POST with SSE streaming
      const response = await fetch(`${API_BASE}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, conversation_history: conversationHistory })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'agent') {
                updateAgent(data.agent, data.status, data.message)
              } else if (data.type === 'complete') {
                clearInterval(msgInterval)
                setReport(data.report)
                setSources(data.sources || [])
                setToolsUsed(data.tools_used || [])
                setRetries(data.retries || 0)
                setPhase('complete')
                setConversationHistory(prev => [
                  ...prev,
                  { role: 'user', content: userQuery },
                  { role: 'assistant', content: data.report }
                ])
              } else if (data.type === 'error') {
                clearInterval(msgInterval)
                console.error('Pipeline error:', data.message)
                alert('Research failed: ' + data.message)
                setPhase('idle')
              }
            } catch (e) {
              // skip malformed JSON
            }
          }
        }
      }
    } catch (err) {
      clearInterval(msgInterval)
      console.error('Research error:', err)
      setPhase('idle')
    }
  }, [conversationHistory])

  const handleReset = () => {
    setPhase('idle')
    setQuery('')
    setReport(null)
    setSources([])
    setAgentStates({})
    setConversationHistory([])
  }

  return (
    <div className="min-h-screen grain-overlay relative">
      <BackgroundOrbs />
      <div className="relative z-10">
        <Navbar onReset={handleReset} />
        <main className="min-h-screen">
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                <HeroSearch onSearch={handleResearch} />
              </motion.div>
            )}

            {phase === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen flex flex-col items-center justify-center px-6 py-24 w-full"
              >
                <motion.div className="text-center mb-16">
                  <div className="font-display text-2xl text-obsidian-900 mb-3 italic">
                    "{query}"
                  </div>
                  <motion.p
                    key={loadingMessage}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gold-500 font-mono text-sm tracking-widest uppercase typing-cursor"
                  >
                    {loadingMessage}
                  </motion.p>
                </motion.div>
                <AgentPipeline agentStates={agentStates} />
              </motion.div>
            )}

            {phase === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="min-h-screen px-4 py-24"
              >
                <ResearchReport
                  query={query}
                  report={report}
                  sources={sources}
                  toolsUsed={toolsUsed}
                  retries={retries}
                  onNewSearch={handleReset}
                  onFollowUp={handleResearch}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        {phase === 'idle' && <Footer />}
      </div>
    </div>
  )
}