import { create } from 'zustand';

export interface OmniBarState {
  contextPayload: Record<string, any>;
  setContextPayload: (payload: Record<string, any>) => void;
}

export const useOmnibarContext = create<OmniBarState>((set) => ({
  contextPayload: {},
  setContextPayload: (payload) => set({ contextPayload: payload }),
}));
