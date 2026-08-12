import { supabase } from '../lib/supabase';

const ORDERS_TABLE = 'marketplace_orders';
const PAYMENTS_TABLE = 'payment_events';
const REFUNDS_TABLE = 'payment_refunds';

function guestMode() {
  if (typeof window === 'undefined') return false;

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error(
      'Sign in to manage payments.'
    );
  }

  return user;
}

export async function initializePayments() {
  return {
    enabled: true,
    guest: guestMode(),
    methods: [
      'UPI',
      'Debit Card',
      'Credit Card',
      'Net Banking',
      'Wallet',
      'Subscription',
    ],
    order_states: [
      'Pending',
      'Processing',
      'Paid',
      'Shipped',
      'Delivered',
      'Completed',
      'Cancelled',
      'Refunded',
      'Failed',
    ],
  };
}

export async function createOrder({
  listingId,
  sellerId,
  amount,
  currency = 'INR',
  paymentMethod,
  metadata = {},
} = {}) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create orders.'
    );
  }

  const user = await requireUser();

  if (!listingId || !amount) {
    throw new Error(
      'Listing and amount are required.'
    );
  }

  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .insert({
      buyer_id: user.id,
      seller_id: sellerId || null,
      listing_id: listingId,
      amount,
      currency,
      payment_method: paymentMethod || null,
      status: 'Pending',
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function cancelOrder(orderId) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .update({
      status: 'Cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('buyer_id', user.id)
    .in('status', ['Pending', 'Processing'])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getOrder(orderId) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .select('*')
    .eq('id', orderId)
    .or(
      `buyer_id.eq.${user.id},seller_id.eq.${user.id}`
    )
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function getOrders({
  page = 0,
  pageSize = 20,
} = {}) {
  if (guestMode()) return [];

  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .select('*')
    .or(
      `buyer_id.eq.${user.id},seller_id.eq.${user.id}`
    )
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function updateOrderStatus(
  orderId,
  status
) {
  const user = await requireUser();

  const allowed = [
    'Pending',
    'Processing',
    'Paid',
    'Shipped',
    'Delivered',
    'Completed',
    'Cancelled',
    'Refunded',
    'Failed',
  ];

  if (!allowed.includes(status)) {
    throw new Error('Invalid order status.');
  }

  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .or(
      `buyer_id.eq.${user.id},seller_id.eq.${user.id}`
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function verifyPayment(
  orderId,
  providerReference
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot verify payments.'
    );
  }

  const user = await requireUser();

  const { data: order, error: orderError } =
    await supabase
      .from(ORDERS_TABLE)
      .select('*')
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .maybeSingle();

  if (orderError) throw orderError;
  if (!order) throw new Error('Order not found.');

  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .insert({
      order_id: orderId,
      user_id: user.id,
      provider_reference: providerReference || null,
      event_type: 'payment_verification_requested',
      status: 'pending',
      metadata: {
        amount: order.amount,
        currency: order.currency,
      },
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    verified: false,
    status: 'pending',
    payment: data,
  };
}

export async function processRefund(
  orderId,
  reason = ''
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot request refunds.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(REFUNDS_TABLE)
    .insert({
      order_id: orderId,
      requester_id: user.id,
      reason,
      status: 'requested',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export function calculateFees(
  amount,
  {
    platformRate = 0.02,
    processingRate = 0.018,
    fixedFee = 2,
  } = {}
) {
  const value = Number(amount || 0);
  const platformFee = value * platformRate;
  const processingFee =
    value * processingRate + fixedFee;

  return {
    subtotal: value,
    platform_fee: platformFee,
    processing_fee: processingFee,
    total_fees: platformFee + processingFee,
    total: value + platformFee + processingFee,
  };
}

export async function generateInvoice(
  orderId
) {
  const order = await getOrder(orderId);

  if (!order) {
    throw new Error('Order not found.');
  }

  return {
    invoice_id: `INV-${order.id}`,
    order,
    fees: calculateFees(order.amount),
    generated_at: new Date().toISOString(),
  };
}

export async function getPaymentStatus(
  orderId
) {
  const order = await getOrder(orderId);

  if (!order) {
    throw new Error('Order not found.');
  }

  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return {
    order,
    payment: data || null,
    status: data?.status || order.status,
  };
}

export function subscribeToPaymentEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-payment-events')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: ORDERS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: PAYMENTS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: REFUNDS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}