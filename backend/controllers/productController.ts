import type { Request, RequestHandler } from "express";
import mongoose from "mongoose";
import type { ResType } from "../types/res.js";
import type { IProduct, IReview } from "../models/productSchema.js";
import Product from "../models/productSchema.js";
import { deleteTemp, moveTempToProducts } from "../utils/uploadsUtils.js";
import { getErrorMessage } from "../utils/errorHandler.js";

// ─── Helper ───────────────────────────────────────────────────────────────────

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// ─── Public Controllers ───────────────────────────────────────────────────────

/**
 * GET /api/products
 * فیلتر: brand, category, gender, minPrice, maxPrice, inStock, search
 * مرتب‌سازی: newest | price | -price | rating
 * صفحه‌بندی: page, limit
 */
export const getProducts: RequestHandler = async (req, res) => {
    try {
        const {
            brand,
            category,
            gender,
            minPrice,
            maxPrice,
            inStock,
            search,
            sort = "newest",
            page = "1",
            limit = "12",
        } = req.query;

        const filter: mongoose.QueryFilter<IProduct> = { isActive: true };

        if (brand) filter.brand = { $regex: String(brand), $options: "i" };
        if (category) filter.category = category as IProduct["category"];
        if (gender) filter.gender = gender as IProduct["gender"];
        if (inStock === "true") filter["variants.stock"] = { $gt: 0 };

        if (minPrice || maxPrice) {
            filter["variants.price"] = {};
            if (minPrice) filter["variants.price"].$gte = Number(minPrice);
            if (maxPrice) filter["variants.price"].$lte = Number(maxPrice);
        }

        if (search) filter.$text = { $search: search as string };

        const sortMap: Record<string, Record<string, 1 | -1>> = {
            newest: { createdAt: -1 },
            price: { "variants.price": 1 },
            "-price": { "variants.price": -1 },
            rating: { rating: -1 },
        };
        const sortOption = sortMap[sort as string] ?? sortMap.newest;

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum)
                .select("-reviews"),
            Product.countDocuments(filter),
        ]);

        res.json({
            message: "getting data was successful",
            status: "success",
            data: products,
            pagination: {
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                total: total,
            },
        });
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error), status: "fail" });
    }
};

/**
 * GET /api/products/featured
 * محصولات ویژه صفحه اصلی
 */
export const getFeaturedProducts: RequestHandler = async (req, res) => {

    try {
        const products = await Product.find({ isActive: true, isFeatured: true })
            .sort({ createdAt: -1 })
            .limit(8)
            .select("-reviews");

        res.json({ data: products, status: "success", message: "getting featured products was successful" });
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error), status: "fail" });
    }
};

/**
 * GET /api/products/:slug
 * جزئیات محصول — reviews هم میاد
 */
export const getProductBySlug: RequestHandler = async (req, res) => {

    try {
        const product = await Product.findOne({
            slug: String(req.params.slug),
            isActive: true,
        }).populate("reviews.user", "name");

        if (!product) {
            return res.status(404).json({ message: "no product found", status: "fail" });
        }

        res.json({ data: product, status: "success", message: "The product getting was successful" });
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error), status: "fail" });
    }
};

/**
 * POST /api/products/:id/reviews
 * ثبت نظر — فقط کاربر لاگین‌کرده
 */
export const createProductReview: RequestHandler = async (req, res) => {

    try {
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ message: "the rating and the comment is necessary", status: "fail" });
        }

        if (!isValidObjectId(String(req.params.id))) {
            return res.status(400).json({ message: "the id is not valid", status: "fail" });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "no product found", status: "fail" });
        }

        const userId = (req as any).user._id;

        const alreadyReviewed = product.reviews!.some(
            (r) => r.user.toString() === userId.toString()
        );
        if (alreadyReviewed) {
            return res.status(400).json({ message: "you already posted your review", status: "fail" });
        }

        product.reviews!.push({
            user: userId,
            name: (req as any).user.name,
            rating: Number(rating),
            comment,
            createdAt: new Date(),
        });

        product.updateRating();
        const newProduct = await product.save();

        res.status(201).json({ message: "your review was successfully submitted", status: "success", data: newProduct });
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error), status: "fail" });
    }
};

// ─── Admin Controllers ────────────────────────────────────────────────────────

