import { CreateProductPayload } from "@/hooks/useProducts";
import api from "@/lib/api";

export const getProductByUrl = async (params: URLSearchParams) => {
    const { data } = await api.get(`/products?${params.toString()}`)
    return data;
}

export const getProductBySlug = async (slug: string) => {
    const { data } = await api.get(`/products/${slug}`)
    return data
}

//Amir any should change here !
export const getReviewsFromProductId = async (productId: string, payload: any) => {
    const { data } = await api.post(`/products/${productId}/reviews`, payload)
    return data

}

export const postProducts = async (payload: CreateProductPayload) => {
    const { data } = await api.post(`/admin/products`, payload)
    return data
}

export const deleteProductById = async (productId: string) => {
    const { data } = await api.delete(`admin/products/${productId}`)
    return data
}
export const deleteReviewById = async (productId: string, reviewId: string) => {

    const { data } = await api.delete(`/admin/products/${productId}/reviews/${reviewId}`)
    return data
}

export const putProduct = async (productId: string, payload: any) => {

    const { data } = await api.put(`/admin/products/${productId}`, payload)
    return data
}
