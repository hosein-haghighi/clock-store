"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Package } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProductType } from "@/types/product";



interface ProductCardProps {
  product: ProductType;
}
export function ProductCard({ product }: ProductCardProps) {

  // cheapest Color on the board //
  const mostDiscountPercentAndIndex = product.variants.reduce(
    (acc, variant, index) => {
      if (!variant?.discountPrice) return acc;

      const percent =
        ((variant.price - variant.discountPrice) / variant.price) * 100;

      return percent > acc[0] ? [percent, index] : acc;
    },
    [0, -1]
  );
  const ItemIndex = mostDiscountPercentAndIndex[1] < 0 ? 0 :
    mostDiscountPercentAndIndex[1]
  const stock = product.variants[ItemIndex].stock
  const price = product.variants[ItemIndex].price
  const discountPrice = product.variants[ItemIndex]?.discountPrice ?? null
  const hasDiscount = !!discountPrice
  const discountPercent = hasDiscount ? mostDiscountPercentAndIndex[0].toFixed(0) : null
  //_________________________________________________________________________//

  const src = `${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`;
  return (
    <Link href={`/${product.slug}`} className="p-0 pt-2" >
      <Card className="group flex flex-col  justify-center overflow-hidden 
      p-0
      rounded-none border w-full h-96 gap-0 border-zinc-200 bg-white  transition-all duration-300 hover:shadow-xl hover:inset-shadow-xl cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 pt-0 py-0 m-0">
        {/* Image / Placeholder */}

        <div className="relative h-60  w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {product.images.length > 0 ? (
            <img
              src={src}
              alt={product.title}
              height={64}
              className="h-full  w-full object-contain transition-transform duration-500 "
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-16 w-16 text-zinc-300 dark:text-zinc-600" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {hasDiscount && (
              <Badge className="bg-rose-500 text-white hover:bg-rose-600 text-xs font-semibold">
                {discountPercent}%
              </Badge>
            )}
            {!product.isActive && (
              <Badge variant="secondary" className="text-xs">
                Unavailable
              </Badge>
            )}
          </div>

          {/* Stock warning */}
          {stock <= 3 && stock > 0 && (
            <div className="absolute bottom-2 right-2">
              <Badge
                variant="outline"
                className="border-amber-400 bg-amber-50 text-amber-700 text-xs dark:bg-amber-950 dark:text-amber-300"
              >
                Only {stock} left
              </Badge>
            </div>
          )}

          {stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <span className="rounded-full bg-white/90 px-4 py-1 text-sm font-semibold text-zinc-800 dark:bg-zinc-900/90 dark:text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Header */}
        <CardHeader className="pb-1 pt-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base font-semibold tracking-tight ">
              {product.title}
            </CardTitle>

          </div>

          {/* Rating */}
          <div className="flex items-center  gap-1.5 pt-0.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.round(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                    }`}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              ({product.numReviews} reviews)
            </span>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 pb-3">

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {discountPrice ?? price}
            </span>
            {hasDiscount && (
              <span className="text-sm text-zinc-400 line-through">
                ${price}
              </span>
            )}
          </div>
          <div className="flex justify-between">
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Brand: <span className="font-medium capitalize">{product.brand}</span>
            </p>
            <Badge
              variant="secondary"
              className="shrink-0 capitalize text-xs font-medium"
            >
              {product.category}
            </Badge></div>
        </CardContent>

        {/* Footer */}
        {/* <CardFooter className="pt-0 pb-4">
        <Button
          className="w-full gap-2 rounded-xl font-semibold transition-all duration-200"
          disabled={stock === 0 || !product.isActive}
        >
          <ShoppingCart className="h-4 w-4" />
          {stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter> */}

      </Card> </Link>
  );
}
