import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5041/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nos-token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro?.response?.status === 401) {
      localStorage.removeItem('nos-token')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(erro)
  }
)

export default api