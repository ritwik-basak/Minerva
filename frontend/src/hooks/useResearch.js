import { useState, useCallback } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export const AGENT_STEPS = [
  { id: 'supervisor', label: 'Supervisor', desc: 'Selecting search strategy', icon: '🧠' },
  { id: 'search', label: 'Search Agent', desc: 'Retrieving sources', icon: '🔍' },
  { id: 'reranker', label: 'Reranker', desc: 'Scoring relevance', icon: '📊' },
  { id: 'quality', label: 'Quality Check', desc: 'Verifying results', icon: '✅' },
  { id: 'summarizer', label: 'Summarizer', desc: 'Synthesizing findings', icon: '📝' },
  { id: 'writer', label: 'Writer', desc: 'Composing report', icon: '✍️' },
]

export function useResearch() {
  const [state, setState] = useState({
    status: 'idle',
    query: '',
    result: null,
    activeStep: 0,
    followupLoading: false,
  })

  const [conversationHistory, setConversationHistory] = useState([])

  const submit = useCallback(async (query) => {
    setState({ status: 'loading', query, result: null, activeStep: 0, followupLoading: false })
    setConversationHistory([])

    let apiDone = false
    let stepsDone = false
    let apiResult = null

    const tryFinish = () => {
      if (apiDone && stepsDone && apiResult) {
        setState(prev => ({
          ...prev,
          status: 'success',
          result: apiResult,
          activeStep: AGENT_STEPS.length,
        }))
        setConversationHistory([
          { role: 'user', content: query },
          { role: 'assistant', content: apiResult.final_report }
        ])
      }
    }

    // Simulate steps with timing
    let step = 0
    const interval = setInterval(() => {
      step++
      setState(prev => ({ ...prev, activeStep: step }))
      if (step >= AGENT_STEPS.length) {
        clearInterval(interval)
        stepsDone = true
        tryFinish()
      }
    }, 3800)

    // Call API
    try {
      const response = await axios.post(`${API_BASE}/research`, {
        query,
        conversation_history: []
      })
      apiResult = response.data
      apiDone = true
      tryFinish()
    } catch (err) {
      clearInterval(interval)
      setState(prev => ({ ...prev, status: 'error' }))
    }
  }, [])

  const submitFollowup = useCallback(async (question) => {
    setState(prev => ({ ...prev, followupLoading: true }))

    try {
      const detectRes = await axios.post(`${API_BASE}/detect-topic`, {
        question,
        conversation_history: conversationHistory
      })

      if (detectRes.data.is_new_topic) {
        await submit(question)
        return
      }

      const response = await axios.post(`${API_BASE}/followup`, {
        question,
        conversation_history: conversationHistory
      })

      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: question },
        { role: 'assistant', content: response.data.answer }
      ])
      setState(prev => ({ ...prev, followupLoading: false }))

    } catch (err) {
      setState(prev => ({ ...prev, followupLoading: false }))
    }
  }, [conversationHistory, submit])

  const reset = useCallback(() => {
    setState({ status: 'idle', query: '', result: null, activeStep: 0, followupLoading: false })
    setConversationHistory([])
  }, [])

  return { state, conversationHistory, submit, submitFollowup, reset }
}
