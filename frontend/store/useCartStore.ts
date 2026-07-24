import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItemType = {
    productId: string;
    quantity: number;
    variantId: string;
    selectedColor: {
        name: string;
        hex: string;
    };
};

export type AddItemArgumentType = CartItemType & {
    stock: number;
};

type CartStore = {
    cartItems: CartItemType[];
    addItem: (item: AddItemArgumentType) => void;
    removeItem: (item: Pick<CartItemType, "productId" | "variantId">) => void;

    increaseItem: (item: {
        productId: string;
        variantId: string;
        stock: number;
    }) => void;

    decreaseItem: (item: {
        productId: string;
        variantId: string;
    }) => void;

    clearCart: () => void;
    setCart: (items: CartItemType[]) => void;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            cartItems: [],

            addItem: (item) =>

                set((state) => {
                    const index = state.cartItems.findIndex(
                        (i) =>
                            i.productId === item.productId &&
                            i.variantId === item.variantId
                    );

                    const safeQty = Math.min(item.quantity, item.stock);

                    if (index !== -1) {
                        const updated = [...state.cartItems];

                        updated[index] = {
                            ...updated[index],
                            quantity: Math.min(
                                updated[index].quantity + safeQty,
                                item.stock,
                            ),
                        };

                        return { cartItems: updated };
                    }

                    return {
                        cartItems: [
                            ...state.cartItems,
                            {
                                productId: item.productId,
                                variantId: item.variantId,
                                quantity: safeQty,
                                selectedColor: item.selectedColor,
                            },
                        ],
                    };
                }),

            removeItem: (item) =>
                set((state) => ({
                    cartItems: state.cartItems.filter(
                        (i) =>
                            !(
                                i.productId === item.productId &&
                                i.variantId === item.variantId
                            )
                    ),
                })),

            increaseItem: (item) =>
                set((state) => {
                    const index = state.cartItems.findIndex(
                        (i) =>
                            i.productId === item.productId &&
                            i.variantId === item.variantId
                    );

                    if (index === -1) return state;

                    const updated = [...state.cartItems];
                    const current = updated[index];

                    updated[index] = {
                        ...current,
                        quantity: Math.min(current.quantity + 1, item.stock),
                    };

                    return { cartItems: updated };
                }),

            decreaseItem: (item) =>
                set((state) => {
                    const index = state.cartItems.findIndex(
                        (i) =>
                            i.productId === item.productId &&
                            i.variantId === item.variantId
                    );

                    if (index === -1) return state;

                    const updated = [...state.cartItems];
                    const current = updated[index];

                    if (current.quantity <= 1) {
                        return {
                            cartItems: state.cartItems.filter(
                                (i) =>
                                    !(
                                        i.productId === item.productId &&
                                        i.variantId === item.variantId
                                    )
                            ),
                        };
                    }

                    updated[index] = {
                        ...current,
                        quantity: current.quantity - 1,
                    };

                    return { cartItems: updated };
                }),

            setCart: (items) => set({ cartItems: items }),
            clearCart: () => set({ cartItems: [] }),
        }),
        {
            name: "cart-storage",
        }
    )
);