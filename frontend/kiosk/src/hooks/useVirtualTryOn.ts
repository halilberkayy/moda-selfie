import { useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'

interface ApiResponse {
  result_image: string
}

interface UseVirtualTryOnReturn {
  isLoading: boolean
  error: string | null
  resultImage: string | null
  tryOnClothing: (photo: string) => Promise<void>
  resetResult: () => void
}

export const useVirtualTryOn = (): UseVirtualTryOnReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)

  const tryOnClothing = async (photo: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Convert base64 to blob
      const base64Response = await fetch(photo)
      const blob = await base64Response.blob()

      const formData = new FormData()
      formData.append('photo', blob, 'photo.jpg')

      const { data } = await api.post<ApiResponse>('/virtual-tryon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (!data.result_image) {
        throw new Error(ERROR_MESSAGES.VIRTUAL_TRYON_ERROR)
      }

      setResultImage(data.result_image)
      toast.success(SUCCESS_MESSAGES.VIRTUAL_TRYON_COMPLETE)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.VIRTUAL_TRYON_ERROR
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resetResult = () => {
    setResultImage(null)
    setError(null)
  }

  return {
    isLoading,
    error,
    resultImage,
    tryOnClothing,
    resetResult
  }
}
