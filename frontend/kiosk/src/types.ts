import { RefObject } from 'react'
import Webcam from 'react-webcam'

export interface StoreState {
  step: number
  setStep: (step: number) => void
}

export interface CameraHookState {
  isLoading: boolean
  error: string | null
  photo: string | null
  takePhoto: () => Promise<string | null>
  resetPhoto: () => void
  webcamRef: RefObject<Webcam>
  hasCamera: boolean
}

export interface VirtualTryOnHookState {
  isLoading: boolean
  error: string | null
  resultImage: string | null
  tryOnClothing: (photoData: string, clothingType?: string) => Promise<void>
  resetResult: () => void
}
