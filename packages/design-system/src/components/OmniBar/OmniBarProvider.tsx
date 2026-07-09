"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { OmniBarPresentation } from "./OmniBarPresentation";
import { useOmnibarContext } from "./OmniBarContext";
import { createBrowserClient } from "@soustools/supabase";
import { io, type Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { type OmniMessage } from "@soustools/api-types";

export function OmniBarProvider({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const isFocusPage = pathname === "/home";
  
  const { 
    contextPayload, 
    chatHistory, 
    isOpen, 
    isProcessing, 
    setIsOpen, 
    setIsProcessing, 
    addMessage,
    setChatHistory,
    setIsDragging,
    setExecuteBackgroundCommand,
    markLoadingComplete
  } = useOmnibarContext();

  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    let newSocket: Socket | null = null;
    const initSocket = async () => {
      try {
        const supabase = createBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (!session?.access_token) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001";
        const socketUrl = apiUrl.startsWith("http") ? apiUrl : window.location.origin;

        newSocket = io(socketUrl + "/commands", {
          auth: { token: session.access_token },
          transports: ["websocket"],
        });

        // Listen for standard chat stream
        newSocket.on("chat_message", (message: OmniMessage) => {
          addMessage(message);
          if (message.role === 'model') {
            setIsProcessing(false);
            markLoadingComplete();
          }
        });

        // Listen for explicit errors
        newSocket.on("command_status", (data: any) => {
          if (data.state === "error") {
            setErrorMessage(data.message);
            setIsProcessing(false);
            setIsListening(false);
            markLoadingComplete();
          }
        });

        setSocket(newSocket);
      } catch (err) {
        console.error("Failed to initialize WebSocket:", err);
      }
    };

    initSocket();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [addMessage, setIsProcessing, markLoadingComplete]);

  // Execute Background Command
  useEffect(() => {
    const executeBackgroundCommand = (text: string) => {
      if (!text.trim()) return;
      setIsProcessing(true);
      const newUserMessage: OmniMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date()
      };
      const updatedHistory = [...chatHistory, newUserMessage];
      setChatHistory(updatedHistory);

      try {
        if (!socket || !socket.connected) {
          socket?.connect();
        }
        socket?.emit("executeCommand", {
          chatHistory: updatedHistory,
          source: "omnibar",
          path: pathname,
          context: contextPayload,
        });
      } catch (error: any) {
        console.error("Failed to emit background command:", error);
        setIsProcessing(false);
      }
    };
    setExecuteBackgroundCommand(executeBackgroundCommand);
  }, [socket, chatHistory, pathname, contextPayload, setExecuteBackgroundCommand, setChatHistory, setIsProcessing]);

  const dragCounter = useRef(0);

  // Global Drag Listeners
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes("Files")) {
        dragCounter.current++;
        if (dragCounter.current === 1) {
          setIsDragging(true);
          setIsOpen(true);
        }
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = () => {
      // Don't prevent default here for the drop, let OmniInputPill handle it if dropped there, 
      // but we do need to reset the drag state. Wait, if we preventDefault, child might not get it?
      // Actually child event runs first if bubbling, but window captures it at the end.
      dragCounter.current = 0;
      setIsDragging(false);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [setIsDragging, setIsOpen]);

  // Sync expanded state if user navigates to/from /home
  useEffect(() => {
    if (isFocusPage) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isFocusPage, setIsOpen]);

  const handleToggle = () => {
    if (!isFocusPage) {
      setIsOpen(!isOpen);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (isProcessing) return;

      if (inputText.trim()) {
        const textToSubmit = inputText.trim();
        setInputText("");
        setIsProcessing(true);
        setErrorMessage(null);
        setIsOpen(true);

        const newUserMessage: OmniMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content: textToSubmit,
          timestamp: new Date()
        };

        const updatedHistory = [...chatHistory, newUserMessage];
        setChatHistory(updatedHistory);

        try {
          if (!socket || !socket.connected) {
            setErrorMessage("WebSocket not connected. Attempting reconnect...");
            socket?.connect();
            setIsProcessing(false);
            return;
          }

          socket.emit("executeCommand", {
            chatHistory: updatedHistory,
            source: "omnibar",
            path: pathname,
            context: contextPayload,
          });
        } catch (error: any) {
          console.error("Failed to emit command:", error);
          setErrorMessage(error.message || "Network error occurred.");
          setIsProcessing(false);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (!isFocusPage) setIsOpen(false);
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
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
      if (e.key === "Escape" && isOpen && !isFocusPage) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, isFocusPage, setIsOpen]);

  return (
    <>
      {/* Global Top Progress Bar */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ width: "0%", opacity: 1 }}
            animate={{ width: "80%", opacity: 1 }}
            exit={{ width: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-[2px] bg-[var(--color-primary)] z-[100000]"
            style={{
              boxShadow: "0 0 10px var(--color-primary), 0 0 20px var(--color-primary)",
            }}
          />
        )}
      </AnimatePresence>

      {children}
      <OmniBarPresentation
        isOpen={isOpen}
        isListening={isListening}
        isProcessing={isProcessing}
        chatHistory={chatHistory}
        errorMessage={errorMessage}
        inputText={inputText}
        isFocusPage={isFocusPage}
        onToggle={handleToggle}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onMicClick={handleMicClick}
      />
    </>
  );
}
