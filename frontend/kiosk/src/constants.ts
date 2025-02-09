export const APP_STEPS = {
  WELCOME: 0,
  CAPTURE: 1,
  TRYON: 2
}

export type ErrorMessageKey =
  | 'CAMERA_ACCESS'
  | 'CAMERA_ERROR'
  | 'PHOTO_CAPTURE'
  | 'UPLOAD_FAILED'
  | 'TRYON_FAILED'
  | 'VIRTUAL_TRYON_ERROR'
  | 'NETWORK'
  | 'SERVER'
  | 'UNEXPECTED_ERROR'

export const ERROR_MESSAGES: Record<ErrorMessageKey, string> = {
  CAMERA_ACCESS: 'Kamera erişimine izin verilmedi. Lütfen tarayıcı ayarlarından kamera izinlerini kontrol edin.',
  CAMERA_ERROR: 'Kamera erişiminde bir hata oluştu',
  PHOTO_CAPTURE: 'Fotoğraf çekilemedi',
  UPLOAD_FAILED: 'Fotoğraf yüklenirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
  TRYON_FAILED: 'Kıyafet deneme işlemi başarısız oldu. Lütfen tekrar deneyin.',
  VIRTUAL_TRYON_ERROR: 'Kıyafet deneme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
  NETWORK: 'İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edip tekrar deneyin.',
  SERVER: 'Sunucu kaynaklı bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
  UNEXPECTED_ERROR: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
}

export const SUCCESS_MESSAGES = {
  PHOTO_CAPTURED: 'Fotoğraf başarıyla çekildi',
  VIRTUAL_TRYON_COMPLETE: 'Virtual try-on işlemi tamamlandı!'
}

export const LOCAL_STORAGE_KEYS = {
  KVKK_APPROVAL: 'kvkk_approval',
  USER_PREFERENCES: 'user_preferences'
}
