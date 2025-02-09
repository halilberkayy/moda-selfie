import { create } from 'zustand'
import { APP_STEPS } from './constants'

interface AppState {
  step: (typeof APP_STEPS)[keyof typeof APP_STEPS]
  setStep: (step: (typeof APP_STEPS)[keyof typeof APP_STEPS]) => void
}

const useStore = create<AppState>(set => ({
  step: APP_STEPS.WELCOME,
  setStep: step => set({ step })
}))

export default useStore
