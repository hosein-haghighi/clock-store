import type { Request } from "express";

import type { ResType } from "../types/res.js";
import Product from "../models/productSchema.js";
import Order from "../models/orderSchema.js";
import type { AuthRequest } from "./cartController.js";

type requestItemType = {
    productId: string,
    variantId: string,
    quantity: number
}
// 1 post /
export const createOrder = async (req: AuthRequest, res: any) => {
    try {
        const userId = req.user._id;
        const { items, shippingAddress } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                status: "fail",
                message: "No items",
            });
        }

        const orderItems = [];

        for (const item of items as requestItemType[]) {

            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({
                    status: "fail",
                    message: "Product not found",
                });
            }
            const variant = product.variants.find(v => v._id.equals(item.variantId));
            if (!variant) {
                return res.status(404).json({
                    status: "fail",
                    message: "variant not found",
                });
            }
            if (variant.stock < item.quantity) {
                return res.status(400).json({
                    status: "fail",
                    message: "Not enough stock",
                });
            }
            const minPrice = variant.discountPrice ?? variant.price;
            orderItems.push({
                productId: product._id,
                title: product.title,
                image: product.images[0] ?? "",
                price: minPrice,
                quantity: item.quantity,
                selectedColor: variant.color.name,
            });
        }

        const itemsPrice = orderItems.reduce(
            (acc, i) => acc + i.price * i.quantity,
            0
        );

        const shippingPrice = itemsPrice > 100 ? 0 : 10;
        const totalPrice = itemsPrice + shippingPrice;

        const order = await Order.create({
            userId,
            items: orderItems,
            shippingAddress,
            itemsPrice,
            shippingPrice,
            totalPrice,
            paymentMethod: "shaparak",
            status: "pending",
        });

        return res.status(201).json({
            status: "success",
            data: order,
        });
    } catch (err: any) {
        return res.status(500).json({
            status: "fail",
            message: err.message,
        });
    }
};
// 2 get /
export const getMyOrders = async (req: any, res: any) => {
    try {
        const orders = await Order.find({
            userId: req.user._id,
        }).sort({ createdAt: -1 });

        res.json({
            status: "success",
            data: orders,
        });
    } catch (err: any) {
        res.status(500).json({
            status: "fail",
            message: err.message,
        });
    }
};
// 3 get single 
export const getOrderById = async (req: any, res: any) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                status: "fail",
                message: "Order not found",
            });
        }

        // security check
        if (
            order.userId.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                status: "fail",
                message: "Forbidden",
            });
        }

        res.json({
            status: "success",
            data: order,
        });
    } catch (err: any) {
        res.status(500).json({
            status: "fail",
            message: err.message,
        });
    }
};
// 4 delete  / 
export const cancelOrder = async (req: any, res: any) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                status: "fail",
                message: "Order not found",
            });
        }

        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: "fail",
                message: "Forbidden",
            });
        }

        if (order.status !== "pending") {
            return res.status(400).json({
                status: "fail",
                message: "Cannot cancel processed order",
            });
        }

        order.status = "cancelled";
        await order.save();

        res.json({
            status: "success",
            message: "Order cancelled",
        });
    } catch (err: any) {
        res.status(500).json({
            status: "fail",
            message: err.message,
        });
    }
};
// 5 patch 
export const updateOrderStatus = async (req: any, res: any) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                status: "fail",
                message: "Order not found",
            });
        }

        order.status = status;

        if (status === "delivered") {
            order.isDelivered = true;
            order.deliveredAt = new Date();
        }

        await order.save();

        res.json({
            status: "success",
            data: order,
        });
    } catch (err: any) {
        res.status(500).json({
            status: "fail",
            message: err.message,
        });
    }
};