// lib/api.ts
import { API } from '@/hooks/types';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
const api = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
});
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];
const processQueue = (error: AxiosError | null) => {
    failedQueue.forEach((p) => error ? p.reject(error) : p.resolve());
    failedQueue = [];
};
api.interceptors.response.use(
    (res) => {

        return res
    },
    async (error: AxiosError<{
        status: string;
        code?: string;
        message?: string;
    }>) => {
        const original = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status !== 401 || original._retry || error.response?.data?.code !== "TOKEN_EXPIRED") {

            const reject = Promise.reject(error);
            return reject
        }
        if (isRefreshing) {
            const { promise, resolve, reject } = Promise.withResolvers();
            failedQueue.push({ resolve, reject });
            return promise.then(() => api(original));
        }
        original._retry = true;
        isRefreshing = true;

        try {
            await api.post('/auth/refresh-token');
            processQueue(null);
            return api(original);
        } catch (refreshError) {
            processQueue(refreshError as AxiosError);
            window.dispatchEvent(new Event("auth:logout"));
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);
export default api;