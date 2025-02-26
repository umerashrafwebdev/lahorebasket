import prisma from "../db/index.js";
// controllers/search.controller.js
export const search = async (req, res) => {
    try {
        const { query, type, filter } = req.query;
        if (!query) return res.status(400).json({ error: "Query parameter is required" });
        let results;

        switch (type) {
            case "orders":
                results = await prisma.order.findMany({
                    where: { id: parseInt(query) }
                });
                break;
            case "customers":
                results = await prisma.customer.findMany({
                    where: {
                        OR: [
                            { name: { contains: query} },
                            { email: { contains: query} }
                        ],
                        AND: filter ? JSON.parse(filter) : undefined
                    }
                });
                break;
            case "products":
                results = await prisma.product.findMany({
                    where: {
                      OR: [
                        { title: { contains: query } }, // Search by title
                        { tags: { contains: query } }  // Search by tags
                      ],
                    },
                  });
                break;
            case "payments":
                results = await prisma.payment.findMany({
                    where: {
                        id: { contains: query },
                        AND: filter ? JSON.parse(filter) : undefined
                    }
                });
                break;
            default:
                return res.status(400).json({ error: "Invalid search type" });
        }

        res.status(200).json({ results });
    } catch (error) {
        res.status(500).json({ error: "Search failed", details: error.message });
    }
};
