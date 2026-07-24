"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useCart } from "@/hooks/useCart";
import OrderSummary from "@/components/checkout/OrderSummary";
import Link from "next/link";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { Button } from "@/components/ui/button";
import { ShippingAddressInput } from "@/services/orderServices";
import { useCreateOrder } from "@/hooks/useOrder";
import { useRouter } from "next/router";

// ─── main ────────────────────────────────────────────────────
export default function CheckoutPage() {

    // ─── states ──────────────────────────────────────────────
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ─── using Locale ────────────────────────────────────────
    const locale = useLocale();

    // ─── using cart data ─────────────────────────────────────
    const { items: cartItems } = useCart()

    // ─── translations ────────────────────────────────────────
    const t = useTranslations("checkout");
    const v = useTranslations("validation");

    // ─── form  ───────────────────────────────────────────────

    // ─── Zod Schema
    const checkoutSchema = z.object({
        fullName: z.string().min(2, v("fullNameMin")),
        email: z.email(v("invalidEmail")),
        province: z.string().min(1, v("required")),
        city: z.string().min(2, v("required")),
        address: z.string().min(10, v("addressMin")),
        postalCode: z.string().regex(/^\d{10}$/, v("postalCodeMin")),
        delivery: z.enum(["express", "normal"]),
    });

    type CheckoutValues = z.infer<typeof checkoutSchema>;
    const form = useForm<CheckoutValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            fullName: "",
            email: "",
            province: "",
            city: "",
            address: "",
            postalCode: "",
            delivery: "normal",
        },
    });

    // ─── consts  ─────────────────────────────────────────────
    const DELIVERY_OPTIONS = [
        { id: "express", label: t("express"), price: 10 },
        { id: "normal", label: t("normal"), price: 0 },
    ];
    const subTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const formatPrice = (n: number) => {
        return new Intl.NumberFormat(locale).format(n) + " " + t("dollar");
    };
    const deliveryValue = form.watch("delivery");
    const deliveryCost = DELIVERY_OPTIONS.find(d => d.id === deliveryValue)?.price ?? 0;
    const total = subTotal + deliveryCost;

    // ─── handlers  ───────────────────────────────────────────
    const { mutate: createOrder, isPending } = useCreateOrder();
    function submitHandler(formData: ShippingAddressInput) {

        const items = cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
        }));
        setIsSubmitting(true);
        createOrder(
            { items, shippingAddress: formData },
            {
                onSuccess: (order) => {
                    toast.success("در حال انتقال به درگاه شاپرک...");
                    console.log(order)
                    setIsSubmitting(false);

                    form.reset()
                    // router.push(`/orders/${order._id}`); // or wherever confirmation lives
                },
                onError: (error) => {

                    setIsSubmitting(false);
                    // show toast/error message
                },
            }
        );

        // Redirect to Shaparak gateway (simulated)


    }

    return (
        <div className=" text-right min-h-screen bg-background">

            {/* ── Top Bar ── */}
            <div className="border-b border-border px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="w-3.5 h-3.5 text-gold" />
                        <span>{t("securePayment")}</span>
                    </div>
                    <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        {t("backToStore")}
                    </Link>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-10">

                {/* ── Page Title ── */}
                <div className="mb-10">
                    <p className="label-luxury mb-2">{t("finalPayment")}</p>
                    <h1 className="text-3xl font-bold">{t("completeOrder")}</h1>
                    <div className="divider-gold w-24 mt-3" />
                </div>

                <form onSubmit={form.handleSubmit(
                    (data) => {
                        console.log("VALID", data);
                        submitHandler(data);
                    },
                    (errors) => {
                        console.log("ERRORS", errors);
                    }
                )}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <CheckoutForm formatPrice={formatPrice} DELIVERY_OPTIONS={DELIVERY_OPTIONS} form={form} />
                        <OrderSummary cartItems={cartItems} deliveryCost={deliveryCost} formatPrice={formatPrice} isSubmitting={isSubmitting} total={total} subTotal={subTotal} />
                    </div>
                </form>
            </main>
        </div >
    );
}