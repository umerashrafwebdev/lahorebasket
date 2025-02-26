import prisma from "../db/index.js"
// Get all customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving customers", error: err });
  }
};

// Get a single customer by ID
export const getCustomer = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: parseInt(req.params.id), // Ensure the ID is treated as an integer
      },
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving customer", error: err });
  }
};

// Add a new customer
export const addCustomer = async (req, res) => {
  try {
    const newCustomer = await prisma.customer.create({
      data: req.body,
    });
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: "Error adding customer", error: err });
  }
};

// Update an existing customer by ID
export const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await prisma.customer.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: req.body,
    });
    res.status(200).json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: "Error updating customer", error: err });
  }
};

// Delete a customer by ID
export const deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await prisma.customer.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.status(200).json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting customer", error: err });
  }
};

// Get the total number of customers
export const getCustomersCount = async (req, res) => {
  try {
    const count = await prisma.customer.count();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving customer count", error: err });
  }
};

// Search customers by a query (e.g., name, email)
export const searchCustomers = async (req, res) => {
  const query = req.query.q;
  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive', // Case-insensitive search
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive', // Case-insensitive search
            },
          },
        ],
      },
    });
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: "Error searching customers", error: err });
  }
};
