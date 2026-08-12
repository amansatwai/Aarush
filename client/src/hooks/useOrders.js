import { useCallback, useEffect, useState } from 'react';

import {
  getOrderAnalytics,
  getOrders,
  subscribeToOrderEvents,
} from '../utils/orderManagementEngine';
import {
  getInventoryAnalytics,
  subscribeToInventory,
} from '../utils/inventoryEngine';

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] =
    useState(null);
  const [inventory, setInventory] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        orderList,
        orderAnalytics,
        inventoryAnalytics,
      ] = await Promise.all([
        getOrders({
          page: 0,
          pageSize: 50,
        }),
        getOrderAnalytics(),
        getInventoryAnalytics(),
      ]);

      setOrders(orderList || []);
      setAnalytics(orderAnalytics);
      setInventory(inventoryAnalytics);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load order operations.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribeOrders =
      subscribeToOrderEvents(refresh);
    const unsubscribeInventory =
      subscribeToInventory(refresh);

    return () => {
      unsubscribeOrders();
      unsubscribeInventory();
    };
  }, [refresh]);

  return {
    orders,
    analytics,
    inventory,
    loading,
    error,
    refresh,
  };
}