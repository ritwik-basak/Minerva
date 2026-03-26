import { motion } from 'framer-motion'

export default function Navbar({ onReset }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-8 py-5"
      style={{ 
        background: 'rgba(253, 252, 248, 0.7)', 
        backdropFilter: 'blur(4px)', 
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212, 168, 83, 0.12)'
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 group"
        >
          {/* Owl icon - Minerva's symbol */}
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shadow-sm">
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.6 2.8 1.5 3.8L6 13h12l-1.5-2.2C17.4 9.8 18 8.5 18 7c0-2.5-2.5-5-6-5z" fill="white" fillOpacity="0.9"/>
              <circle cx="9.5" cy="7" r="1.5" fill="#b8860b"/>
              <circle cx="14.5" cy="7" r="1.5" fill="#b8860b"/>
              <path d="M9 13l-2 6h10l-2-6H9z" fill="white" fillOpacity="0.8"/>
              <path d="M11 13h2v6h-2z" fill="white" fillOpacity="0.4"/>
            </svg>
          </div>
          <div>
            <span className="font-display font-semibold text-obsidian-900 text-2xl tracking-tight">Minerva</span>
            <span className="text-gold-500 text-xs font-mono ml-2 tracking-widest uppercase hidden sm:inline">Agentic Research Intelligence</span>
          </div>
        </motion.button>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full glass text-xs font-mono text-gold-600 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mr-1 animate-pulse"></span>
            LIVE
          </div>
          <motion.a
            href="https://github.com/ritwik-basak"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-obsidian-800 hover:text-gold-500 transition-colors font-medium"
          >
            GitHub
          </motion.a>
        </div>
      </div>
    </motion.nav>
  )
}
