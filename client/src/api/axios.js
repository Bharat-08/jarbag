import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true,
});

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

/* ---------- PUBLIC ROUTES (NO AUTH) ---------- */
const PUBLIC_ROUTES = [
    '/news',
    '/news/',
    '/news/pib',
];

/* ---------- REQUEST INTERCEPTOR ---------- */
api.interceptors.request.use(
    (config) => {
        const isPublicRoute = PUBLIC_ROUTES.some(route =>
            config.url?.startsWith(route)
        );

        // Attach token ONLY for protected routes
        if (accessToken && !isPublicRoute) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/* ---------- RESPONSE INTERCEPTOR ---------- */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isPublicRoute = PUBLIC_ROUTES.some(route =>
            originalRequest?.url?.startsWith(route)
        );

        // ❌ NEVER refresh token for public routes
        if (isPublicRoute) {
            return Promise.reject(error);
        }

        // Refresh token logic only for protected APIs
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/refresh')
        ) {
            originalRequest._retry = true;

            try {
                const res = await api.post('/auth/refresh');
                const newAccessToken = res.data.accessToken;

                setAccessToken(newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                setAccessToken(null);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
