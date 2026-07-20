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

  inputText: string;
  setInputText: (text: string) => void;

  showGoogleDriveBrowser: boolean;
  setShowGoogleDriveBrowser: (show: boolean) => void;
  stagedFiles: StagedFile[];
  setStagedFiles: (files: StagedFile[] | ((prev: StagedFile[]) => StagedFile[])) => void;

  isGoogleDriveConnected: boolean;
  setIsGoogleDriveConnected: (connected: boolean) => void;

  executeBackgroundCommand: (text: string) => void;
  setExecuteBackgroundCommand: (fn: (text: string) => void) => void;

  apiClient: typeof fetch;
  setApiClient: (fn: typeof fetch) => void;
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

  inputText: '',
  setInputText: (inputText) => set({ inputText }),

  showGoogleDriveBrowser: false,
  setShowGoogleDriveBrowser: (showGoogleDriveBrowser) => set({ showGoogleDriveBrowser }),
  stagedFiles: [],
  setStagedFiles: (update) => set((state) => ({ 
    stagedFiles: typeof update === 'function' ? update(state.stagedFiles) : update 
  })),

  isGoogleDriveConnected: false,
  setIsGoogleDriveConnected: (isGoogleDriveConnected) => set({ isGoogleDriveConnected }),

  executeBackgroundCommand: () => {},
  setExecuteBackgroundCommand: (fn) => set({ executeBackgroundCommand: fn }),

  apiClient: typeof window !== 'undefined' ? window.fetch.bind(window) : fetch,
  setApiClient: (fn) => set({ apiClient: fn }),
}));
