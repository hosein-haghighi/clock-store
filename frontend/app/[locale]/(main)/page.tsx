import ProductsPageClient from "./ProductsPageClient";



interface PageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getInitialProducts(
    searchParams: Record<string, string | string[] | undefined>
) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        if (typeof value === "string") {
            params.set(key, value);
        }
    });

    const res = await fetch(
        `${process.env.BACKEND_URL}/api/v1/products?${params.toString()}`,
        {
            next: {
                revalidate: 600,
            },
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch products");
    }

    return res.json();
}

export default async function ProductsPage({
    searchParams,
}: PageProps) {
    const params = await searchParams;

    const data = await getInitialProducts(params);

    return (
        <ProductsPageClient
            initialProducts={data.data ?? []}
            initialFilters={params}
        />
    );
}