"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductType } from "@/types/product";
import { deleteProductById, deleteReviewById, getProductBySlug, getProductByUrl, getReviewsFromProductId, postProducts, putProduct } from "@/services/productServices";
// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductFilters {
    brand?: string;
    category?: string;
    gender?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    search?: string;
    sort?: "newest" | "price" | "-price" | "rating";
    page?: number;
    limit?: number;
}

export interface ReviewPayload {
    rating: number;
    comment: string;
}

export interface CreateProductPayload {
    title: string;
    slug: string;
    brand: string;
    watchModel: string;
    description: string;
    images: string[];
    variants: { color: { name: string, hex: string }, price: number, discountPrice?: number, stock: number; }[]
    category: "luxury" | "sport" | "casual" | "smart" | "classic" | "dress";
    gender: "men" | "women" | "unisex";
    colors?: { name: string; hex: string }[];
    specifications?: Record<string, string>;
    isFeatured?: boolean;
}

// ─── Fetch Helpers ────────────────────────────────────────────────────────────

// const getToken = () => localStorage.getItem("token");

// const authHeaders = () => ({
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${getToken()}`,
// });

// ─── Public Hooks ─────────────────────────────────────────────────────────────

/**
 * GET /api/products
 * لیست محصولات با فیلتر و صفحه‌بندی
 */
const params = new URLSearchParams();
export const useProducts = (filters: ProductFilters = {}) => {


    Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== "") params.set(key, String(val));
    });

    const query = useQuery({
        queryKey: ["products", filters],
        queryFn: () => getProductByUrl(params),
        staleTime: 1000 * 60 * 5,
        retry: false,
    });
    return {
        products: query.data?.data ?? [],
        page: query.data?.page,
        pages: query.data?.pages,
        total: query.data?.total,
        loading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
    };
};

/**
 * GET /api/products/featured
 * محصولات ویژ  ه صفحه اصلی
 */
export const useFeaturedProducts = (
    filters: Record<string, string>,
    initialProducts?: ProductType[]
) => {
    const query = useQuery({
        queryKey: ["products", "featured", filters],

        queryFn: () =>
            getProductByUrl(
                new URLSearchParams(filters)
            ),

        initialData: initialProducts
            ? {
                data: initialProducts,
            }
            : undefined,

        staleTime: 1000 * 60 * 10,

        retry: false,
    });

    return {
        products: query.data?.data ?? [],
        isEmpty: !query.data?.data?.length,
        loading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
    };
};
/**
 * GET /api/products/:slug
 * جزئیات یک محصول
 */
type ProductResponse = {
    message: string;
    status: string;
    data: ProductType;
};

export const useProductBySlug = (slug: string) => {
    const query = useQuery<ProductResponse, Error>({
        queryKey: ["products", slug],
        queryFn: () => getProductBySlug(slug),
        enabled: !!slug,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });

    return {
        product: query.data?.data ?? null,
        loading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
    };
};

/**
 * POST /api/products/:id/reviews
 * ثبت نظر
 */
export const useCreateReview = (productId: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (payload: ReviewPayload) => getReviewsFromProductId(productId, payload)

    });

    return {
        submitReview: mutation.mutate,
        loading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
    };
};

// ─── Admin Hooks ──────────────────────────────────────────────────────────────

/**
 * POST /api/admin/products
 * ایجاد محصول جدید
 */
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (payload: CreateProductPayload) => postProducts(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });

    return {
        createProduct: mutation.mutate,
        loading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
    };
};

/**
 * PUT /api/admin/products/:id
 * ویرایش محصول
 */
export const useUpdateProduct = (productId: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (payload: Partial<CreateProductPayload>) => putProduct(productId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });

    return {
        updateProduct: mutation.mutate,
        loading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
    };
};

/**
 * DELETE /api/admin/products/:id
 * حذف محصول
 */
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (productId: string) => deleteProductById(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });

    return {
        deleteProduct: mutation.mutate,
        loading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
    };
};

/**
 * DELETE /api/admin/products/:id/reviews/:reviewId
 * حذف نظر توسط admin
 */
export const useDeleteReview = (productId: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (reviewId: string) => deleteReviewById(productId, reviewId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products", productId] });
        },
    });

    return {
        deleteReview: mutation.mutate,
        loading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
    };
};
