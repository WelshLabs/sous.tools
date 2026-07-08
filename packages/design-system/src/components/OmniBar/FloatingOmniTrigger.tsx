"use client";


import { motion } from "framer-motion";
import { OmniBar } from "./index";

export function FloatingOmniTrigger() {
  return (
    <motion.div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full"
      animate={{ 
        scale: [1.0, 1.02, 1.0],
        boxShadow: [
          '0 0 10px rgba(0,255,255,0.1)',
          '0 0 20px rgba(0,255,255,0.3)',
          '0 0 10px rgba(0,255,255,0.1)'
        ]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <OmniBar />
    </motion.div>
  );
}
