import axios from 'axios'

/**
 * API client cho Order Tracking System.
 * Lưu ý: Không hardcode URL, luôn lấy từ VITE_API_URL.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL

// Tránh lỗi khó hiểu khi quên set biến môi trường
function assertApiBaseUrl() {
  if (!API_BASE_URL || typeof API_BASE_URL !== 'string') {
    const err = new Error(
      'Thiếu cấu hình API. Vui lòng thiết lập biến môi trường VITE_API_URL.',
    )
    err.code = 'MISSING_API_URL'
    throw err
  }
}

function normalizeAxiosError(error) {
  // Ưu tiên thông báo từ backend nếu có
  const serverMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail

  if (typeof serverMessage === 'string' && serverMessage.trim()) {
    return serverMessage.trim()
  }

  // Lỗi mạng / CORS / server down
  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.'
  }

  const status = error?.response?.status
  if (status === 400) return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
  if (status === 404) return 'Không tìm thấy dữ liệu.'
  if (status === 409) return 'Dữ liệu đã thay đổi. Vui lòng tải lại.'
  if (status === 422) return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
  if (status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'

  return 'Đã xảy ra lỗi. Vui lòng thử lại.'
}

function createClient() {
  assertApiBaseUrl()

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  })
}

async function request(promise) {
  try {
    const res = await promise
    return res.data
  } catch (error) {
    const friendlyMessage = normalizeAxiosError(error)
    const err = new Error(friendlyMessage)
    err.raw = error
    throw err
  }
}

export function healthCheck() {
  const client = createClient()
  return request(client.get('/api/health'))
}

export function getOrders() {
  const client = createClient()
  return request(client.get('/api/orders'))
}

export function createOrder(payload) {
  const client = createClient()
  return request(client.post('/api/orders', payload))
}

export function updateStatus(id, status) {
  const client = createClient()
  return request(client.put(`/api/orders/${encodeURIComponent(id)}/status`, { status }))
}

export function deleteOrder(id) {
  const client = createClient()
  return request(client.delete(`/api/orders/${encodeURIComponent(id)}`))
}

