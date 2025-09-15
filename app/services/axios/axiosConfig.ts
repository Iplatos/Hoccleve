import axios from 'axios'

const SINGLE_BACKEND_URL = 'https://backend.hoccleveclub.ru'
const axiosInstance = axios.create({
  baseURL: SINGLE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default axiosInstance
