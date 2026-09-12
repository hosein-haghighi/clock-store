"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ShoppingCart,
    Trash2,
    ChevronLeft,
    Package,
    ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "@/i18n/navigation";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import Loading from "../loading";

const PROMO_CODES: Record<string, number> = {
    WATCH10: 10,
    VIP20: 20,
};

export default function CartPage() {
    const t = useTranslations("cart");
    const { items: cartItems, removeItem, increaseItem, decreaseItem, isLoading } = useCart();

    // const product =  products.find( (item)=> item.id )
    const { isAuthenticated } = useUser();
    const router = useRouter();

    const effectivePrice = (item: { price: number; discountPrice?: number }) => {
        return !!item?.discountPrice && item.discountPrice < item.price && item.discountPrice > 0
            ? item.discountPrice
            : item.price;
    }

    const subtotal = cartItems.reduce(
        (sum, item) =>
            sum + (item.discountPrice ?? item.price) * item.quantity,
        0
    );



    const shipping = subtotal >= 500 ? 0 : 15;
    const total = subtotal + shipping;

    // const applyPromo = () => {
    //     const code = promoInput.trim().toUpperCase();
    //     if (PROMO_CODES[code]) {
    //         setAppliedPromo(code);
    //         setPromoError("");
    //     } else {
    //         setPromoError(t("invalidPromo"));
    //     }
    // };

    const checkoutHandler = () => {
        if (!isAuthenticated) {
            toast.error("ابتدا وارد شوید");
            router.push("/login");
            return;
        }
        router.push("/checkout");
    };
    //__ vars ______________________________________________________________________


    // ── Loading state ────────────────────────────────────────────────────────
    if (!!isLoading) {
        return <Loading />
    }
    // ── Empty state ──────────────────────────────────────────────────────────
    if (cartItems?.length === 0 || !cartItems) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
                <div className="h-20 w-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    <ShoppingCart className="h-9 w-9 text-zinc-300 dark:text-zinc-600" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                        {t("emptyTitle")}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">{t("emptyDescription")}</p>
                </div>
                <Button asChild className="rounded-xl px-6">
                    <Link href="/">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        {t("browseWatches")}
                    </Link>
                </Button>
            </div>
        );
    }


    // ── Main ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 rounded-xl">
            {/* Header */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-10">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
                    <Link
                        href="/"
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
                        {t("title")}
                    </h1>
                    <Badge variant="secondary" className="ml-1 text-xs">
                        {cartItems?.reduce((s, it) => s + it.quantity, 0)} {t("items")}
                    </Badge>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

                    {/* ── Item list ── */}
                    <div className="flex flex-col gap-3">
                        {cartItems?.map((item) => {


                            const selectedVariant = item

                            const ep = effectivePrice(item);
                            const imgSrc = !!item.image ? `/api${item.image}` : null;

                            const hasDiscount = !!item?.discountPrice && selectedVariant?.discountPrice > 0;


                            return (
                                <div
                                    key={`${item.productId}-${item.selectedColor?.name}`}
                                    className="group flex gap-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 transition-shadow hover:shadow-md"
                                >
                                    {/* Image */}
                                    <Link href={`/${item.slug}`} className="shrink-0">
                                        <div className="h-24 w-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                            {imgSrc ? (
                                                <img
                                                    src={imgSrc}
                                                    alt={item.title}
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
                                                    {item.brand}
                                                </p>
                                                <Link
                                                    href={`/${item.slug}`}
                                                    className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-snug hover:underline truncate block"
                                                >
                                                    {item.title}
                                                </Link>
                                            </div>
                                            {/* حذف کامل آیتم */}
                                            <button
                                                onClick={() => removeItem({ variantId: item.variantId, productId: item.productId })}
                                                className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center cursor-pointer text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all duration-150"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        {/* Color chip */}
                                        {item.selectedColor && (
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className="h-3 w-3 rounded-full border border-zinc-200 dark:border-zinc-700"
                                                    style={{ backgroundColor: item.selectedColor.hex }}
                                                />
                                                <span className="text-xs text-zinc-400">
                                                    {item.selectedColor.name}
                                                </span>
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="mt-auto flex items-center justify-between pt-2">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                                                    ${ep?.toFixed(2)}
                                                </span>
                                                {hasDiscount && (
                                                    <span className="text-xs text-zinc-400 line-through">
                                                        ${selectedVariant.price.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Qty stepper */}
                                        <div className="flex items-center border mr-auto border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => decreaseItem({ ...item })}
                                                className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-base leading-none cursor-pointer"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    increaseItem({ ...item })
                                                }}
                                                disabled={item.quantity >= item.stock}
                                                className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 text-base leading-none cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Order summary ── */}
                    <div className="lg:sticky lg:top-20 h-fit">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 flex flex-col gap-5">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                {t("orderSummary")}
                            </h2>

                            <div className="flex flex-col gap-3 text-sm">
                                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                    <span>{t("subtotal")}</span>
                                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                        ${subtotal.toFixed(2)}
                                    </span>
                                </div>
                                {/* {discount > 0 && (
                                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                            <span className="flex items-center gap-1">
                                                <Tag className="h-3.5 w-3.5" />
                                                {t("promo")} ({appliedPromo})
                                            </span>
                                            <span>−${discount.toFixed(2)}</span>
                                        </div>
                                    )} */}
                                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                    <span>{t("shipping")}</span>
                                    <span
                                        className={cn(
                                            "font-medium",
                                            shipping === 0
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-zinc-900 dark:text-zinc-50"
                                        )}
                                    >
                                        {shipping === 0 ? t("free") : `$${shipping.toFixed(2)}`}
                                    </span>
                                </div>
                                {shipping > 0 && (
                                    <p className="text-xs text-zinc-400">{t("freeShippingHint")}</p>
                                )}
                            </div>

                            <Separator className="dark:border-zinc-800" />

                            <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-50">
                                <span>{t("total")}</span>
                                <span className="text-xl">${total.toFixed(2)}</span>
                            </div>

                            {/* Promo code */}
                            {/* <div className="flex gap-2">
                                    <input
                                        value={promoInput}
                                        onChange={(e) => {
                                            setPromoInput(e.target.value);
                                            setPromoError("");
                                        }}
                                        onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                                        placeholder={t("promoPlaceholder")}
                                        className="flex-1 h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                    />
                                    {appliedPromo ? (
                                        <button
                                            onClick={() => {
                                                setAppliedPromo(null);
                                                setPromoInput("");
                                            }}
                                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-rose-500 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={applyPromo}
                                            className="h-9 rounded-lg px-3 text-xs font-semibold"
                                        >
                                            {t("apply")}
                                        </Button>
                                    )}
                                </div>
                                {promoError && (
                                    <p className="text-xs text-rose-500 -mt-3">{promoError}</p>
                                )} */}

                            {/* CTA */}
                            <Button
                                size="lg"
                                onClick={checkoutHandler}
                                className="w-full rounded-xl font-semibold gap-2 bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                {t("checkout")}
                                <ArrowRight className="h-4 w-4" />
                            </Button>

                            <Link
                                href="/"
                                className="text-center text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                            >
                                {t("continueShopping")}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}