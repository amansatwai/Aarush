import { supabase } from '../lib/supabase';

const WALLETS_TABLE = 'wallets';
const TRANSACTIONS_TABLE = 'wallet_transactions';

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
    throw new Error('Sign in to manage your wallet.');
  }

  return user;
}

export async function initializeWallet() {
  if (guestMode()) {
    return {
      enabled: false,
      guest: true,
      balance: 0,
      currency: 'INR',
    };
  }

  const wallet = await createWallet();

  return {
    enabled: true,
    guest: false,
    ...wallet,
  };
}

export async function createWallet() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(WALLETS_TABLE)
    .upsert(
      {
        user_id: user.id,
        currency: 'INR',
        balance: 0,
        locked_balance: 0,
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getWalletBalance() {
  if (guestMode()) return 0;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(WALLETS_TABLE)
    .select('balance, locked_balance, currency')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  return data || {
    balance: 0,
    locked_balance: 0,
    currency: 'INR',
  };
}

async function walletTransaction({
  type,
  amount,
  recipientId,
  metadata = {},
} = {}) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot perform wallet actions.'
    );
  }

  const user = await requireUser();
  const value = Number(amount || 0);

  if (value <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  const { data, error } = await supabase
    .from(TRANSACTIONS_TABLE)
    .insert({
      user_id: user.id,
      recipient_id: recipientId || null,
      type,
      amount: value,
      status: 'pending',
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function addFunds(
  amount,
  metadata = {}
) {
  return walletTransaction({
    type: 'add_funds',
    amount,
    metadata,
  });
}

export async function withdrawFunds(
  amount,
  metadata = {}
) {
  return walletTransaction({
    type: 'withdrawal',
    amount,
    metadata,
  });
}

export async function transferFunds(
  recipientId,
  amount,
  metadata = {}
) {
  return walletTransaction({
    type: 'transfer',
    amount,
    recipientId,
    metadata,
  });
}

export async function lockFunds(
  amount,
  metadata = {}
) {
  return walletTransaction({
    type: 'lock',
    amount,
    metadata,
  });
}

export async function unlockFunds(
  amount,
  metadata = {}
) {
  return walletTransaction({
    type: 'unlock',
    amount,
    metadata,
  });
}

export async function getTransactionHistory({
  page = 0,
  pageSize = 30,
} = {}) {
  if (guestMode()) return [];

  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(TRANSACTIONS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function exportTransactions() {
  const transactions =
    await getTransactionHistory({
      page: 0,
      pageSize: 500,
    });

  const blob = new Blob(
    [JSON.stringify(transactions, null, 2)],
    {
      type: 'application/json',
    }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = 'aarush-transactions.json';
  anchor.click();

  URL.revokeObjectURL(url);

  return true;
}

export async function getWalletStatus() {
  const balance = await getWalletBalance();

  return {
    enabled: !guestMode(),
    guest: guestMode(),
    status: guestMode() ? 'browse-only' : 'active',
    ...balance,
  };
}

export function subscribeToWalletEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-wallet-events')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: WALLETS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TRANSACTIONS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}