import mongoose, { Schema, Types, Document } from "mongoose";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IReview {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    name: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

export interface IVariant {
    color: { name: string; hex: string };
    price: number;
    discountPrice?: number;
    stock: number;
    _id: Types.ObjectId;
}

export interface IProduct extends Document {
    title: string,
    description: string
    slug: string;
    brand: string;
    watchModel: string;
    images: string[];
    updateRating(): void;
    variants: Types.DocumentArray<IVariant>;
    category: "luxury" | "sport" | "casual" | "smart" | "classic";
    gender: "men" | "women" | "unisex";
    specifications: Map<string, string>;
    reviews?: IReview[];
    rating?: number;
    numReviews?: number;
    isFeatured: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const reviewSchema = new Schema<IReview>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

const variantSchema = new Schema<IVariant>(
    {
        color: {
            name: { type: String, required: true },
            hex: { type: String, required: true },
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        discountPrice: {
            type: Number,
            validate: {
                validator: function (this: IVariant, val: number) {
                    return val < this.price;
                },
                message: "discountPrice must be less than price",
            },
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
    },
    { _id: true }
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const productSchema = new Schema<IProduct>(
    {
        title: {
            type: String, required: true, trim: true
        },

        description: {
            type: String, required: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        brand: {
            type: String,
            required: true,
            trim: true,
        },
        watchModel: {
            type: String,
            required: true,
            trim: true,
        },

        images: {
            type: [String],
            required: true,
            validate: {
                validator: (v: string[]) => v.length > 0,
                message: "حداقل یک تصویر الزامی است",
            },
        },
        variants: {
            type: [variantSchema],
            required: true,
            validate: {
                validator: (v: IVariant[]) => v.length > 0,
                message: "At least one variant is required",
            },
        },
        category: {
            type: String,
            enum: ["luxury", "sport", "casual", "smart", "classic"],
            required: true,
        },
        gender: {
            type: String,
            enum: ["men", "women", "unisex"],
            required: true,
        },
        specifications: {
            type: Map,
            of: String,
            default: {},
        },
        reviews: {
            type: [reviewSchema],
            default: [],
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

productSchema.index({ brand: 1, category: 1 });
productSchema.index({ "variants.price": 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index(
    { title: "text", brand: "text", watchModel: "text" },
    { weights: { title: 3, brand: 2, watchModel: 1 } }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

// lowest effective price across all variants
productSchema.virtual("finalPrice").get(function () {
    return Math.min(
        ...this.variants.map((v) => v.discountPrice ?? v.price)
    );
});

// true if any variant has stock
productSchema.virtual("inStock").get(function () {
    return this.variants.some((v) => v.stock > 0);
});

// ─── Methods ──────────────────────────────────────────────────────────────────

productSchema.methods.updateRating = function () {
    if (this.reviews.length === 0) {
        this.rating = 0;
        this.numReviews = 0;
    } else {
        const sum = this.reviews.reduce((acc: number, r: IReview) => acc + r.rating, 0);
        this.rating = parseFloat((sum / this.reviews.length).toFixed(1));
        this.numReviews = this.reviews.length;
    }
};

// ─── Model ────────────────────────────────────────────────────────────────────
const Product = (mongoose.models.Product as mongoose.Model<IProduct>) ||
    mongoose.model<IProduct>("Product", productSchema);
export default Product;