/**
 * POST /api/admin/products
 * ایجاد محصول جدید
 */
export const createProduct: RequestHandler = async (req, res) => {

    const files = req.files as Express.Multer.File[];
    const imageUrls = files?.map(file => `/uploads/products/${file.filename}`) || [];

    try {
        const {
            title, slug, brand, watchModel, description,
            category, gender,
            variants, specifications,
            isFeatured,
        } = req.body;

        const exists = await Product.findOne({ slug });
        if (exists) {
            return res.status(400).json({ message: "This slug is already used", status: "fail" });
        }

        // parse variants — comes as JSON string from multipart/form-data
        let parsedVariants = [];
        if (typeof variants === "string") {
            parsedVariants = JSON.parse(variants);
        } else {
            parsedVariants = variants ?? [];
        }

        if (parsedVariants.length === 0) {
            return res.status(400).json({ message: "At least one variant is required", status: "fail" });
        }

        let parsedSpecs = {};
        if (typeof specifications === "string") {
            parsedSpecs = new Map(Object.entries(JSON.parse(specifications)));
        } else {
            parsedSpecs = new Map(Object.entries(specifications ?? {}));
        }

        const product = await Product.create({
            title,
            slug,
            brand,
            watchModel,
            description,
            images: imageUrls,
            variants: parsedVariants,
            category,
            gender,
            specifications: parsedSpecs,
            isFeatured: isFeatured ?? false,
        });

        moveTempToProducts(files);

        res.status(201).json({ data: product, message: "The product created successfully", status: "success" });
    } catch (error: any) {
        await deleteTemp(files);
        if (error.code === 11000) {
            return res.status(400).json({ message: "the slug is already chosen, change it", status: "fail" });
        }
        res.status(500).json({ message: error?.message || error, status: "fail" });
    }
};

/**
 * PUT /api/admin/products/:id
 * ویرایش محصول — همه فیلدها قابل تغییرن از جمله variants
 */
export const updateProduct: RequestHandler = async (req, res) => {
    try {
        if (!isValidObjectId(String(req.params.id))) {
            return res.status(400).json({ message: "invalid id", status: "fail" });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "no product found", status: "fail" });
        }

        if (req.body.slug && req.body.slug !== product.slug) {
            const slugExists = await Product.findOne({ slug: req.body.slug });
            if (slugExists) {
                return res.status(400).json({ message: "This slug is already used", status: "fail" });
            }
        }

        const allowedFields = [
            "title", "slug", "brand", "watchModel", "description",
            "images", "variants", "category", "gender",
            "specifications", "isFeatured", "isActive",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                (product as any)[field] = req.body[field];
            }
        });

        const updated = await product.save();
        res.json({ data: updated, message: "The product updated successfully", status: "success" });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "The slug is already used", status: "fail" });
        }
        res.status(500).json({ message: error?.message || error, status: "fail" });
    }
};

/**
 * DELETE /api/admin/products/:id
 * soft delete — محصول غیرفعال میشه نه حذف واقعی
 */
export const deleteProduct: RequestHandler = async (req, res) => {
    try {
        if (!isValidObjectId(String(req.params.id))) {
            return res.status(400).json({ message: "invalid id", status: "fail" });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "no product found", status: "fail" });
        }

        product.isActive = false;
        const newProduct = await product.save();

        res.json({ message: "The product deleted successfully", status: "success", data: newProduct });
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error), status: "fail" });
    }
};

/**
 * DELETE /api/admin/products/:id/reviews/:reviewId
 * حذف نظر نامناسب
 */
export const deleteReview: RequestHandler = async (req, res) => {
    try {
        const id = String(req.params.id);
        const reviewId = String(req.params.reviewId);

        if (!isValidObjectId(id) || !isValidObjectId(reviewId)) {
            return res.status(400).json({ message: "The id is invalid", status: "fail" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "no products found", status: "fail" });
        }

        const reviewIndex = (product.reviews ?? []).findIndex(
            (r: IReview) => r._id?.toString() === reviewId
        );
        if (reviewIndex === -1) {
            return res.status(404).json({ message: "no review found", status: "fail" });
        }

        product.reviews!.splice(reviewIndex, 1);
        product.updateRating();
        const newProduct = await product.save();

        res.json({ message: "The review deleted successfully", status: "success", data: newProduct });
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error), status: "fail" });
    }
};