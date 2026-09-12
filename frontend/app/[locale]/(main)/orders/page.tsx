// app/orders/page.tsx
"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMyOrders, useCancelOrder } from "@/hooks/useOrder";
import { formatOrderDate } from "@/lib/formatOrderDate";
import Link from "next/link";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
    productId: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
    selectedColor?: string;
    _id: string;
}

interface Order {
    _id: string;
    items: any[];
    totalPrice: number;
    status: OrderStatus;
    createdAt: string;
}

const statusStyles: Record<OrderStatus, string> = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    processing: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    shipped: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

// TEMP: backend sends selectedColor as a malformed stringified object.
// Fix at the source in createOrder controller; remove this once fixed.
function parseColorName(raw?: string): string | null {
    if (!raw) return null;
    const match = raw.match(/name:\s*'([^']+)'/);
    return match ? match[1] : raw;
}

function resolveImage(path: string) {
    if (!path) return "/placeholder-watch.jpg";
    return path.startsWith("http") ? path : `/api${path}`;
}

function OrderRow({ order }: { order: Order }) {
    const t = useTranslations("Orders");
    const locale = useLocale();
    const cancelOrder = useCancelOrder();
    const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
    const previewItems = order.items.slice(0, 3);

    return (
        <div className="group w-xs flex p-4  flex-col rounded-lg border border-border/60 bg-card transition-colors hover:border-border">
            <div className="flex flex-col gap-3  sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-xs tracking-wider text-muted-foreground" dir="ltr">
                        {order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="hidden text-muted-foreground/40 sm:inline">·</span>
                    <span className="text-xs text-muted-foreground">
                        {formatOrderDate(order.createdAt, locale)}
                    </span>
                </div>
                <Badge variant="outline" className={`w-fit ${statusStyles[order.status]}`}>
                    {t(`status.${order.status}`)}
                </Badge>
            </div>

            <Separator className="bg-border/60" />

            <div className="flex flex-col gap-3  sm:p-5">
                {previewItems.map((item) => {
                    const colorName = parseColorName(item.selectedColor);
                    return (
                        <div key={item._id} className="flex items-center gap-3 sm:gap-4">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted sm:h-14 sm:w-14">
                                <Image
                                    src={resolveImage(item.image)}
                                    alt={item.title}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm font-medium text-foreground">{item.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {colorName && `${colorName} · `}
                                    {t("qty", { count: item.quantity })}
                                </p>
                            </div>
                            <p className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                                ${(item.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    );
                })}
                {order.items.length > previewItems.length && (
                    <p className="text-xs text-muted-foreground">
                        {t("moreItems", { count: order.items.length - previewItems.length })}
                    </p>
                )}
            </div>

            <Separator className="bg-border/60 mt-auto " />

            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <p className="text-xs text-muted-foreground sm:text-sm">
                    {t("qty", { count: itemCount })} ·{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                        ${order.totalPrice.toFixed(2)}
                    </span>
                </p>
                <div className="flex gap-2">
                    {/* <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        {t("viewDetails")}
                    </Button> */}
                    {order.status === "pending" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={cancelOrder.isPending}
                            onClick={() => cancelOrder.mutate(order._id)}
                            className="flex-1 text-rose-400 hover:bg-rose-500/10 hover:text-rose-400 sm:flex-none"
                        >
                            {cancelOrder.isPending ? t("cancelling") : t("cancel")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    const t = useTranslations("Orders");
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 px-6 py-20 text-center">
            <p className="text-sm font-medium text-foreground">{t("noOrders")}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {t("noOrdersDescription")}
            </p>
            <Button className="mt-6" size="sm" asChild>
                <Link href="/">{t("browseCollection")}</Link>
            </Button>
        </div>
    );
}

export default function OrdersPage() {
    const t = useTranslations("Orders");
    const { data, isLoading, isError } = useMyOrders();
    const orders = data ?? [];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="mb-6 flex items-baseline justify-between sm:mb-8">
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {t("title")}
                </h1>
                {!isLoading && !isError && (
                    <span className="text-xs text-muted-foreground sm:text-sm">
                        {t("orderCount", { count: orders.length })}
                    </span>
                )}
            </div>

            {isLoading && (
                <div className="flex flex-col gap-3 sm:gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-40 animate-pulse rounded-lg border border-border/60 bg-card" />
                    ))}
                </div>
            )}

            {isError && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-6 py-10 text-center text-sm text-rose-400">
                    {t("loadError")}
                </div>
            )}

            {!isLoading && !isError && (orders.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3    gap-3 sm:gap-4">
                    {orders.map((order) => (
                        <OrderRow key={order._id} order={{
                            _id: order._id,
                            items: order.items,
                            totalPrice: order.totalPrice,
                            status: order.status,
                            createdAt: order.createdAt
                        }} />
                    ))}
                </div>
            ))}
        </div>
    );
}