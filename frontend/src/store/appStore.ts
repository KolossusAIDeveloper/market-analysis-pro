import { create } from 'zustand'

interface AppStore {
  selectedSymbol: string
  selectedInterval: string
  activeTab: string
  setSymbol: (s: string) => void
  setInterval: (i: string) => void
  setTab: (t: string) => void
}

export const useAppStore = create<AppStore>((set) => ({
  selectedSymbol: 'NIFTY50',
  selectedInterval: '5m',
  activeTab: 'dashboard',
  setSymbol: (selectedSymbol) => set({ selectedSymbol }),
  setInterval: (selectedInterval) => set({ selectedInterval }),
  setTab: (activeTab) => set({ activeTab }),
}))
