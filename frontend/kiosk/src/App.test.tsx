import React, { act } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'
import useStore from './store'
import { APP_STEPS } from './constants'

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  },
  ToastContainer: () => null
}))

// Mock react-loading-skeleton
jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-skeleton">Loading...</div>
}))

// Mock the store
jest.mock('./store')
const mockStore = useStore as jest.MockedFunction<typeof useStore>

// Mock the custom hooks
const mockTakePhoto = jest.fn()
const mockResetPhoto = jest.fn()
const mockTryOnClothing = jest.fn()
const mockResetResult = jest.fn()

const mockUseCamera = {
  isLoading: false,
  error: null,
  photo: null,
  takePhoto: mockTakePhoto,
  resetPhoto: mockResetPhoto,
  webcamRef: { current: null }
}

const mockUseVirtualTryOn = {
  isLoading: false,
  error: null,
  resultImage: null,
  tryOnClothing: mockTryOnClothing,
  resetResult: mockResetResult
}

jest.mock('./hooks/useCamera', () => ({
  useCamera: () => mockUseCamera
}))

jest.mock('./hooks/useVirtualTryOn', () => ({
  useVirtualTryOn: () => mockUseVirtualTryOn
}))

describe('App Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Reset store mock
    mockStore.mockImplementation(() => ({
      step: APP_STEPS.WELCOME,
      setStep: jest.fn()
    }))

    // Reset hook states
    Object.assign(mockUseCamera, {
      isLoading: false,
      error: null,
      photo: null,
      takePhoto: mockTakePhoto,
      resetPhoto: mockResetPhoto,
      webcamRef: { current: null }
    })

    Object.assign(mockUseVirtualTryOn, {
      isLoading: false,
      error: null,
      resultImage: null,
      tryOnClothing: mockTryOnClothing,
      resetResult: mockResetResult
    })
  })

  test('renders welcome message on initial load', async () => {
    await act(async () => {
      render(<App />)
    })
    expect(screen.getByText(/Sanal Giyinme Kabinine Hoş Geldiniz/i)).toBeInTheDocument()
  })

  test('shows camera step after clicking start button', async () => {
    const mockSetStep = jest.fn()
    mockStore.mockImplementation(() => ({
      step: APP_STEPS.WELCOME,
      setStep: mockSetStep
    }))

    await act(async () => {
      render(<App />)
    })

    const startButton = screen.getByText(/KVKK'yı Okudum ve Onaylıyorum/i)
    await act(async () => {
      fireEvent.click(startButton)
    })

    expect(mockSetStep).toHaveBeenCalledWith(APP_STEPS.CAPTURE)
  })

  test('shows loading skeleton when camera is loading', async () => {
    mockStore.mockImplementation(() => ({
      step: APP_STEPS.CAPTURE,
      setStep: jest.fn()
    }))

    Object.assign(mockUseCamera, {
      isLoading: true,
      error: null,
      photo: null,
      takePhoto: jest.fn(),
      resetPhoto: jest.fn(),
      webcamRef: { current: null }
    })

    await act(async () => {
      render(<App />)
    })
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  test('shows try-on result when available', async () => {
    mockStore.mockImplementation(() => ({
      step: APP_STEPS.TRYON,
      setStep: jest.fn()
    }))

    const mockResultImage = 'data:image/jpeg;base64,test'
    Object.assign(mockUseVirtualTryOn, {
      isLoading: false,
      error: null,
      resultImage: mockResultImage,
      tryOnClothing: jest.fn(),
      resetResult: jest.fn()
    })

    await act(async () => {
      render(<App />)
    })
    expect(screen.getByText(/İşte Yeni Görünümünüz!/i)).toBeInTheDocument()
  })

  test('shows error toast when camera error occurs', async () => {
    const mockError = 'Kamera hatası'
    import('react-toastify').then(async toast => {
      const mockToast = toast.toast

      mockStore.mockImplementation(() => ({
        step: APP_STEPS.CAPTURE,
        setStep: jest.fn()
      }))

      Object.assign(mockUseCamera, {
        isLoading: false,
        error: mockError,
        photo: null,
        takePhoto: jest.fn(),
        resetPhoto: jest.fn(),
        webcamRef: { current: null }
      })

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(mockError)
      })
    })
  })
})
