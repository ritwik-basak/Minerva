import { motion } from 'framer-motion'

export default function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,168,76,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(201,168,76,0.05) 0%, transparent 60%), #f9f6f1'
      }} />

      {/* Floating orb 1 */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/5 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      {/* Floating orb 2 */}
      <motion.div
        animate={{ y: [0, 15, 0], x: [0, -15, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.25) 0%, transparent 70%)', filter: 'blur(50px)' }}
      />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(rgba(15,14,12,1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,14,12,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
    </div>
  )
}
