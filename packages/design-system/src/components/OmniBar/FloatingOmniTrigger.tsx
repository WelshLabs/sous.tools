"use client";


import { motion } from "framer-motion";
import { OmniBar } from "./index";

export function FloatingOmniTrigger() {
  return (
    <motion.div 
      className="fixed bottom-6 right-6 z-50 rounded-full"
      animate={{ 
        scale: [1, 1.05, 1],
        boxShadow: [
          "0px 0px 0px rgba(6,182,212,0)", 
          "0px 0px 20px rgba(6,182,212,0.6)", 
          "0px 0px 0px rgba(6,182,212,0)"
        ]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <OmniBar />
    </motion.div>
  );
}
