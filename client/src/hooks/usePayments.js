import { useCallback, useEffect, useState } from 'react';

import {
  getOrders,
  getPaymentStatus,
  subscribeToPaymentEvents,
} from '../utils/paymentEngine';
import {
  getTransactionHistory,
  getWalletStatus,
  subscribeToWalletEvents,
} from '../utils/walletEngine';

export default function usePayments() {
  const [wallet, setWallet] = useState(null);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        walletStatus,
        orderList,
        transactionList,
      ] = await Promise.all([
        getWalletStatus(),
        getOrders({
          page: 0,
          pageSize: 30,
        }),
        getTransactionHistory({
          page: 0,
          pageSize: 30,
        }),
      ]);

      setWallet(walletStatus);
      setOrders(orderList || []);
      setTransactions(transactionList || []);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load payment status.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribePayments =
      subscribeToPaymentEvents(refresh);
    const unsubscribeWallet =
      subscribeToWalletEvents(refresh);

    return () => {
      unsubscribePayments();
      unsubscribeWallet();
    };
  }, [refresh]);

  return {
    wallet,
    orders,
    transactions,
    loading,
    error,
    refresh,
  };
}