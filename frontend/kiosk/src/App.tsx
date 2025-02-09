import React from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { FaCamera, FaTshirt, FaRedo, FaCheck, FaArrowRight } from 'react-icons/fa'
import Skeleton from 'react-loading-skeleton'
import Webcam from 'react-webcam'
import 'react-toastify/dist/ReactToastify.css'
import 'react-loading-skeleton/dist/skeleton.css'

import useStore from './store'
import { useCamera } from './hooks/useCamera'
import { useVirtualTryOn } from './hooks/useVirtualTryOn'
import ErrorBoundary from './components/ErrorBoundary'
import { APP_STEPS, ERROR_MESSAGES, SUCCESS_MESSAGES, ErrorMessageKey } from './constants'

// --- İlerleme Adımları için Tip Tanımı ---
interface ProgressStep {
  step: number
  label: string
  icon: React.ReactNode
}

const progressSteps: ProgressStep[] = [
  { step: APP_STEPS.WELCOME, label: 'KVKK Onayı', icon: <FaCheck className="w-5 h-5" /> },
  { step: APP_STEPS.CAPTURE, label: 'Fotoğraf Çekimi', icon: <FaCamera className="w-5 h-5" /> },
  { step: APP_STEPS.TRYON, label: 'Kıyafet Deneme', icon: <FaTshirt className="w-5 h-5" /> }
]

// --- İlerleme Göstergesi Bileşeni ---
const ProgressIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  return (
    <div className="mb-8 flex items-center justify-center gap-4">
      {progressSteps.map((item, idx) => (
        <React.Fragment key={item.step}>
          <div
            className={`flex flex-col items-center ${currentStep >= item.step ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                currentStep >= item.step ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {item.icon}
            </div>
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {idx < progressSteps.length - 1 && (
            <div
              className={`h-1 w-16 rounded transition-all ${currentStep > item.step ? 'bg-indigo-600' : 'bg-gray-200'}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// --- Ana Bileşen: App ---
const App: React.FC = () => {
  const { step, setStep } = useStore()
  const { isLoading: cameraLoading, error: cameraError, photo, takePhoto, resetPhoto, webcamRef } = useCamera()

  const { isLoading: tryOnLoading, error: tryOnError, resultImage, tryOnClothing, resetResult } = useVirtualTryOn()

  // Global loading state
  const isLoading = cameraLoading || tryOnLoading

  // Disable all interactions while loading
  const handleInteraction = (callback: () => void) => {
    if (isLoading) return
    callback()
  }

  // Hata durumlarını kontrol et ve toast göster
  React.useEffect(() => {
    if (cameraError) {
      const errorKey = Object.keys(ERROR_MESSAGES).includes(cameraError) 
        ? (cameraError as ErrorMessageKey)
        : 'UNEXPECTED_ERROR' as ErrorMessageKey
      toast.error(ERROR_MESSAGES[errorKey])
      console.error('Camera error:', cameraError)
    }
    if (tryOnError) {
      const errorKey = Object.keys(ERROR_MESSAGES).includes(tryOnError)
        ? (tryOnError as ErrorMessageKey)
        : 'UNEXPECTED_ERROR' as ErrorMessageKey
      toast.error(ERROR_MESSAGES[errorKey])
      console.error('Try-on error:', tryOnError)
    }
  }, [cameraError, tryOnError])

  // Global error handler
  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Global error:', error)
      toast.error(ERROR_MESSAGES.UNEXPECTED_ERROR)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Fotoğraf çekme işlemi
  const handleCapture = async () => {
    try {
      const photoData = await takePhoto()
      if (photoData) {
        toast.success(SUCCESS_MESSAGES.PHOTO_CAPTURED)
        setStep(APP_STEPS.TRYON)
      } else {
        toast.error(ERROR_MESSAGES.PHOTO_CAPTURE)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.CAMERA_ERROR
      toast.error(errorMessage)
      console.error('Camera error:', error)
    }
  }

  // Virtual try-on işlemi
  const handleTryOn = async () => {
    try {
      if (!photo) {
        toast.error(ERROR_MESSAGES.PHOTO_CAPTURE)
        return
      }

      if (tryOnLoading) {
        return
      }

      await tryOnClothing(photo)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.VIRTUAL_TRYON_ERROR
      toast.error(errorMessage)
      console.error('Virtual try-on error:', error)
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <ProgressIndicator currentStep={step} />
          <div className="max-w-2xl mx-auto">
            {/* Welcome Step */}
            {step === APP_STEPS.WELCOME && (
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-6">Sanal Giyinme Kabinine Hoş Geldiniz!</h1>
                <p className="text-gray-600 mb-8">Devam etmek için KVKK metnini okuyup onaylamanız gerekmektedir.</p>
                <button
                  onClick={() => handleInteraction(() => setStep(APP_STEPS.CAPTURE))}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  KVKK&apos;yı Okudum ve Onaylıyorum
                </button>
              </div>
            )}

            {/* Capture Step */}
            {step === APP_STEPS.CAPTURE && (
              <div className="space-y-6">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                  {!photo ? (
                    <Webcam 
                      ref={webcamRef}
                      screenshotFormat="image/jpeg" 
                      className="w-full h-full object-cover"
                      videoConstraints={{
                        facingMode: 'user'
                      }}
                    />
                  ) : (
                    <img src={photo} alt="Çekilen fotoğraf" className="w-full h-full object-cover" />
                  )}
                  {cameraLoading && <Skeleton data-testid="loading-skeleton" />}
                </div>

                <div className="flex justify-center gap-4">
                  {!photo ? (
                    <button
                      onClick={() => handleInteraction(handleCapture)}
                      disabled={isLoading}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {cameraLoading ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          İşleniyor...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FaCamera className="mr-2" />
                          Fotoğraf Çek
                        </span>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          resetPhoto()
                          resetResult()
                        }}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <span className="flex items-center">
                          <FaRedo className="mr-2" />
                          Yeniden Çek
                        </span>
                      </button>
                      <button
                        onClick={() => setStep(APP_STEPS.TRYON)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <span className="flex items-center">
                          <FaArrowRight className="mr-2" />
                          Devam Et
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Try On Step */}
            {step === APP_STEPS.TRYON && photo && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <img src={photo} alt="Orijinal fotoğraf" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    {resultImage ? (
                      <img src={resultImage} alt="Sanal giyinme sonucu" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {tryOnLoading ? (
                          <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                            <p>İşleniyor...</p>
                          </div>
                        ) : (
                          <div className="text-white text-center">
                            <FaTshirt className="w-12 h-12 mx-auto mb-2" />
                            <p>İşte Yeni Görünümünüz!</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      resetResult()
                      setStep(APP_STEPS.CAPTURE)
                    }}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <span className="flex items-center">
                      <FaRedo className="mr-2" />
                      Yeni Fotoğraf
                    </span>
                  </button>
                  <button
                    onClick={handleTryOn}
                    disabled={tryOnLoading}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {tryOnLoading ? (
                      <span className="flex items-center">
                        <FaTshirt className="mr-2" />
                        İşleniyor...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FaTshirt className="mr-2" />
                        Kıyafet Dene
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <ToastContainer position="bottom-right" />
      </div>
    </ErrorBoundary>
  )
}

export default App
