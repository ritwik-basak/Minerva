import { motion } from 'framer-motion'

export default function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Main ambient orbs */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(184,134,11,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }}
      />
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,168,83,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,168,83,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,168,83,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
    </div>
  )
}
