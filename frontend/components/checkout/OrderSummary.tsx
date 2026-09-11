"use client";
import {
    ShoppingBag,
    Clock, Shield, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { DetailedCartItemType } from "@/hooks/useCart";

type PropsType = {
    cartItems: DetailedCartItemType[],
    isSubmitting: boolean
    deliveryCost: number,
    total: number,
    subTotal: number,
    formatPrice: (n: number) => string
}

const OrderSummary = ({ cartItems, isSubmitting, formatPrice, deliveryCost, total, subTotal }: PropsType) => {
    const t = useTranslations("checkout");
    return (

        <div className="lg:col-span-5 space-y-4">
            {/* Cart items */}
            <Card className="sticky top-6">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-gold" />
                        <h5>{t("orderSummary")}</h5>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                    {/* Items */}
                    <div className="space-y-3">
                        {cartItems.map(item => (
                            <div key={item.slug} className="flex items-center justify-center  gap-3 ">
                                <div className="w-20 h-20 rounded-lg overflow-hidden border border-border ">
                                    <img
                                        src={!!item.image ? `/uploads${item.image}` : undefined}
                                        alt={item.slug}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="flex-1 text-center min-w-0 " >
                                    <p className="text-s-medium ">{item.title}</p>
                                    <div className="flex gap-4 text-center justify-center items-center ">
                                        <p className="text-muted-foreground">{item.brand}</p>
                                        <Badge variant="outline" className="mt-1">×{item.quantity}</Badge></div>
                                </div>
                                <p className="text-sm font-semibold text-gold shrink-0">
                                    {formatPrice(item.price)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    {/* Discount Code */}
                    {/* <div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                                            <Tag className="w-3 h-3" /> کد تخفیف
                                        </p>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="KRONO10"
                                                value={discountInput}
                                                onChange={e => setDiscountInput(e.target.value)}
                                                disabled={discountApplied}
                                                className="ltr text-left placeholder:text-right text-sm h-9"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={applyDiscount}
                                                disabled={discountApplied || !discountInput.trim()}
                                                className="shrink-0 h-9 text-xs"
                                            >
                                                {discountApplied ? "✓ اعمال شد" : "اعمال"}
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator /> */}

                    {/* Price Breakdown */}
                    <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>{formatPrice(subTotal)}</span>
                            <span>{t("productsTotal")}</span>
                        </div>
                        {/* {discountApplied && (
                                            <div className="flex justify-between text-emerald-500">
                                                <span>− {formatPrice(discount)}</span>
                                                <span>تخفیف (۱۰٪)</span>
                                            </div>
                                        )} */}
                        <div className="flex justify-between text-muted-foreground">
                            <span>{deliveryCost === 0 ? t("free") : formatPrice(deliveryCost)}</span>
                            <span>{t("deliveryCost")}</span>
                        </div>

                        <Separator />

                        <div className="flex justify-between font-bold text-base pt-1">
                            <span className="text-gold">{formatPrice(total)}</span>
                            <span>{t("total")}</span>
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                                </svg>
                                {t("loadingToPayment")}...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4" />
                                {t("pay")}
                            </span>
                        )}
                    </Button>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-4 pt-1">
                        {[
                            { icon: Shield, label: t("secure") },
                            { icon: Clock, label: t("support") },
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Icon className="w-3 h-3 text-gold" />
                                {label}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default OrderSummary