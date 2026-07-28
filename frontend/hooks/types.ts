export const API = process.env.NEXT_PUBLIC_API_PORT ? `${process.env.NEXT_PUBLIC_API_URL}:${process.env.NEXT_PUBLIC_API_PORT}` : `${process.env.NEXT_PUBLIC_API_URL}`

export type User = {
    id: string;
    name: string;
    email: string;
    role?: string;
};