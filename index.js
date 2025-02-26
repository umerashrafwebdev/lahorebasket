import express from 'express';
import authRoutes from './src/routes/auth.routes.js';
import bannerRoutes from './src/routes/banners.routes.js';
import productRoutes from './src/routes/products.routes.js';
import categoryRoutes from "./src/routes/categories.routes.js";
import customerRouter from './src/routes/customers.routes.js';
import shippingRouter from './src/routes/shipping.routes.js';
import orderRouter from './src/routes/orders.routes.js';
import cartRouter from './src/routes/cart.routes.js';
import paymentRouter from './src/routes/payments.routes.js';
import sessionMiddleware from './src/middlewares/session.js';
import guestMiddleware from './src/middlewares/guest.js';
import session from 'express-session';
import searchRouter from './src/routes/search.routes.js';
const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/mob/home/banner', bannerRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/uploads', express.static('uploads'));
app.use(sessionMiddleware);

app.use(guestMiddleware);
app.use(express.json());
app.use('/api/products', productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customers", customerRouter);
app.use("/api/shipping", shippingRouter);
app.use("/api/orders", orderRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payments",paymentRouter)
app.use("/api/search", searchRouter);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});