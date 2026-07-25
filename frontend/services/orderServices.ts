import api from "@/lib/api";



export interface CreateOrderItem {
    productId: string;
    variantId: string;
    quantity: number;
}

export interface ShippingAddressInput {
    fullName: string;
    city: string;
    address: string;
    postalCode?: string;
}

export interface CreateOrderPayload {
    items: CreateOrderItem[];
    shippingAddress: ShippingAddressInput;
}

export interface OrderItem {
    productId: string;
    variantId: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
}

export interface Order {
    _id: string;
    userId: string;
    items: OrderItem[];
    shippingAddress: ShippingAddressInput;
    paymentMethod: "shaparak";
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: string;
    isDelivered: boolean;
    deliveredAt?: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    trackingCode?: string;
    createdAt: string;
    updatedAt: string;
}

export const orderService = {
    create: async (payload: CreateOrderPayload): Promise<Order> => {
        const { data } = await api.post("/orders", payload);
        return data.data ?? data; // adjust based on your API's response envelope
    },

    getMyOrders: async (): Promise<Order[]> => {
        const { data } = await api.get("/orders/my-orders");
        return data.data ?? data;
    },

    getById: async (id: string): Promise<Order> => {
        const { data } = await api.get(`/orders/${id}`);
        return data.data ?? data;
    },

    cancel: async (id: string): Promise<Order> => {
        const { data } = await api.patch(`/orders/${id}/cancel`);
        return data.data ?? data;
    },
};