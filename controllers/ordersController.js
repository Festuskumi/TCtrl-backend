import ordersModel from '../Models/ordersModel.js';
import usersModels from '../Models/userModels.js';
import Stripe from 'stripe';
import axios from 'axios';
import sendEmail from '../utils/sendEmail.js';


const stripe = new Stripe(process.env.STRIPE_KEY);
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const currency = 'gbp';
const postage_fee = 15;

// Utility: Send order confirmation email
const sendOrderConfirmationEmail = async (user, order) => {
  const productList = order.products
    .map(p => `<li>${p.title || 'Item'} x ${p.quantity} – £${p.price}</li>`)
    .join('');

    const logoUrl = 'https://res.cloudinary.com/dj3r6un9z/image/upload/v1746557604/tctrl/logo.png';

    const productRows = order.products
      .map(p => `
        <tr>
          <td style="padding: 8px 0;">${p.title || 'Item'}</td>
          <td style="padding: 8px 0; text-align: center;">${p.quantity}</td>
          <td style="padding: 8px 0; text-align: right;">£${(p.price * p.quantity).toFixed(2)}</td>
        </tr>
      `).join('');
    
    const subtotal = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const shipping = 15;
    const total = subtotal + shipping;
    
    const addressFormatted = `
      ${order.address.street || ''}<br/>
      ${order.address.city || ''}, ${order.address.state || ''}<br/>
      ${order.address.postalCode || ''}<br/>
      ${order.address.country || ''}
    `;
    
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="TCTRL Logo" style="max-width: 150px; margin-bottom: 20px;" />
        </div>
    
        <h2 style="text-align: center;">Thank you for your order, ${user.name || 'Customer'}!</h2>
        <p style="text-align: center;">We’ve received your order and will notify you once it ships.</p>
    
        <hr style="margin: 20px 0;" />
    
        <h3>Order Summary</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid #ccc;">
              <th style="text-align: left; padding-bottom: 8px;">Product</th>
              <th style="text-align: center; padding-bottom: 8px;">Qty</th>
              <th style="text-align: right; padding-bottom: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
    
        <table style="width: 100%; margin-top: 20px;">
          <tr>
            <td><strong>Subtotal:</strong></td>
            <td style="text-align: right;">£${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Shipping:</strong></td>
            <td style="text-align: right;">£${shipping.toFixed(2)}</td>
          </tr>
          <tr style="font-size: 18px;">
            <td><strong>Total:</strong></td>
            <td style="text-align: right;"><strong>£${total.toFixed(2)}</strong></td>
          </tr>
        </table>
    
        <hr style="margin: 30px 0;" />
    
        <h3>Shipping Address</h3>
        <p style="line-height: 1.6;">
          ${addressFormatted}
        </p>
    
        <p style="margin-top: 40px; font-size: 14px; color: #888;">– The TCTRL Team</p>
      </div>
    `;

  await sendEmail(user.email, 'TCTRL Order Confirmation', emailHTML);
};

// ---------------------------
// COD Order
// ---------------------------
const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.userId;
    const { products, amount, address } = req.body;
    if (!userId || !products?.length) return res.status(400).json({ success: false, message: 'Invalid order data.' });

    const order = await ordersModel.create({
      userId,
      products,
      amount,
      address,
      paymentMethod: 'COD',
      payment: false,
      status: 'Order placed',
      date: Date.now(),
    });

    await usersModels.findByIdAndUpdate(userId, { cartDetails: {} });

    const user = await usersModels.findById(userId);
    if (user) await sendOrderConfirmationEmail(user, order);

    res.status(200).json({ success: true, message: 'Order placed successfully (COD)', order });
  } catch (err) {
    console.error('❌ COD Order Error:', err);
    res.status(500).json({ success: false, message: 'Failed to place order (COD)' });
  }
};

// ---------------------------
// Stripe Order
// ---------------------------
const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.userId;
    const { products, amount, address } = req.body;
    const origin = req.headers.origin || 'http://localhost:5173';
    if (!userId || !products?.length) return res.status(400).json({ success: false, message: 'Invalid order data.' });

    const lineItems = products.map(item => ({
      price_data: {
        currency,
        product_data: { name: item.title || 'TCTRL Product' },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/orders?success=true`,
      cancel_url: `${origin}/orders?cancel=true`,
    });

    await ordersModel.create({
      userId,
      products,
      amount,
      address,
      stripeSessionId: session.id,
      paymentMethod: 'Stripe',
      payment: false,
      status: 'Order placed',
      date: Date.now(),
    });

    await usersModels.findByIdAndUpdate(userId, { cartDetails: {} });

    res.status(200).json({ success: true, message: 'Stripe session created', sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('❌ Stripe Order Error:', err);
    res.status(500).json({ success: false, message: 'Failed to place order (Stripe)' });
  }
};

