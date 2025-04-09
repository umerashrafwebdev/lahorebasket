import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const getCart = async (req, res) => {
  try {
    const cart = await getCartBySessionOrCustomer(req);
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart", details: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { variantId, quantity } = req.body;
    validateCartInput(variantId, quantity, res);

    const { customerId, sessionId } = getSessionIdentifiers(req);

    // Find or create cart using session identifiers
    let cart = await prisma.cart.findFirst({
      where: {
        OR: [
          { customerId: customerId },
          { sessionId: sessionId }
        ]
      },
      include: { cartItems: true }
    });

    // Create new cart if none exists
    if (!cart) {
      if (customerId) {
        cart = await prisma.cart.create({
          data: {
            customerId
          }
        });
      } else {
        cart = await prisma.cart.create({
          data: {
            sessionId
          }
        });
      }
    }

    const variant = await prisma.variant.findUnique({
      where: { id: parseInt(variantId) },
      include: { product: true }
    });

    if (!variant || !variant.product) {
      return res.status(404).json({ error: "Variant not found or product unavailable" });
    }

    // Update or create cart item within a transaction
    await prisma.$transaction(async (tx) => {
      const existingCartItem = cart.cartItems?.find(item => item.variantId === variant.id);

      
      if (existingCartItem) {
        // Update quantity
        await tx.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: { increment: quantity } }
        });
      } else {
        // Add new item
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            variantId: variant.id,
            quantity
          }
        });
      }
    });

    // Fetch updated cart for response
    const updatedCart = await prisma.cart.findFirst({
      where: {
        OR: [
          { customerId: customerId },
          { sessionId: sessionId }
        ]
      },
      include: {
        cartItems: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      }
    });

    res.status(200).json({ cart: updatedCart });
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    res.status(500).json({ error: "Failed to add item to cart", details: error.message });
  }
};
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    validateQuantity(quantity, res);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: { cart: true }
    });

    await authorizeCartItem(cartItem, req, res);

    await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity }
    });

    res.status(200).json({ cartItem });
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart item", details: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const cartItem = await prisma.cartItem.findUnique({ where: { id: parseInt(id) } });

    await authorizeCartItem(cartItem, req, res);

    await prisma.cartItem.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Cart item removed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove cart item", details: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await getCartBySessionOrCustomer(req);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear cart", details: error.message });
  }
};

export const checkout = async (req, res) => {
  try {
    const { name, phone, email, paymentMethod, address } = req.body;
    const customer = await handleCustomer(req, { name, phone, email });
    const cart = await getCartBySessionOrCustomer(req, true);

    if (cart.cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    console.log(customer.id)
    const totals = await calculateCartTotals(cart.cartItems);
    console.log(cart)
    // Create order and payment
    // const order = await prisma.order.create({
    //   data: {
    //     customerId : customer.id,
    //     shipping: { create: address },
    //     orderItems: {
    //       create: cart.cartItems.map(item => ({
    //         variantId: item.variantId,
    //         quantity: item.quantity,
    //         price: item.variant.discount ? item.variant.discountPrice : item.variant.price
    //       }))
    //     },
    //     ...totals
    //   }
    // });
    const order = await prisma.order.create({
      data: {
        customer: { connect: { id: customer.id } },  // ✅ Corrected customer connection
        shipping: { 
          create: {
            address: address.address, 
            city: address.city,
            state: address.state,
            zip: address.zip,
            country: address.country,
            carrier: address.carrier
          }
        },
        items: {
          create: cart.cartItems.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant.discount ? item.variant.discountPrice : item.variant.price
          }))
        },
        ...totals
      }
    });
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method: paymentMethod || 'COD',
        amount: totals.total
      }
    });

    // Clear the cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json({ message: "Checkout successful", customer, order, payment });
  } catch (error) {
    res.status(500).json({ error: "Checkout failed", details: error.message });
  }
};
  const getCartBySessionOrCustomer = async (req, includeItems = false) => {
    const { customerId, sessionId } = getSessionIdentifiers(req);
  
    return await prisma.cart.findFirst({
      where: { OR: [{ customerId }, { sessionId }] },
      include: includeItems ? { cartItems: { include: { variant: { include: { product: true } } } } } : {}
    });
  };

  const validateCartInput = (variantId, quantity, res) => {
    if (!variantId || !quantity || quantity <= 0 || isNaN(variantId)) {
      return res.status(400).json({ error: "Invalid variant ID or quantity" });
    }
  };

const validateQuantity = (quantity, res) => {
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Quantity must be a positive number" });
  }
};

const getSessionIdentifiers = (req) => ({
  customerId: req.session.customerId || null,
  sessionId: req.session.guestId || null
});
const authorizeCartItem = async (cartItem, req, res) => {
  if (!cartItem) return res.status(404).json({ error: "Cart item not found" });

  const { userId } = req.session;
  if (cartItem.cart.customerId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
};

const handleCustomer = async (req, custData) => {
  console.log("Session Identifiers:", getSessionIdentifiers(req));

  const { phone } = custData;
  
  // Use findFirst instead of findUnique
  const existing = await prisma.customer.findFirst({
    where: { phone }
  });

  if (existing) {
    // Link guest cart to existing customer
    await prisma.cart.updateMany({
      where: { sessionId: req.session.guestId },
      data: { customerId: existing.id, sessionId: null }
    });
    req.session.customerId = existing.id;
    return existing;
  }

  // Create a new customer
  const customer = await prisma.customer.create({
    data: custData
  });

  // Link guest cart to new customer
  await prisma.cart.updateMany({
    where: { sessionId: req.session.guestId },
    data: { customerId: customer.id, sessionId: null }
  });

  req.session.customerId = customer.id;
  delete req.session.guestId; // Optional: Clear guest ID after migration
  return customer;
};

const calculateCartTotals = async (items) => {
    const subtotal = await items.reduce(async (sum, item) => {
      const variant = await prisma.variant.findUnique({
        where: { id: item.variantId },
        select: { price: true, discount: true, discountPrice: true }
      });
      
      const price = variant.discount ? variant.discountPrice : variant.price;
      return sum + price * item.quantity;
    }, 0);
  
    const tax = await calculateTax(subtotal);
    return { subtotal: subtotal, tax, total: subtotal + tax };
  };
const calculateTax = (subtotal) => {
  return subtotal * 0; // 5% tax rate example
}; 






