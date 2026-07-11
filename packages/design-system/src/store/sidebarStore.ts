import { create } from "zustand";

interface SidebarStore {
  hasSidebar: boolean;
  isExpanded: boolean;
  setHasSidebar: (val: boolean) => void;
  toggleExpanded: () => void;
  setExpanded: (val: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  hasSidebar: false,
  isExpanded: false,
  setHasSidebar: (val) => set({ hasSidebar: val }),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setExpanded: (val) => set({ isExpanded: val }),
}));