// Stripe Webhook Handler
const handleStripeWebhook = async (req, res) => {
  try {
    console.log('🔔 STRIPE WEBHOOK RECEIVED');

    const rawBody = req.body;
    let event;

    if (process.env.NODE_ENV === 'development') {
      const jsonString = rawBody.toString('utf8');
      event = JSON.parse(jsonString);
    } else {
      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const sessionId = session.id;

      const order = await ordersModel.findOneAndUpdate(
        { stripeSessionId: sessionId, payment: false },
        { payment: true, status: 'Paid' },
        { new: true }
      );

      if (order) {
        const user = await usersModels.findById(order.userId);
        if (user) {
          await sendOrderConfirmationEmail(user, order); // ✅ Sends email silently
        }
        return res.status(200).json({ received: true, updated: true });
      }

      return res.status(200).json({ received: true, updated: false });
    }

    return res.status(200).json({ received: true, ignored: true });

  } catch (err) {
    console.error('❌ Stripe Webhook Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------------------
// PayPal Order
// ---------------------------
const getPayPalAccessToken = async () => {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    }
  });
  return res.data.access_token;
};

const placeOrderPaypal = async (req, res) => {
  try {
    const userId = req.userId;
    const { products, amount, address } = req.body;
    const origin = req.headers.origin || 'http://localhost:5173';
    if (!userId || !products?.length) return res.status(400).json({ success: false, message: 'Invalid order data.' });

    const accessToken = await getPayPalAccessToken();

    const newOrder = await ordersModel.create({
      userId,
      products,
      amount,
      address,
      paymentMethod: 'PayPal',
      payment: false,
      status: 'Order placed',
      date: Date.now(),
    });

    await usersModels.findByIdAndUpdate(userId, { cartDetails: {} });

    const paypalOrder = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: newOrder._id.toString(),
        amount: {
          currency_code: currency.toUpperCase(),
          value: amount.toString(),
          breakdown: {
            item_total: { currency_code: currency.toUpperCase(), value: (amount - postage_fee).toString() },
            shipping: { currency_code: currency.toUpperCase(), value: postage_fee.toString() },
          },
        },
        items: products.map(p => ({
          name: p.title || 'TCTRL Product',
          unit_amount: { currency_code: currency.toUpperCase(), value: p.price.toString() },
          quantity: p.quantity.toString(),
        }))
      }],
      application_context: {
        return_url: `${origin}/orders?success=true`,
        cancel_url: `${origin}/orders?cancel=true`
      }
    }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
    });

    newOrder.paypalOrderId = paypalOrder.data.id;
    await newOrder.save();

    const approvalUrl = paypalOrder.data.links.find(link => link.rel === 'approve')?.href;
    res.status(200).json({ success: true, message: 'PayPal order created', orderId: paypalOrder.data.id, url: approvalUrl });
  } catch (err) {
    console.error('❌ PayPal Order Error:', err);
    res.status(500).json({ success: false, message: 'Failed to place order (PayPal)' });
  }
};

// PayPal Webhook Handler
const handlePaypalWebhook = async (req, res) => {
  try {
    const event = req.body;
    const type = event?.event_type;

    let referenceId = event?.resource?.purchase_units?.[0]?.reference_id || event?.resource?.reference_id;
    if (!referenceId && event?.resource?.id) {
      const order = await ordersModel.findOne({ paypalOrderId: event.resource.id });
      referenceId = order?._id.toString();
    }

    const successTypes = [
      'PAYMENT.CAPTURE.COMPLETED',
      'CHECKOUT.ORDER.APPROVED',
      'CHECKOUT.ORDER.COMPLETED'
    ];

    if (successTypes.includes(type) && referenceId) {
      const order = await ordersModel.findOneAndUpdate(
        { _id: referenceId, payment: false },
        { payment: true, status: 'Paid' },
        { new: true }
      );

      if (order) {
        const user = await usersModels.findById(order.userId);
        if (user) await sendOrderConfirmationEmail(user, order);
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ PayPal Webhook Error:', err);
    res.status(500).json({ received: false });
  }
};

// ---------------------------
// Admin / Customer Functions
// ---------------------------
const allOrders = async (req, res) => {
  try {
    const orders = await ordersModel.find().sort({ date: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('❌ Fetch All Orders Error:', err);
    res.status(500).json({ success: false });
  }
};

const customersOrders = async (req, res) => {
  try {
    const orders = await ordersModel.find({ userId: req.userId }).sort({ date: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('❌ Fetch Customer Orders Error:', err);
    res.status(500).json({ success: false });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const updated = await ordersModel.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, message: 'Order status updated', order: updated });
  } catch (err) {
    console.error('❌ Update Order Status Error:', err);
    res.status(500).json({ success: false });
  }
};

export {
  placeOrderCOD,
  placeOrderStripe,
  handleStripeWebhook,
  placeOrderPaypal,
  handlePaypalWebhook,
  allOrders,
  customersOrders,
  updateOrderStatus
};
