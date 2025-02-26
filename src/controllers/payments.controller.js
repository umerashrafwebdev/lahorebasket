export const processPayment = async (req, res) => {
    try {
        const { orderId, amount, method } = req.body;
        const payment = await prisma.payment.create({ data: { orderId, amount, method, status: "pending" } });
        res.status(201).json({ payment });
    } catch (error) {
        res.status(500).json({ error: "Failed to process payment", details: error.message });
    }
};

export const getPayments = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany();
        res.status(200).json({ payments });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch payments", details: error.message });
    }
};