import { supabase } from '../lib/supabase';

const ORDERS_TABLE = 'marketplace_orders';
const EVENTS_TABLE = 'order_events';

export const ORDER_STATES = [
  'Draft',
  'Pending',
  'Confirmed',
  'Paid',
  'Processing',
  'Packed',
  'Shipped',
  'In Transit',
  'Delivered',
  'Completed',
  'Cancelled',
  'Refunded',
];

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
      'Sign in to manage orders.'
    );
  }

  return user;
}

async function logOrderEvent(
  orderId,
  eventType,
  metadata = {}
) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      order_id: orderId,
      actor_id: user.id,
      event_type: eventType,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) return null;

  return data;
}

export async function initializeOrderManagement() {
  return {
    enabled: true,
    guest: guestMode(),
    states: ORDER_STATES,
    shipping_prepared: true,
    booking_prepared: true,
  };
}

export async function createOrder(payload = {}) {
  if (guestMode()) {
    throw new Error('Guests cannot create orders.');
  }

  const user = await requireUser();

  if (!payload.product_id && !payload.listing_id) {
    throw new Error('A product or listing is required.');
  }

  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .insert({
      ...payload,
      buyer_id: user.id,
      status: payload.status || 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  await logOrderEvent(data.id, 'created');
  return data;
}

export async function updateOrderStatus(
  orderId,
  status,
  metadata = {}
) {
  const user = await requireUser();

  if (!ORDER_STATES.includes(status)) {
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

  await logOrderEvent(
    orderId,
    'status_changed',
    {
      status,
      ...metadata,
    }
  );

  return data;
}

export async function cancelOrder(
  orderId,
  reason = ''
) {
  const result = await updateOrderStatus(
    orderId,
    'Cancelled',
    { reason }
  );

  return result;
}

export async function refundOrder(
  orderId,
  reason = ''
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from('order_refunds')
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

  await updateOrderStatus(
    orderId,
    'Refunded',
    { refund_id: data.id }
  );

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
  pageSize = 30,
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

export async function getSellerOrders(options = {}) {
  if (guestMode()) return [];

  const user = await requireUser();
  const from = (options.page || 0) * (options.pageSize || 30);
  const to = from + (options.pageSize || 30) - 1;

  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function getBuyerOrders(options = {}) {
  if (guestMode()) return [];

  const user = await requireUser();
  const from = (options.page || 0) * (options.pageSize || 30);
  const to = from + (options.pageSize || 30) - 1;

  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .select('*')
    .eq('buyer_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function assignTrackingNumber(
  orderId,
  trackingNumber,
  metadata = {}
) {
  return updateOrderStatus(
    orderId,
    'Shipped',
    {
      tracking_number: trackingNumber,
      ...metadata,
    }
  );
}

export async function generateInvoice(orderId) {
  const order = await getOrder(orderId);

  if (!order) {
    throw new Error('Order not found.');
  }

  return {
    invoice_id: `INV-${order.id}`,
    order,
    created_at: new Date().toISOString(),
  };
}

export async function generateReceipt(orderId) {
  const order = await getOrder(orderId);

  if (!order) {
    throw new Error('Order not found.');
  }

  return {
    receipt_id: `RCT-${order.id}`,
    order,
    created_at: new Date().toISOString(),
  };
}

export async function getOrderAnalytics() {
  const orders = await getOrders({
    page: 0,
    pageSize: 500,
  });

  return {
    total: orders.length,
    pending: orders.filter(
      (order) =>
        ['Pending', 'Confirmed', 'Paid'].includes(
          order.status
        )
    ).length,
    active: orders.filter(
      (order) =>
        [
          'Processing',
          'Packed',
          'Shipped',
          'In Transit',
        ].includes(order.status)
    ).length,
    completed: orders.filter(
      (order) =>
        ['Delivered', 'Completed'].includes(
          order.status
        )
    ).length,
    cancelled: orders.filter(
      (order) => order.status === 'Cancelled'
    ).length,
    refunded: orders.filter(
      (order) => order.status === 'Refunded'
    ).length,
    revenue: orders.reduce(
      (total, order) =>
        total + Number(order.amount || 0),
      0
    ),
  };
}

export function subscribeToOrderEvents(callback) {
  const channel = supabase
    .channel('aarush-order-events')
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
        table: EVENTS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}