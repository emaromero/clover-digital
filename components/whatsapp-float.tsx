"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "./language-provider"

export default function WhatsAppFloat() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { language, t } = useLanguage()

  const whatsappUrl = "https://wa.me/5491164473603"

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 bg-white dark:bg-[#001219] p-4 rounded-lg shadow-lg mb-2 w-64"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-[#0A9396]">{t("whatsapp-title")}</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{t("whatsapp-message")}</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#25D366] hover:bg-[#128C7E] text-white text-center py-2 px-4 rounded-md transition-colors"
            >
              {t("whatsapp-button")}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="font-medium">{t("whatsapp-float")}</span>
      </button>
    </div>
  )
}
