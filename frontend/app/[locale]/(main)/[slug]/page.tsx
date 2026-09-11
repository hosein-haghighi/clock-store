"use client";

import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    ShoppingCart,
    Heart,
    Star,
    ChevronLeft,
    Package,
    Shield,
    Truck,
    RotateCcw,
    Check,
    ChevronRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useProductBySlug } from "@/hooks/useProducts";
import toast from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";
import Loading from "../loading";

import { useCart } from "@/hooks/useCart";
import { API } from "@/hooks/types";

export default function ProductPage() {
    const t = useTranslations("product");
    const locale = useLocale();
    const params = useParams();
    const { addItem } = useCart()
    const slug = params?.slug as string;
    const { product, loading, error } = useProductBySlug(slug);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const selectedVariant = product?.variants?.find(v => v._id === selectedVariantId) ?? product?.variants?.[0] ?? null;
    const [quantity, setQuantity] = useState(1);
    const [wishlisted, setWishlisted] = useState(false);



    if (loading) { return (<Loading />) }

    if (error || !product) {
        return (
            <div className="text-center space-y-4 px-4">
                <Package className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700" />
                <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {t("notFoundTitle")}
                </h2>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                    {error?.message ?? t("notFoundDescription")}
                </p>
                <Button asChild variant="outline" className="mt-2">
                    <Link href="/">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        {t("backToProducts")}
                    </Link>
                </Button>
            </div>
        );
    }

    // ── Derived values ────────────────────────────────────────────────────────


    const price = selectedVariant?.price ?? 0;
    const discountPrice = selectedVariant?.discountPrice;
    const stock = selectedVariant?.stock ?? 0;
    const hasDiscount = !!discountPrice && discountPrice < price;
    const discountPercent = hasDiscount
        ? Math.round(((price - discountPrice!) / price) * 100)
        : 0;
    const inStock = stock > 0;
    const lowStock = stock > 0 && stock <= 5;

    const specs: [string, string][] = product.specifications
        ? Object.entries(
            product.specifications instanceof Map
                ? Object.fromEntries(product.specifications)
                : product.specifications
        )
        : [];

    const trustBadges = [
        { icon: Shield, label: t("warranty") },
        { icon: Truck, label: t("shipping") },
        { icon: RotateCcw, label: t("returns") },
    ];

    // ── handlers ─────────────────────────────────────────────────────────────
    const addToCartHandler = () => {
        if (selectedVariant) {
            addItem({
                variantId: selectedVariant._id,
                productId: product._id,
                quantity,
                selectedColor: selectedVariant.color!
            })
            toast.success(
                <div>
                    {t("addedToCart")}{" "}
                    <Link href="/cart" className="text-primary underline">
                        {t("cart")}
                    </Link>
                </div>
            );
        }

    };

    // ── UI ────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-zinc-100 w-screen dark:bg-zinc-950 font-sans">
            {/* ── Breadcrumb ── */}
            <div className="border-b border-zinc-100 dark:border-zinc-800/60">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-zinc-400">
                    <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                        {t("home")}
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link href={`/?category=${product.category}`}>
                        <span className="capitalize text-zinc-500 dark:text-zinc-400">
                            {product.category}
                        </span>
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[180px]">
                        {product.title}
                    </span>
                </div>
            </div>

            {/* ── Main grid ── */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-b-2 pb-12">

                    {/* ── Left: image gallery ── */}
                    <div className="flex">
                        {product.images.length > 1 && (
                            <div className="hidden sm:flex flex-col gap-2 w-24 overflow-y-auto shrink-0">
                                {product.images.map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={cn(
                                            "h-16 w-16 rounded-lg border-2 overflow-hidden transition-all duration-200",
                                            selectedImage === i
                                                ? "border-zinc-900 dark:border-zinc-100"
                                                : "border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <img
                                            src={`${API}${img}`}
                                            alt={`${product.title} ${i + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative flex-1 h-72 aspect-square dark:bg-zinc-900 rounded-2xl overflow-hidden group">
                            {product.images.length > 0 ? (
                                <img
                                    src={`${API}${product.images[selectedImage]}`}
                                    alt={product.title}
                                    className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <Package className="h-24 w-24 text-zinc-300 dark:text-zinc-700" />
                                </div>
                            )}

                            {hasDiscount && (
                                <div className="absolute left-4 top-4">
                                    <Badge className="bg-rose-500 hover:bg-rose-500 text-white font-bold text-sm px-2.5 py-1 rounded-lg shadow-lg">
                                        -{discountPercent}%
                                    </Badge>
                                </div>
                            )}

                            {!inStock && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                    <span className="rounded-full bg-white/90 dark:bg-zinc-900/90 px-6 py-2 text-sm font-semibold text-zinc-800 dark:text-white shadow-xl">
                                        {t("outOfStock")}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={() => setWishlisted(!wishlisted)}
                                className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/90 dark:bg-zinc-900/80 shadow-md flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-transform duration-200"
                            >
                                <Heart
                                    className={cn(
                                        "h-4 w-4 transition-colors duration-200",
                                        wishlisted
                                            ? "fill-rose-500 text-rose-500"
                                            : "text-zinc-500"
                                    )}
                                />
                            </button>

                            {product.images.length > 1 && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 sm:hidden">
                                    {product.images.map((_: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(i)}
                                            className={cn(
                                                "h-1.5 rounded-full transition-all duration-200",
                                                selectedImage === i
                                                    ? "w-5 bg-white"
                                                    : "w-1.5 bg-white/50"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right: product info ── */}
                    <div className="flex flex-col items-center lg:items-start gap-6">
                        <div className="flex gap-2">
                            <span className="text-sm font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                {product.brand}
                            </span>
                            <span className="text-zinc-200 dark:text-zinc-700">·</span>
                            <Badge variant="secondary" className="capitalize text-xs rounded-md font-medium">
                                {product.category}
                            </Badge>
                            <Badge variant="outline" className="capitalize text-xs rounded-md ml-auto">
                                {product.gender}
                            </Badge>
                        </div>

                        <div className="flex flex-col items-center lg:items-start gap-2">
                            <h1 className="font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                                {product.title}
                            </h1>
                            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
                                {t("model")}: {product.watchModel}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-4 w-4",
                                            i < Math.round(product.rating ?? 0)
                                                ? "fill-amber-400 text-amber-400"
                                                : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                {(product.rating ?? 0).toFixed(1)}
                            </span>
                            <span className="text-sm text-zinc-400">
                                ({product.numReviews ?? 0} {t("reviews")})
                            </span>
                        </div>

                        <Separator className="dark:border-zinc-800" />

                        {/* Stock status */}
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    "h-2 w-2 rounded-full",
                                    !inStock
                                        ? "bg-red-500"
                                        : lowStock
                                            ? "bg-amber-500 animate-pulse"
                                            : "bg-emerald-500"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-sm font-medium",
                                    !inStock
                                        ? "text-red-600 dark:text-red-400"
                                        : lowStock
                                            ? "text-amber-600 dark:text-amber-400"
                                            : "text-emerald-600 dark:text-emerald-400"
                                )}
                            >
                                {!inStock
                                    ? t("outOfStock")
                                    : lowStock
                                        ? `${t("onlyLeft", { count: stock })}`
                                        : t("inStock")}
                            </span>
                        </div>

                        {/* Trust badges */}
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            {trustBadges.map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800 p-3 text-center bg-zinc-50/60 dark:bg-zinc-900/40"
                                >
                                    <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-tight">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Quantity + Add to Cart ── */}
                    <div className="flex flex-col items-center lg:items-start justify-end gap-3 mt-2">
                        <div className="flex items-center gap-3">
                            {hasDiscount && (
                                <>
                                    <span className="text-xl text-zinc-400 line-through">
                                        ${price.toFixed(2)}
                                    </span>
                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-100 font-semibold">
                                        {discountPercent}% {t("off")}
                                    </Badge>
                                </>
                            )}
                        </div>

                        <div>
                            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                                ${hasDiscount ? discountPrice!.toFixed(2) : price.toFixed(2)}
                            </span>
                        </div>

                        {/* Color selector */}
                        {product.variants?.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2.5">
                                    {t("color")}:{" "}
                                    <span className="font-normal text-zinc-500">
                                        {selectedVariant?.color.name}
                                    </span>
                                </p>
                                <div className="flex items-center justify-center lg:justify-start gap-2.5">
                                    {product.variants.map((v, i) => {

                                        return (
                                            <button
                                                key={i}
                                                title={v.color.name}
                                                onClick={() => setSelectedVariantId(v._id)}
                                                className={cn(
                                                    "h-8 w-8 rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ",
                                                    selectedVariant?._id === v._id
                                                        ? "border-zinc-900 dark:border-zinc-100 scale-110"
                                                        : "border-zinc-200 dark:border-zinc-700 hover:scale-105"
                                                )}
                                                style={{ backgroundColor: v.color.hex }}
                                            >
                                                {selectedVariant?._id === v._id && (
                                                    <Check className="h-3.5 w-3.5 drop-shadow" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Qty stepper */}
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="cursor-pointer h-11 w-12 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                −
                            </button>
                            <span className="w-12 text-center text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                                disabled={!inStock}
                                className="cursor-pointer h-11 w-12 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
                            >
                                +
                            </button>
                        </div>

                        {/* Add to cart */}
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                            <Button
                                size="lg"
                                disabled={!inStock || !product.isActive}
                                className="flex-1 gap-2 w-36 rounded-xl font-semibold h-11 text-sm bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-all duration-200 shadow-md hover:shadow-lg"
                                onClick={addToCartHandler}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                {!inStock ? t("outOfStock") : t("addToCart")}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="mt-6">
                    <Tabs defaultValue="description">
                        <TabsList className="w-full justify-start gap-1 border-b border-zinc-100 dark:border-zinc-800 bg-transparent rounded-none h-auto pb-0 mb-8">
                            {(["description", "specifications", "reviews"] as const).map((tab) => (
                                <TabsTrigger key={tab} value={tab} className="cursor-pointer">
                                    {t(tab)}
                                    {tab === "reviews" && (
                                        <span className="ml-1.5 text-xs text-zinc-400">
                                            ({product.numReviews ?? 0})
                                        </span>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="description" className="mt-0">
                            <div className="max-w-3xl bg-background dark:bg-zinc-900 rounded-xl p-2 mx-auto">
                                <p className="text-zinc-600 text-center dark:text-zinc-400 leading-relaxed text-base">
                                    {product.description}
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="specifications" className="mt-0">
                            {specs.length === 0 ? (
                                <p className="text-zinc-400 text-sm ">{t("noSpecs")}</p>
                            ) : (
                                <div className="max-w-2xl divide-y mx-auto 
                                bg-background
                                 divide-zinc-100 dark:divide-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                                    {specs.map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex items-center px-5 py-3.5 dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <span className="w-40 shrink-0 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                                {key}
                                            </span>
                                            <span className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-0">
                            {!product.reviews || product.reviews.length === 0 ? (
                                <div className="text-center py-12">
                                    <Star className="mx-auto h-10 w-10 text-zinc-200 dark:text-zinc-700 mb-3" />
                                    <p className="text-zinc-400 text-sm">{t("noReviews")}</p>
                                </div>
                            ) : (
                                <div className="space-y-5 max-w-3xl">
                                    <div className="flex items-center gap-6 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                        <div className="text-center">
                                            <p className="text-5xl font-extrabold text-zinc-900 dark:text-zinc-50">
                                                {(product.rating ?? 0).toFixed(1)}
                                            </p>
                                            <div className="flex justify-center mt-1 gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn(
                                                            "h-3.5 w-3.5",
                                                            i < Math.round(product.rating ?? 0)
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-1">
                                                {product.numReviews} {t("reviews")}
                                            </p>
                                        </div>
                                    </div>

                                    {product.reviews.map(
                                        (r: {
                                            _id: string;
                                            name: string;
                                            rating: number;
                                            comment: string;
                                            createdAt: string;
                                        }) => (
                                            <div
                                                key={r._id}
                                                className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                                {r.name.slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                                                {r.name}
                                                            </p>
                                                            <p className="text-xs text-zinc-400">
                                                                {new Date(r.createdAt).toLocaleDateString(
                                                                    locale === "fa" ? "fa-IR" : "en-US",
                                                                    {
                                                                        year: "numeric",
                                                                        month: "short",
                                                                        day: "numeric",
                                                                    }
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-0.5 mt-0.5">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={cn(
                                                                    "h-3.5 w-3.5",
                                                                    i < r.rating
                                                                        ? "fill-amber-400 text-amber-400"
                                                                        : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                    {r.comment}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
