export function formatOrderDate(dateStr: string, locale: string) {
    if (locale === "fa") {
        // Persian locale → Jalali (Solar Hijri) calendar, Farsi digits
        return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(new Date(dateStr));
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(dateStr));
}