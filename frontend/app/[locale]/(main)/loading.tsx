import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function Loading() {
    const t = useTranslations("product")
    return (
        <div className="min-h-screen dark:bg-zinc-950 inline-flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 ">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-zinc-900 dark:border-zinc-100 animate-spin" />
                </div>
                <p className="text-sm text-zinc-500 tracking-widest uppercase font-medium">
                    {t("loading")}
                </p>
            </div>
        </div>
    );
}
