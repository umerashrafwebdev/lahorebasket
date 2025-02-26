// controllers/orders.controller.js
import prisma from "../db/index.js";

// 🟢 List all orders
export const getOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: { customer: true, items: true, payments: true, shipping: true }
        });
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders", details: error.message });
    }
};

// 🟢 Get order details by ID
export const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: { customer: true, items: true, payments: true, shipping: true }
        });
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.status(200).json({ order });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order", details: error.message });
    }
};

// 🟢 Create a new order
export const createOrder = async (req, res) => {
    try {
        const { customerId, items, status } = req.body;
        const order = await prisma.order.create({
            data: {
                customerId,
                status,
                items: { create: items },
            },
            include: { items: true }
        });
        res.status(201).json({ order });
    } catch (error) {
        res.status(500).json({ error: "Failed to create order", details: error.message });
    }
};

// 🟢 Update order status
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.status(200).json({ order });
    } catch (error) {
        res.status(500).json({ error: "Failed to update order", details: error.message });
    }
};

// 🟢 Delete an order
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.order.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order", details: error.message });
    }
};

// 🟢 Get total count of orders
export const getOrdersCount = async (req, res) => {
    try {
        const count = await prisma.order.count();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order count", details: error.message });
    }
};
