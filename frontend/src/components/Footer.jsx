import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="py-12 px-8 text-center"
    >
      <div className="max-w-6xl mx-auto">
        <div className="h-px w-32 mx-auto mb-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.3), transparent)' }} />
        <p className="font-display italic text-gray-300 text-sm">
          Minerva — Agentic Research Intelligence
        </p>
        <p className="text-xs text-gray-300 font-mono mt-2 tracking-wider">
          Powered by LangGraph · Gemini · HuggingFace
        </p>
      </div>
    </motion.footer>
  )
}
