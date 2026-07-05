"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { OmniBarPresentation } from "./OmniBarPresentation";
import { useOmnibarContext } from "./OmniBarContext";

export function OmniBarContainer() {
  const pathname = usePathname();
  const isFocusPage = pathname === "/home";
  const { contextPayload } = useOmnibarContext();

  // If we are on the OS focus page, it should always be expanded.
  // Otherwise, it can be toggled via the circular button in the app bar.
  const [isExpanded, setIsExpanded] = useState(isFocusPage);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [volume, setVolume] = useState(0);

  // Sync expanded state if user navigates to/from /os
  useEffect(() => {
    if (isFocusPage) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [isFocusPage]);

  // Scaffold for Web Audio API to detect volume (for pulsing border)
  useEffect(() => {
    let animationFrameId: number;

    if (isListening) {
      // Dummy volume pulse for visual scaffold
      let t = 0;
      const pulse = () => {
        t += 0.05;
        // Simple sine wave mapping to 0-1
        setVolume((Math.sin(t) + 1) / 2);
        animationFrameId = requestAnimationFrame(pulse);
      };
      pulse();
    } else {
      setVolume(0);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isListening]);



  const handleToggle = () => {
    // If we are on the OS page, clicking outside shouldn't collapse it
    // because it's the main interface.
    if (!isFocusPage) {
      setIsExpanded((prev) => !prev);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    
    // Auto-listen trigger scaffold (if user deletes all text)
    if (e.target.value === "") {
      setIsListening(true);
    } else {
      setIsListening(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim()) {
        console.log("Submitting:", inputText);
        
        try {
          await fetch('/api/commands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              command: inputText.trim(),
              source: 'omnibar',
              path: pathname,
              context: contextPayload,
            })
          });
        } catch (error) {
          console.error("Failed to submit command:", error);
        }

        setInputText("");
        setIsListening(false);
        if (!isFocusPage) setIsExpanded(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (!isFocusPage) setIsExpanded(false);
    }
  };

  const handleMicClick = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setInputText(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  // Global escape listener for when textarea is not focused
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded && !isFocusPage) {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isExpanded, isFocusPage]);

  return (
    <OmniBarPresentation
      isExpanded={isExpanded}
      isListening={isListening}
      inputText={inputText}
      volume={volume}
      isFocusPage={isFocusPage}
      onToggle={handleToggle}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onMicClick={handleMicClick}
    />
  );
}
