import { create } from 'zustand';
import { type OmniMessage } from '@soustools/api-types';

export interface StagedFile {
  id: string;
  url: string | null;
  status: 'uploading' | 'complete' | 'error';
  file?: File;
}

export interface OmniBarState {
  contextPayload: Record<string, unknown>;
  setContextPayload: (payload: Record<string, unknown>) => void;
  
  chatHistory: OmniMessage[];
  setChatHistory: (history: OmniMessage[]) => void;
  addMessage: (message: OmniMessage) => void;
  markLoadingComplete: () => void;
  
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;

  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;

  stagedFiles: StagedFile[];
  setStagedFiles: (files: StagedFile[] | ((prev: StagedFile[]) => StagedFile[])) => void;

  executeBackgroundCommand: (text: string) => void;
  setExecuteBackgroundCommand: (fn: (text: string) => void) => void;
}

export const useOmnibarContext = create<OmniBarState>((set) => ({
  contextPayload: {},
  setContextPayload: (payload) => set({ contextPayload: payload }),
  
  chatHistory: [],
  setChatHistory: (history) => set({ chatHistory: history }),
  addMessage: (message) => set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  markLoadingComplete: () => set((state) => ({
    chatHistory: state.chatHistory.map(msg => 
      msg.role === 'agent_step' ? { ...msg, isLoading: false } : msg
    )
  })),
  
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  
  isProcessing: false,
  setIsProcessing: (isProcessing) => set({ isProcessing }),

  isDragging: false,
  setIsDragging: (isDragging) => set({ isDragging }),

  stagedFiles: [],
  setStagedFiles: (update) => set((state) => ({ 
    stagedFiles: typeof update === 'function' ? update(state.stagedFiles) : update 
  })),

  executeBackgroundCommand: () => {},
  setExecuteBackgroundCommand: (fn) => set({ executeBackgroundCommand: fn }),
}));
