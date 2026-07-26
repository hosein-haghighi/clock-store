import type { Response, Request, RequestHandler } from "express";
import type { ResType } from "../types/res.js";
import { Cart, type ICartItem } from "../models/cartSchema.js";
import Product from "../models/productSchema.js";
// types/authRequest.ts
import type { Types } from "mongoose";
import { getErrorMessage } from "../utils/errorHandler.js";

export interface AuthRequest extends Request {
    user: {
        _id: Types.ObjectId;
        role?: string;
    };
}
// helper: populate cart items با اطلاعات به‌روز از product
const populateCartItems = async (items: ICartItem[]) => {
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    return items.map((item) => {
        const product = productMap.get(item.productId.toString());
        if (!product) return null;

        const variant = product.variants.id(item.variantId);
        if (!variant) return null;
        return {
            productId: item.productId,
            variantId: variant._id,
            quantity: item.quantity,
            selectedColor: variant.color,
            // snapshot به‌روز از product:
            title: product.title,
            slug: product.slug,
            brand: product.brand,
            image: product.images[0],
            price: variant.price ?? 0,
            discountPrice: variant.discountPrice ?? null,
            stock: variant.stock ?? 0,
        };
    }).filter(Boolean);
};

// GET /api/cart
export const getCart: RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
    const typedRes = res as Response<ResType>;
    const userId = authReq.user._id;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
        return typedRes.status(200).json({
            status: "success",
            message: "Cart is empty",
            data: { items: [] },
        });
    }

    const populatedItems = await populateCartItems(cart.items);

    typedRes.status(200).json({
        status: "success",
        message: "Getting cart data was successful",
        data: { ...cart.toObject(), items: populatedItems },
    });
};

// POST /api/cart/items
export const addToCart: RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
    const typedRes = res as Response<ResType>;

    const userId = authReq.user._id;
    const { productId, variantId, quantity } = authReq.body;

    const product = await Product.findById(productId);
    if (!product) {
        return typedRes.status(404).json({ status: "fail", message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
        return typedRes.status(404).json({ status: "fail", message: "Variant not found" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }

    const existingItem = cart.items.find(
        (item) =>
            item.productId.toString() === productId &&
            item.variantId?.toString() === variantId
    );

    if (existingItem) {
        existingItem.quantity = Math.min(
            existingItem.quantity + quantity,
            variant.stock
        );
    } else {
        cart.items.push({
            productId: product._id,
            variantId: variant._id,
            quantity: Math.min(quantity, variant.stock),
        });
    }

    await cart.save();

    const populatedItems = await populateCartItems(cart.items);

    typedRes.status(200).json({
        status: "success",
        message: "Adding to cart was successful",
        data: { ...cart.toObject(), items: populatedItems },
    });
};

// PATCH /api/cart/items/:productId
export const updateCartItem: RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
    const typedRes = res as Response<ResType>;
    const userId = authReq.user._id;
    const { productId } = authReq.params;
    const { variantId, quantity } = authReq.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        return typedRes.status(404).json({ status: "fail", message: "Cart not found" });
    }

    const item = cart.items.find(
        (i) =>
            i.productId.toString() === productId &&
            i.variantId?.toString() === variantId
    );
    if (!item) {
        return typedRes.status(404).json({ status: "fail", message: "Item not found" });
    }

    const product = await Product.findById(productId);
    const variant = product?.variants.id(variantId);

    item.quantity = Math.min(quantity, variant?.stock ?? quantity);
    await cart.save();

    const populatedItems = await populateCartItems(cart.items);

    typedRes.status(200).json({
        status: "success",
        message: "Updating the cart was successful",
        data: { ...cart.toObject(), items: populatedItems },
    });
};

// DELETE /api/cart/items/:productId
export const removeCartItem: RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
    const typedRes = res as Response<ResType>;
    const userId = authReq.user._id;
    const { productId } = authReq.params;
    const { variantId } = authReq.body;

    if (!variantId) {
        return typedRes.status(400).json({
            status: "fail",
            message: "please check the body for this pattern: variantId",
        });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        return typedRes.status(404).json({ status: "fail", message: "Cart not found" });
    }

    cart.items = cart.items.filter(
        (item) =>
            !(
                item.productId.toString() === productId &&
                item.variantId?.toString() === variantId
            )
    );

    await cart.save();

    const populatedItems = await populateCartItems(cart.items);

    typedRes.status(200).json({
        status: "success",
        message: "Removing the cart item was successful",
        data: { ...cart.toObject(), items: populatedItems },
    });
};

// DELETE /api/cart
export const clearCart: RequestHandler = async (req, res) => {

    const authReq = req as AuthRequest;
    const typedRes = res as Response<ResType>;

    const userId = authReq.user._id;

    await Cart.findByIdAndUpdate({ userId }, { $set: { items: [] } });

    res.status(200).json({ status: "success", message: "Cart cleared" });
};

// POST /api/cart/merge
export const mergeCart: RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
    const typedRes = res as Response<ResType>;
    try {
        const userId = authReq.user._id;
        const localItems: ICartItem[] = authReq.body.items ?? [];
        let dbCart = await Cart.findOne({ userId });
        if (!dbCart) {
            dbCart = new Cart({ userId, items: [] });
        }

        const getKey = (productId: string, variantId?: string) =>
            `${productId}-${variantId ?? "default"}`;

        // map از cart موجود در DB
        const map = new Map<string, ICartItem>();
        for (const item of dbCart.items) {
            map.set(getKey(item.productId.toString(), item.variantId?.toString()), item);
        }

        // fetch همه products یکبار
        const productIds = localItems.map((i) => i.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(products.map((p) => [p._id.toString(), p]));
        for (const localItem of localItems) {

            const product = productMap.get(localItem.productId.toString());
            if (!product) continue;

            const variant = product.variants.id(localItem.variantId);
            if (!variant) continue;

            const key = getKey(localItem.productId.toString(), localItem.variantId?.toString());
            const existing = map.get(key);

            const newQty = Math.min(
                (existing?.quantity ?? 0) + localItem.quantity,
                variant.stock
            );

            if (newQty <= 0) {
                map.delete(key);
                continue;
            }

            map.set(key, {
                productId: localItem.productId,
                variantId: variant._id,
                quantity: newQty,
            });
        }

        dbCart.items = Array.from(map.values());

        if (!dbCart.items.length) {
            await Cart.deleteOne({ userId });
            return typedRes.status(200).json({
                status: "success",
                data: { items: [] },
                message: "Cart is empty after merge",
            });
        }

        await dbCart.save();

        const populatedItems = await populateCartItems(dbCart.items);

        return typedRes.status(200).json({
            status: "success",
            data: { ...dbCart.toObject(), items: populatedItems },
            message: "Cart merged successfully",
        });
    } catch (error) {
        return typedRes.status(400).json({
            status: "fail",
            message: getErrorMessage(error),
        });
    }
};

// POST /api/cart/getDetails
export const getCartDetails: RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
    const typedRes = res as Response<ResType>;

    const items: ICartItem[] = authReq.body.items ?? [];

    if (!items.length) {
        return typedRes.status(200).json({
            status: "success",
            data: [],
            message: "The product with this id is not available",
        });
    }

    const populatedItems = await populateCartItems(items);

    return typedRes.status(200).json({
        status: "success",
        data: populatedItems,
        message: "The population of the cart was successful",
    });
};