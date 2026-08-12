import { useCallback, useEffect, useState } from 'react';

import {
  getOrganization,
  getOrganizationStatus,
  getWorkspaces,
  subscribeToEnterpriseIdentity,
} from '../utils/enterpriseIdentityEngine';
import {
  getAccessControlStatus,
  subscribeToAccessControl,
} from '../utils/accessControlEngine';

export default function useEnterpriseIdentity() {
  const [organization, setOrganization] =
    useState(null);
  const [workspaces, setWorkspaces] =
    useState([]);
  const [access, setAccess] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const currentOrganization =
        await getOrganization();
      const organizationId =
        currentOrganization?.id;

      const [
        organizationStatus,
        workspaceList,
        accessStatus,
      ] = await Promise.all([
        getOrganizationStatus(),
        getWorkspaces(organizationId),
        getAccessControlStatus(organizationId),
      ]);

      setOrganization(currentOrganization);
      setStatus(organizationStatus);
      setWorkspaces(workspaceList || []);
      setAccess(accessStatus);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load enterprise identity.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribeIdentity =
      subscribeToEnterpriseIdentity(refresh);
    const unsubscribeAccess =
      subscribeToAccessControl(refresh);

    return () => {
      unsubscribeIdentity();
      unsubscribeAccess();
    };
  }, [refresh]);

  return {
    organization,
    workspaces,
    access,
    status,
    loading,
    error,
    refresh,
  };
}