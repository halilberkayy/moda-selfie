// API Endpoints
export const API_ENDPOINTS = {
  KVKK: '/api/kvkk-onay',
  VIRTUAL_TRYON: '/api/virtual-tryon',
  UPLOAD_PHOTO: '/api/fotograf-yukle'
}

// Image configurations
export const IMAGE_CONFIG = {
  SUPPORTED_TYPES: ['image/jpeg', 'image/png'],
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_DIMENSIONS: {
    WIDTH: 300,
    HEIGHT: 300
  }
}

// Virtual Try-on configurations
export const VIRTUAL_TRYON_CONFIG = {
  CLOTHING_TYPES: {
    UPPER: 'upper',
    LOWER: 'lower',
    DRESS: 'dress'
  }
}

// Application steps
export const APP_STEPS = {
  WELCOME: 1,
  CAPTURE: 2,
  TRYON: 3
}

// Error messages
export const ERROR_MESSAGES = {
  CAMERA_ACCESS: 'Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin.',
  PHOTO_CAPTURE: 'Fotoğraf çekilemedi. Lütfen tekrar deneyin.',
  UPLOAD_FAILED: 'Fotoğraf yüklenemedi. Lütfen tekrar deneyin.',
  TRYON_FAILED: 'Virtual try-on işlemi başarısız oldu. Lütfen tekrar deneyin.',
  NETWORK: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
  SERVER: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.'
}

// Success messages
export const SUCCESS_MESSAGES = {
  PHOTO_CAPTURED: 'Fotoğraf başarıyla çekildi!',
  TRYON_COMPLETE: 'Virtual try-on işlemi tamamlandı!'
}

// Timeouts and intervals (in milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  TOAST_DURATION: 3000, // 3 seconds
  RETRY_DELAY: 1000 // 1 second
}

// Local storage keys
export const STORAGE_KEYS = {
  KVKK_APPROVAL: 'kvkk_approval',
  USER_PREFERENCES: 'user_preferences'
}
