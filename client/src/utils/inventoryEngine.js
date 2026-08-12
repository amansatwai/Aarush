import { supabase } from '../lib/supabase';

const PRODUCTS_TABLE = 'marketplace_products';
const STOCK_TABLE = 'inventory_stock';
const HISTORY_TABLE = 'inventory_history';

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
      'Sign in to manage inventory.'
    );
  }

  return user;
}

export async function initializeInventory() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    stock_tracking: true,
    variants_ready: true,
    digital_inventory_ready: true,
  };
}

export async function createProduct(payload = {}) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create products.'
    );
  }

  const user = await requireUser();

  if (!payload.title) {
    throw new Error('Product title is required.');
  }

  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .insert({
      ...payload,
      seller_id: user.id,
      status: payload.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateProduct(
  productId,
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .eq('seller_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteProduct(productId) {
  const user = await requireUser();

  const { error } = await supabase
    .from(PRODUCTS_TABLE)
    .delete()
    .eq('id', productId)
    .eq('seller_id', user.id);

  if (error) throw error;

  return true;
}

export async function getProduct(productId) {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select('*')
    .eq('id', productId)
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function getProducts({
  page = 0,
  pageSize = 30,
  status,
} = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(PRODUCTS_TABLE)
    .select('*')
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

async function updateStockRecord(
  productId,
  amount,
  type
) {
  const user = await requireUser();
  const value = Number(amount || 0);

  if (value <= 0) {
    throw new Error('Stock amount must be positive.');
  }

  const { data, error } = await supabase
    .from(STOCK_TABLE)
    .upsert(
      {
        product_id: productId,
        owner_id: user.id,
        quantity: value,
        stock_type: type,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'product_id,owner_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  await supabase.from(HISTORY_TABLE).insert({
    product_id: productId,
    owner_id: user.id,
    change_amount: value,
    change_type: type,
    created_at: new Date().toISOString(),
  });

  return data;
}

export async function updateStock(productId, amount) {
  return updateStockRecord(
    productId,
    amount,
    'available'
  );
}

export async function reserveStock(productId, amount) {
  return updateStockRecord(
    productId,
    amount,
    'reserved'
  );
}

export async function releaseStock(productId, amount) {
  return updateStockRecord(
    productId,
    amount,
    'released'
  );
}

export async function lowStockAlert(
  productId,
  threshold = 5
) {
  const product = await getProduct(productId);
  const quantity = Number(product?.stock || 0);

  return {
    product_id: productId,
    low_stock: quantity <= threshold,
    quantity,
    threshold,
  };
}

export async function outOfStockAlert(productId) {
  const product = await getProduct(productId);

  return {
    product_id: productId,
    out_of_stock: Number(product?.stock || 0) <= 0,
  };
}

export async function getInventoryAnalytics() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select('id, stock, low_stock_threshold, status')
    .eq('seller_id', user.id);

  if (error) throw error;

  const products = data || [];

  return {
    total_products: products.length,
    active_products: products.filter(
      (item) => item.status === 'published'
    ).length,
    low_stock: products.filter(
      (item) =>
        Number(item.stock || 0) <=
        Number(item.low_stock_threshold || 5)
    ).length,
    out_of_stock: products.filter(
      (item) => Number(item.stock || 0) <= 0
    ).length,
  };
}

export function subscribeToInventory(callback) {
  const channel = supabase
    .channel('aarush-inventory')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: PRODUCTS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: STOCK_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}