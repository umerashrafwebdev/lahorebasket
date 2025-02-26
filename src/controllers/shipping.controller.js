import prisma from "../db/index.js";
export const getShippingOptions = async (req, res) => {
    try {
        const options = await prisma.shipping.findMany();
        res.status(200).json({ options });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch shipping options", details: error.message });
    }
};

export const createShippingLabel = async (req, res) => {
    try {
        const { orderId, carrier, trackingNumber, status } = req.body;
        const shipment = await prisma.shipping.create({
            data: { orderId, carrier, trackingNumber, status }
        });
        res.status(201).json({ shipment });
    } catch (error) {
        res.status(500).json({ error: "Failed to create shipping label", details: error.message });
    }
};

export const getShippingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const shipment = await prisma.shipping.findUnique({ where: { id: parseInt(id) } });
        if (!shipment) return res.status(404).json({ error: "Shipping record not found" });
        res.status(200).json({ shipment });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch shipping details", details: error.message });
    }
};

export const updateShippingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const shipment = await prisma.shipping.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.status(200).json({ shipment });
    } catch (error) {
        res.status(500).json({ error: "Failed to update shipping status", details: error.message });
    }
};

export const trackShipment = async (req, res) => {
    try {
        const { id } = req.params;
        const shipment = await prisma.shipping.findUnique({ where: { id: parseInt(id) } });
        if (!shipment) return res.status(404).json({ error: "Tracking info not found" });
        res.status(200).json({ shipment });
    } catch (error) {
        res.status(500).json({ error: "Failed to track shipment", details: error.message });
    }
};