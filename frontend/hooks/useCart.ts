import { apiAddItem, apiRemoveItem, apiUpdateItem, fetchCartDetails, fetchServerCart, pushCartMerge } from "@/services/cartServices";
import { CartItemType, useCartStore } from "@/store/useCartStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useUser } from "./useUser";


export interface DetailedCartItemType extends CartItemType {
    title: string;
    slug: string;
    brand: string;
    image: string;
    price: number;
    discountPrice: number;
    stock: number;
}

export const useCart = () => {
    const {
        cartItems: offlineCartItems,
        removeItem: removeItemOffline,
        decreaseItem: decreaseItemOffline,
        increaseItem: increaseItemOffline,
        addItem: addItemOffline,
        setCart: setOfflineItems,
        clearCart: clearOfflineItems
    } = useCartStore();

    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    // track previous auth state to detect login/logout transitions
    const prevAuthRef = useRef<boolean | null>(null);

    // ───────────────────────────────────────
    // server cart (auth only)
    // ───────────────────────────────────────

    const cartQuery = useQuery({
        queryKey: ["cart"],
        queryFn: fetchServerCart,
        enabled: isAuthenticated,
        staleTime: 1000 * 30,  // 30s or more
        refetchOnMount: false
    });

    // ───────────────────────────────────────
    // guest cart details (guest only)
    // keyed by variantId — the real unique identifier of an item,
    // not color name (two variants could theoretically share a color)
    // ───────────────────────────────────────

    const cartKey = offlineCartItems
        .map(i => `${i.productId}-${i.variantId}`)
        .sort()
        .join("|");

    const detailsQuery = useQuery({
        queryKey: ["cart-details", cartKey],
        queryFn: () => fetchCartDetails(
            offlineCartItems.map(i => ({
                productId: i.productId,
                variantId: i.variantId,
            }))
        ),
        enabled: !isAuthenticated && offlineCartItems.length > 0,
        staleTime: 10000,
    });

    // ───────────────────────────────────────
    // merge mutation (used on login)
    // onSuccess is the ONLY place that clears the offline cart —
    // never clear it optimistically, or a failed merge loses the cart.
    // ───────────────────────────────────────

    const mergeMutation = useMutation({
        mutationFn: pushCartMerge,
        onSuccess: (items) => {
            queryClient.setQueryData(["cart"], items);
            clearOfflineItems();
        },
    });

    // ───────────────────────────────────────
    // login transition: merge local → server, then clear local (in onSuccess)
    // logout transition: clear local, drop server cart query
    //
    // NOTE: this is the single source of truth for triggering a merge.
    // There used to be a second, unconditional "merge on every mount"
    // effect here — it fired regardless of auth state (even for guests)
    // and raced with this one. It's removed; this effect alone handles it.
    // ───────────────────────────────────────

    useEffect(() => {
        const prev = prevAuthRef.current;

        // login: prev was false/null, now true
        if (prev === false && isAuthenticated) {
            if (offlineCartItems.length > 0) {
                mergeMutation.mutate(offlineCartItems);
                // clearOfflineItems() intentionally NOT called here —
                // it happens in mergeMutation's onSuccess so we don't
                // wipe the guest cart if the merge request fails.
            }
        }

        // logout: prev was true, now false
        if (prev === true && !isAuthenticated) {
            clearOfflineItems();
            queryClient.removeQueries({ queryKey: ["cart"] });
        }

        prevAuthRef.current = isAuthenticated;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);


    // ───────────────────────────────────────
    // addItem
    // ───────────────────────────────────────
    const addItem = async (item: CartItemType) => {

        if (isAuthenticated) {
            try {
                const updatedItems = await apiAddItem(item);
                queryClient.setQueryData(["cart"], updatedItems);
            } catch (err) {
                console.error("addItem failed:", err);
            }
            return;
        }

        // guest: fetch details on-demand for this specific item
        let stock = 999; // safe fallback
        try {
            const details = await fetchCartDetails([item]);
            const detailedItem = details.find(
                (v) => v.productId === item.productId &&
                    v.variantId === item.variantId
            );
            stock = detailedItem?.stock ?? 999;
        } catch {
            // if fetch fails, continue with stock=999
        }

        addItemOffline({ ...item, stock });
    };

    // ───────────────────────────────────────
    // increaseItem
    // ───────────────────────────────────────

    const increaseItem = async (item: {
        productId: string;
        variantId: string;
        selectedColor: { name: string; hex: string };
    }) => {
        if (!isAuthenticated) {
            const detailedItem = detailsQuery.data?.find(
                (v) =>
                    v.productId === item.productId &&
                    v.variantId === item.variantId
            );
            increaseItemOffline({
                productId: item.productId,
                variantId: item.variantId,
                stock: detailedItem?.stock ?? 0,
            });
            return;
        }

        const current = cartQuery.data?.find(
            (i) =>
                i.productId === item.productId &&
                i.variantId === item.variantId
        );

        try {
            await apiUpdateItem(
                item.productId,
                item.variantId,
                (current?.quantity ?? 0) + 1
            );
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        } catch (err) {
            console.error("increaseItem failed:", err);
        }
    };

    // ───────────────────────────────────────
    // decreaseItem
    // ───────────────────────────────────────

    const decreaseItem = async (item: {
        productId: string;
        variantId: string;
        selectedColor: { name: string; hex: string };
    }) => {
        if (!isAuthenticated) {
            const current = offlineCartItems.find(
                i => i.productId === item.productId &&
                    i.variantId === item.variantId
            );
            if ((current?.quantity ?? 1) <= 1) {
                removeItemOffline({ productId: item.productId, variantId: item.variantId });
            } else {
                decreaseItemOffline({ productId: item.productId, variantId: item.variantId });
            }
            return;
        }

        const current = cartQuery.data?.find(
            (i) =>
                i.productId === item.productId &&
                i.variantId === item.variantId
        );

        const newQty = (current?.quantity ?? 1) - 1;

        try {
            if (newQty <= 0) {
                await apiRemoveItem(item.productId, item.variantId);
            } else {
                await apiUpdateItem(item.productId, item.variantId, newQty);
            }
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        } catch (err) {
            console.error("decreaseItem failed:", err);
        }
    };

    // ───────────────────────────────────────
    // removeItem
    // ───────────────────────────────────────

    const removeItem = async (item: {
        productId: string;
        variantId: string;
    }) => {
        if (!isAuthenticated) {
            removeItemOffline({
                productId: item.productId,
                variantId: item.variantId,
            });
            return;
        }

        try {
            await apiRemoveItem(item.productId, item.variantId);
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        } catch (err) {
            console.error("removeItem failed:", err);
        }
    };

    // ───────────────────────────────────────
    // derived
    // ───────────────────────────────────────

    const items: DetailedCartItemType[] = isAuthenticated
        ? cartQuery.data ?? []
        : detailsQuery.data?.map((item) => {
            const localItem = offlineCartItems.find(
                (i) =>
                    i.productId === item.productId &&
                    i.variantId === item.variantId
            );

            return {
                ...item,
                quantity: localItem?.quantity ?? item.quantity ?? 1,
            };
        }) ?? [];

    const isLoading = isAuthenticated
        ? cartQuery.isPending
        : detailsQuery.isPending && offlineCartItems.length > 0;


    return {
        items,
        offlineCartItems,
        addItem,
        removeItem,
        increaseItem,
        decreaseItem,
        isLoading,
        isSyncing: mergeMutation.isPending,
        isError:
            cartQuery.isError || detailsQuery.isError || mergeMutation.isError,
    };
};