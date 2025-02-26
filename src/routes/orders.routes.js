import express from "express";
import { getOrders, getOrder, createOrder, updateOrder, deleteOrder, getOrdersCount } from "../controllers/orders.controller.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/count", getOrdersCount);
router.get("/:id", getOrder);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;