import { useCallback, useEffect, useState } from 'react';

import {
  getBusinessAnalytics,
  getBusinessWorkspace,
  getStores,
  getTeamMembers,
  subscribeToBusinessPlatform,
} from '../utils/businessPlatformEngine';
import {
  getSupportAnalytics,
  getSupportTickets,
  subscribeToSupportEvents,
} from '../utils/customerSupportEngine';

export default function useBusinessPlatform() {
  const [workspace, setWorkspace] =
    useState(null);
  const [stores, setStores] = useState([]);
  const [members, setMembers] =
    useState([]);
  const [analytics, setAnalytics] =
    useState(null);
  const [tickets, setTickets] = useState([]);
  const [support, setSupport] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const currentWorkspace =
        await getBusinessWorkspace();
      const workspaceId = currentWorkspace?.id;

      const [
        storeList,
        memberList,
        businessAnalytics,
        ticketList,
        supportAnalytics,
      ] = await Promise.all([
        workspaceId
          ? getStores(workspaceId)
          : Promise.resolve([]),
        workspaceId
          ? getTeamMembers(workspaceId)
          : Promise.resolve([]),
        getBusinessAnalytics(workspaceId),
        getSupportTickets({
          page: 0,
          pageSize: 30,
        }),
        getSupportAnalytics(),
      ]);

      setWorkspace(currentWorkspace);
      setStores(storeList || []);
      setMembers(memberList || []);
      setAnalytics(businessAnalytics);
      setTickets(ticketList || []);
      setSupport(supportAnalytics);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load business platform.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribeBusiness =
      subscribeToBusinessPlatform(refresh);
    const unsubscribeSupport =
      subscribeToSupportEvents(refresh);

    return () => {
      unsubscribeBusiness();
      unsubscribeSupport();
    };
  }, [refresh]);

  return {
    workspace,
    stores,
    members,
    analytics,
    tickets,
    support,
    loading,
    error,
    refresh,
  };
}