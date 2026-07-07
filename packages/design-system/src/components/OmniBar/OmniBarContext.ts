import { create } from 'zustand';
import { OmniMessage } from '@soustools/api-types';

export interface OmniBarState {
  contextPayload: Record<string, any>;
  setContextPayload: (payload: Record<string, any>) => void;
  
  chatHistory: OmniMessage[];
  setChatHistory: (history: OmniMessage[]) => void;
  addMessage: (message: OmniMessage) => void;
  
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

export const useOmnibarContext = create<OmniBarState>((set) => ({
  contextPayload: {},
  setContextPayload: (payload) => set({ contextPayload: payload }),
  
  chatHistory: [],
  setChatHistory: (history) => set({ chatHistory: history }),
  addMessage: (message) => set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  
  isProcessing: false,
  setIsProcessing: (isProcessing) => set({ isProcessing }),
}));
