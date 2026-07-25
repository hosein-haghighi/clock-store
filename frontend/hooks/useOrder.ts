
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    orderService,
    CreateOrderPayload,
} from "@/services/orderServices";

export const orderKeys = {
    all: ["orders"] as const,
    myOrders: () => [...orderKeys.all, "my-orders"] as const,
    detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateOrderPayload) => orderService.create(payload),
        onSuccess: () => {
            // invalidate order list + cart, since a successful create should clear/refresh cart
            queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() });
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
}

export function useMyOrders() {
    return useQuery({
        queryKey: orderKeys.myOrders(),
        queryFn: orderService.getMyOrders,
    });
}

export function useOrder(id: string) {
    return useQuery({
        queryKey: orderKeys.detail(id),
        queryFn: () => orderService.getById(id),
        enabled: !!id,
    });
}

export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => orderService.cancel(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
        },
    });
}