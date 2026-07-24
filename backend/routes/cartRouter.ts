import express from "express";

import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    mergeCart,
    getCartDetails,
} from "../controllers/cartController.js";
import { protect } from "../controllers/protectController.js";


const cartRouter = express.Router();


cartRouter.post("/getDetails", getCartDetails);

cartRouter.use(protect);

cartRouter.get("/", getCart);

cartRouter.post("/items", addToCart);

cartRouter.patch("/items/:productId", updateCartItem);

cartRouter.delete("/items/:productId", removeCartItem);

cartRouter.delete("/", clearCart);


cartRouter.post("/merge", mergeCart);

export default cartRouter;