import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, checkout } from '../controllers/cart.controller.js';
import { directCheckout } from '../controllers/DirectCheckout.controller.js';
const cartRouter = express.Router();
const { Router } = express;

// Routes
cartRouter.get('/', getCart);
cartRouter.post('/', addToCart);
cartRouter.put('/:id', updateCartItem);
cartRouter.delete('/:id', removeCartItem);
cartRouter.delete('/clear', clearCart);
cartRouter.post('/checkout', checkout);
// cartRouter.post('/checkout/direct', directCheckout );
cartRouter.post("/checkout/direct",directCheckout)

export default cartRouter;