"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-[#B8D8D8] dark:bg-[#004E64] z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="relative w-24 h-24 md:w-32 md:h-32"
          >
            <Image
              src="https://i.postimg.cc/pLSPM0KB/logo-Clover-Digital.png"
              alt="Clover Digital"
              width={128}
              height={128}
              className="object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
