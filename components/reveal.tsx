"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 20,
}: RevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0.96,
              y,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.05,
      }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}