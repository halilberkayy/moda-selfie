import api from './axios'

export interface Product {
  id: number
  name: string
  price: number
  category: string
}

export interface ProductRecommendationResponse {
  success: boolean
  message: string
  products: Product[]
}

export const getProductRecommendations = async (image: File, topK = 5): Promise<ProductRecommendationResponse> => {
  const formData = new FormData()
  formData.append('file', image)
  formData.append('top_k', topK.toString())

  const response = await api.post<ProductRecommendationResponse>('/urun-oner', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
}
