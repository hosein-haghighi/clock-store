import mongoose, { Schema, Types, Document } from "mongoose";

export interface IOrderItem {
    productId: Types.ObjectId;

    title: string;
    image: string;

    price: number;
    quantity: number;

    selectedColor?: string;
    selectedSize?: string;
}

export interface IShippingAddress {
    fullName: string;
    city: string;
    address: string;
    postalCode?: string;
}

export interface IPaymentResult {
    gateway: string;

    authority?: string;
    refId?: string;

    cardPan?: string;

    paidAt?: Date;
}

export interface IOrder extends Document {
    userId: Types.ObjectId;

    items: IOrderItem[];

    shippingAddress: IShippingAddress;

    paymentMethod: "shaparak";

    paymentResult?: IPaymentResult;

    itemsPrice: number;
    shippingPrice: number;
    totalPrice: number;

    isPaid: boolean;
    paidAt?: Date;

    isDelivered: boolean;
    deliveredAt?: Date;

    status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

    trackingCode?: string;

    createdAt: Date;
    updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },

        image: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        selectedColor: {
            type: String,
            trim: true,
        },

    },

);

const shippingAddressSchema = new Schema<IShippingAddress>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },


        city: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            required: true,
            trim: true,
        },

        postalCode: {
            type: String,
            trim: true,
        },
    },
    {
        _id: false,
    }
);

const paymentResultSchema = new Schema<IPaymentResult>(
    {
        gateway: {
            type: String,
            trim: true,
        },

        authority: {
            type: String,
            trim: true,
        },

        refId: {
            type: String,
            trim: true,
        },

        cardPan: {
            type: String,
            trim: true,
        },

        paidAt: {
            type: Date,
        },
    },
    {
        _id: false,
    }
);

const orderSchema = new Schema<IOrder>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items: IOrderItem[]) => items.length > 0,
                message: "Order must contain at least one item",
            },
        },

        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: ["shaparak"],
            default: "shaparak",
            required: true,
        },

        paymentResult: {
            type: paymentResultSchema,
        },

        itemsPrice: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        shippingPrice: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        isPaid: {
            type: Boolean,
            default: false,
        },

        paidAt: {
            type: Date,
        },

        isDelivered: {
            type: Boolean,
            default: false,
        },

        deliveredAt: {
            type: Date,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },

        trackingCode: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

orderSchema.index({ userId: 1 });

orderSchema.index({ status: 1 });

orderSchema.index({
    status: 1,
    createdAt: -1,
});

const Order =
    (mongoose.models.Order as mongoose.Model<IOrder>) ||
    mongoose.model<IOrder>("Order", orderSchema);

export default Order;