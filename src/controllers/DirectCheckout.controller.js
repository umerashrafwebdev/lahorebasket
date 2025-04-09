// controllers/orderController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. Validate input
const validateDirectCheckoutInput = (customerData, items) => {
  if (!customerData || !customerData.name || !customerData.email) {
    throw new Error('Customer name and email are required');
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('At least one item is required');
  }
  for (const item of items) {
    if (!item.variantId || !item.quantity || item.quantity <= 0) {
      throw new Error('Each item must have a valid variantId and quantity');
    }
  }
};

// 2. Handle customer creation or retrieval
const handleCustomer = async (req, custData) => {
  const { phone } = custData;
  const existing = await prisma.customer.findFirst({ where: { phone } });

  if (existing) {
    await prisma.cart.updateMany({
      where: { sessionId: req.session.guestId },
      data: { customerId: existing.id, sessionId: null },
    });
    req.session.customerId = existing.id;
    return existing;
  }

  const customer = await prisma.customer.create({ data: custData });
  await prisma.cart.updateMany({
    where: { sessionId: req.session.guestId },
    data: { customerId: customer.id, sessionId: null },
  });
  req.session.customerId = customer.id;
  delete req.session.guestId;
  return customer;
};

// 3. Process and validate order items
const processOrderItems = async (items) => {
  const orderItems = await Promise.all(
    items.map(async (item) => {
      const variant = await prisma.variant.findUnique({
        where: { id: parseInt(item.variantId) },
        select: { price: true, discount: true, discountPrice: true },
      });
      if (!variant) {
        throw new Error(`Variant with ID ${item.variantId} not found`);
      }
      return {
        variantId: parseInt(item.variantId),
        quantity: parseInt(item.quantity),
        price: variant.discount ? variant.discountPrice : variant.price,
      };
    })
  );
  return orderItems;
};

// 4. Calculate totals
const calculateOrderTotals = async (orderItems) => {
  const subtotal = await orderItems.reduce(async (sumPromise, item) => {
    const sum = await sumPromise;
    return sum + item.price * item.quantity;
  }, Promise.resolve(0));

  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  return { subtotal, tax, total };
};

// 5. Calculate tax
const calculateTax = (subtotal) => {
  return subtotal * 0; // Adjust tax rate as needed (e.g., 0.05 for 5%)
};

// 6. Create the order
const createOrder = async (customerId, orderItems, totals, address) => {
  const order = await prisma.order.create({
    data: {
      customer: { connect: { id: customerId } },
      shipping: address
        ? {
            create: {
              address: address.address,
              city: address.city,
              state: address.state,
              zip: address.zip,
              country: address.country,
              carrier: address.carrier || null,
            },
          }
        : undefined,
      items: { create: orderItems },
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      status: 'pending',
    },
    include: { items: true, shipping: true },
  });
  return order;
};

// 7. Create the payment
const createPayment = async (orderId, total, paymentMethod) => {
  const payment = await prisma.payment.create({
    data: {
      orderId,
      method: paymentMethod || 'COD',
      amount: total,
      status: 'pending',
    },
  });
  return payment;
};

// Main directCheckout controller
export const directCheckout = async (req, res) => {
  try {
    const { customer: customerData, items, paymentMethod, address } = req.body;

    // Step 1: Validate input
    validateDirectCheckoutInput(customerData, items);

    // Step 2: Handle customer
    const customer = await handleCustomer(req, {
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || null,
    });

    // Step 3: Process order items
    const orderItems = await processOrderItems(items);

    // Step 4: Calculate totals
    const totals = await calculateOrderTotals(orderItems);

    // Step 5: Create order
    const order = await createOrder(customer.id, orderItems, totals, address);

    // Step 6: Create payment
    const payment = await createPayment(order.id, totals.total, paymentMethod);

    // Step 7: Send response
    res.status(201).json({
      message: 'Direct checkout successful',
      customer,
      order,
      payment,
    });
  } catch (error) {
    console.error('Error in direct checkout:', error);
    res.status(500).json({ error: 'Failed to process direct checkout', details: error.message });
  }
};

