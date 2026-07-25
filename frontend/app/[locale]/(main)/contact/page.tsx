"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Clock, MapPin, Phone, Mail, Send, MessageCircle } from "lucide-react";
import { useState } from "react";
import { FaInstagram } from "react-icons/fa";



import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Zod Schema ──────────────────────────────────────────────
const contactSchema = z.object({
    fullName: z
        .string()
        .min(3, "نام باید حداقل ۳ کاراکتر باشد")
        .max(60, "نام نباید بیشتر از ۶۰ کاراکتر باشد"),
    email: z.string().email("ایمیل معتبر وارد کنید"),
    phone: z
        .string()
        .regex(/^(\+98|0)?9\d{9}$/, "شماره موبایل معتبر وارد کنید")
        .optional()
        .or(z.literal("")),
    subject: z.enum(["purchase", "repair", "warranty", "wholesale", "other"]),
    message: z
        .string()
        .min(20, "پیام باید حداقل ۲۰ کاراکتر باشد")
        .max(1000, "پیام نباید بیشتر از ۱۰۰۰ کاراکتر باشد"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

// ─── Info Cards Data ──────────────────────────────────────────
const contactInfo = [
    {
        name: "address",
        icon: MapPin,
        title: "آدرس",
        lines: [
            { text: "تهران، خیابان ولیعصر، نرسیده به میدان ونک", href: '' },
            { text: "پاساژ ساعت طلایی، واحد ۱۱", href: '' }
        ],
        badge: "حضوری",
    },
    {
        name: "phone",

        icon: Phone,
        title: "تلفن تماس",
        lines: [
            { text: "۰۲۱–۸۸۵۵۴۴۳۳", href: "tel:+982188554433" }
            , { text: "۰۹۱۲–۳۴۵–۶۷۸۹", href: "tel:+989123456789" }
        ],
        badge: "پاسخگو ۹–۲۱",
    },
    {
        name: "email",
        icon: Mail,
        title: "ایمیل",
        lines: [
            { text: "info@kronosaati.ir", href: "mailto:info@kronosaati.ir" },
            { text: "support@kronosaati.ir", href: "mailto:support@kronosaati.ir" }
        ],
        badge: "۲۴ ساعته",
    },
    {
        name: "clock",
        icon: Clock,
        title: "ساعت کاری",
        lines: [{ text: "شنبه تا چهارشنبه: ۱۰:۰۰ – ۲۱:۰۰", href: '' }, { text: "پنجشنبه: ۱۰:۰۰ – ۱۸:۰۰" }, { text: "جمعه: تعطیل", href: '' }],
        badge: "فروشگاه",
    },
];

const subjectLabels: Record<string, string> = {
    purchase: "خرید ساعت",
    repair: "تعمیر و سرویس",
    warranty: "گارانتی",
    wholesale: "خرید عمده",
    other: "سایر",
};

// ─── Page Component ───────────────────────────────────────────
export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            message: "",
        },
    });

    async function onSubmit(values: ContactFormValues) {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((r) => setTimeout(r, 1500));
        toast.success("we received your message and will contact you shotly"
        );
        form.reset();
        setIsSubmitting(false);
    }

    return (


        <div className="direction-reverse text-right">


            <main className=" px-6 py-16">
                {/* ── Hero Section ── */}
                <div className="text-center mb-20">

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        با ما در تماس باشید
                    </h1>
                    <div className="gold-line w-32 mx-auto mb-6" />
                    <p className="text-[#888] max-w-xl mx-auto text-base leading-relaxed">
                        تیم متخصص کرونو ساعتی آماده پاسخگویی به تمام سؤالات شما درباره ساعت‌های لوکس،
                        تعمیرات و گارانتی است.
                    </p>
                </div>

                {/* ── Info Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 bg">
                    {contactInfo.map(({ icon: Icon, title, lines, badge, name }) => (
                        <Card
                            key={name}


                        >
                            <CardHeader className="p-0 block-flex flex-col gap-4 ">

                                <div className="flex justify-between">
                                    <span>
                                        <Icon className="w-5 h-5 text-[#c9a84c]" />
                                    </span>
                                    <span>
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] border-[#c9a84c44] text-[#c9a84c] bg-[#c9a84c0a]"
                                        >
                                            {badge}
                                        </Badge>
                                    </span>
                                </div>
                                <CardTitle  >
                                    <h5>{title}</h5>
                                </CardTitle>
                            </CardHeader>
                            {lines.map(({ text, href }, index) => {

                                const tag = href != "" ?

                                    <a href={href} className="text-muted-foreground text-sm  hover:underline">
                                        {text}
                                    </a>
                                    :
                                    <p key={text} className="text-muted-foreground text-sm">
                                        {text}
                                    </p>
                                return (
                                    <CardContent className="flex flex-col" key={index}>
                                        {tag}
                                    </CardContent>

                                )

                            })}
                        </Card>
                    ))}
                </div>

                {/* ── Form + Map Section ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form */}
                    <Card className="lg:col-span-3 ">
                        <CardHeader className="m-0 p-2 gap-2">
                            <CardTitle>
                                <h5  >ارسال پیام</h5>
                            </CardTitle>

                            <p className="text-[#666] text-sm">
                                فرم زیر را تکمیل کنید؛ در کمتر از ۲۴ ساعت پاسخ می‌دهیم.
                            </p>
                        </CardHeader>


                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Full Name */}
                                <Controller
                                    control={form.control}
                                    name="fullName"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel className="text-[#aaa] text-sm">نام و نام‌خانوادگی *

                                            </FieldLabel>

                                            <Input placeholder="علی محمدی" {...field} className="rounded-xl h-11" />

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                                {/* Email */}
                                <Controller
                                    control={form.control}
                                    name="email"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel className="text-[#aaa] text-sm">ایمیل *</FieldLabel>

                                            <Input
                                                placeholder="ali@example.com"
                                                type="email"
                                                {...field}
                                                className="rounded-xl h-11"
                                            />

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Phone */}
                                <Controller
                                    control={form.control}
                                    name="phone"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel className="text-[#aaa] text-sm">شماره موبایل</FieldLabel>

                                            <Input
                                                placeholder="09123456789"
                                                type="tel"
                                                {...field}
                                                className="rounded-xl h-11"
                                            />

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                                {/* Subject */}
                                <Controller
                                    control={form.control}
                                    name="subject"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel className="text-[#aaa] text-sm">موضوع *</FieldLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} >

                                                <SelectTrigger >
                                                    <SelectValue placeholder="انتخاب کنید" />
                                                </SelectTrigger>

                                                <SelectContent side={"bottom"}>
                                                    {Object.entries(subjectLabels).map(([val, label]) => (
                                                        <SelectItem key={val} value={val}  >
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>

                            {/* Message */}
                            <Controller
                                control={form.control}
                                name="message"
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel className="text-[#aaa] text-sm">پیام *</FieldLabel>

                                        <Textarea
                                            placeholder="پیام خود را اینجا بنویسید..."
                                            rows={5}
                                            {...field}
                                            className="rounded-xl resize-none"
                                        />

                                        <div className="flex justify-between">
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                            <span className="text-[#444] text-xs mr-auto">
                                                {field.value?.length ?? 0}/1000
                                            </span>
                                        </div>
                                    </Field>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="submit-btn w-full h-12 rounded-xl text-base"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                                        </svg>
                                        در حال ارسال...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Send className="w-4 h-4" />
                                        ارسال پیام
                                    </span>
                                )}
                            </Button>
                        </form>

                    </Card>

                    {/* Sidebar */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Map placeholder */}
                        <div className="border border-[#1e1e1e] rounded-2xl overflow-hidden bg-[#0f0f0f] flex-1 min-h-[220px] relative">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.3!2d51.4086!3d35.7575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQ1JzI3LjAiTiA1McKwMjQnMzEuMCJF!5e0!3m2!1sen!2s!4v1234567890"
                                className="w-full h-full min-h-[220px] grayscale opacity-70"
                                style={{ border: 0, filter: "hue-rotate(180deg) brightness(0.7)" }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="موقعیت فروشگاه"
                            />
                            <div className="absolute bottom-3 right-3 bg-[#0a0a0a]/90 border border-[#c9a84c44] rounded-lg px-3 py-1.5 text-xs text-[#c9a84c] backdrop-blur-sm">
                                📍 تهران، ولیعصر
                            </div>
                        </div>

                        {/* Social & Quick Contact */}
                        <Card>
                            <h5 className="   uppercase tracking-widest">
                                شبکه‌های اجتماعی
                            </h5>

                            <a
                                href="#"
                                className="flex items-center gap-3 p-3 rounded-xl   border      transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                                    <FaInstagram className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className=" ">
                                        اینستاگرام
                                    </p>
                                    <p className="text-xs text-[#555] ltr">@kronosaati</p>
                                </div>
                            </a>

                            <a
                                href="#"
                                className="flex items-center gap-3 p-3 rounded-xl  ] border"
                            >
                                <div className="w-8 h-8 rounded-lg bg-[#29a71a] flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium ltr ">
                                        واتساپ
                                    </p>
                                    <p className="text-xs text-[#555] ltr">۰۹۱۲–۳۴۵–۶۷۸۹</p>
                                </div>
                            </a>

                        </Card>

                        {/* Response time */}
                        <div className="border border-[#c9a84c22] rounded-2xl p-5 bg-[#c9a84c08]">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
                                <span className="text-[#c9a84c] text-sm font-medium">آنلاین</span>
                            </div>
                            <p className="text-[#888] text-sm leading-6">
                                میانگین زمان پاسخ ما <span className="font-semibold">کمتر از ۲ ساعت</span> در
                                ساعات کاری است.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="border-t border-[#1e1e1e] py-8 mt-16">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[#444] text-sm">© ۱۴۰۳ کرونو ساعتی. تمامی حقوق محفوظ است.</p>
                    <div className="gold-line w-24 hidden sm:block" />
                    <p className="text-[#444] text-xs">طراحی با ❤️ برای علاقه‌مندان ساعت</p>
                </div>
            </footer>
        </div>

    );
}
