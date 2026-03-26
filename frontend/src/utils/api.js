const API_BASE = '/api'

export const checkTopic = async (query, conversationHistory) => {
  const res = await fetch(`${API_BASE}/check-topic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, conversation_history: conversationHistory })
  })
  return res.json()
}

export const getFollowUp = async (question, conversationHistory) => {
  const res = await fetch(`${API_BASE}/followup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, conversation_history: conversationHistory })
  })
  return res.json()
}

export const streamResearch = (query, onEvent) => {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE}/research/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    }).then(response => {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      const read = () => {
        reader.read().then(({ done, value }) => {
          if (done) { resolve(); return }
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                onEvent(data)
                if (data.type === 'done') resolve()
              } catch (e) {}
            }
          })
          read()
        }).catch(reject)
      }
      read()
    }).catch(reject)
  })
}
