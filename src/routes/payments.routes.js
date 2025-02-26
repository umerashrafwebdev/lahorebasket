import express from "express";
import { processPayment, getPayments } from "../controllers/payments.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/", processPayment);
paymentRouter.get("/", getPayments);

export default paymentRouter;