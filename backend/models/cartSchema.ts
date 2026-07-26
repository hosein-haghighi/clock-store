import mongoose, { Schema, Types, Document } from "mongoose";

export interface ICartItem {
    productId: Types.ObjectId;
    variantId: Types.ObjectId;
    quantity: number;
    selectedColor?: {
        name: string;
        hex: string;
    };
}

export interface ICart extends Document {
    userId: Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        variantId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        selectedColor: {
            name: String,
            hex: String,
        }
    },
    { _id: false }
);

const CartSchema = new Schema<ICart>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        items: {
            type: [CartItemSchema],
            default: [],
        },
    },
    { timestamps: true }
);

export const Cart =
    (mongoose.models.Cart as mongoose.Model<ICart>) || mongoose.model<ICart>("Cart", CartSchema);