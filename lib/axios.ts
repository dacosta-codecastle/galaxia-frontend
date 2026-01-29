import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const isShopRequest = config.url?.startsWith('/shop') || config.url?.startsWith('shop');

        const tokenKey = isShopRequest ? 'shop_token' : 'token';
        const token = localStorage.getItem(tokenKey);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                const requestUrl = error.config.url || '';
                const isShopRequest = requestUrl.includes('/shop') || requestUrl.includes('shop');

                if (isShopRequest) {
                    localStorage.removeItem('shop_token');
                    if (!window.location.pathname.includes('/shop/auth')) {
                        window.location.href = '/shop/auth';
                    }
                } else {
                    localStorage.removeItem('token');
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;