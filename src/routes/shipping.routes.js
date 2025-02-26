import express from "express";
import { getShippingOptions, createShippingLabel, getShippingDetails, updateShippingStatus, trackShipment } from "../controllers/shipping.controller.js";

const router = express.Router();

router.get("/", getShippingOptions);
router.post("/create", createShippingLabel);
router.get("/:id", getShippingDetails);
router.put("/:id", updateShippingStatus);
router.post("/track/:id", trackShipment);

export default router;