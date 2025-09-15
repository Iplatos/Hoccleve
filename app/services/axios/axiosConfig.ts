import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'https://api.lk-impulse.ru',
    headers: {
        'Content-Type': 'application/json',
    },


    // Другие настройки axios
});
export default axiosInstance;
