import { useCallback, useEffect, useState } from 'react';

import {
  getListings,
  getMarketplaceStatus,
  getSavedListings,
  subscribeToMarketplace,
} from '../utils/marketplaceEngine';
import {
  getBusinessProfile,
  getBusinessStatus,
  getCreatorStatus,
  getStorefront,
  subscribeToBusinessChanges,
} from '../utils/businessAccountEngine';

export default function useMarketplace() {
  const [listings, setListings] = useState([]);
  const [saved, setSaved] = useState([]);
  const [status, setStatus] = useState(null);
  const [business, setBusiness] =
    useState(null);
  const [creator, setCreator] =
    useState(null);
  const [storefront, setStorefront] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        listingResult,
        marketplaceStatus,
        savedListings,
        businessStatus,
        businessProfile,
        creatorStatus,
        businessStorefront,
      ] = await Promise.all([
        getListings({
          page: 0,
          pageSize: 24,
        }),
        getMarketplaceStatus(),
        getSavedListings({
          page: 0,
          pageSize: 12,
        }),
        getBusinessStatus(),
        getBusinessProfile(),
        getCreatorStatus(),
        getStorefront(),
      ]);

      setListings(listingResult.items || []);
      setStatus(marketplaceStatus);
      setSaved(savedListings || []);
      setBusiness({
        ...businessStatus,
        profile: businessProfile,
      });
      setCreator(creatorStatus);
      setStorefront(businessStorefront);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load marketplace.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribeMarketplace =
      subscribeToMarketplace(refresh);
    const unsubscribeBusiness =
      subscribeToBusinessChanges(refresh);

    return () => {
      unsubscribeMarketplace();
      unsubscribeBusiness();
    };
  }, [refresh]);

  return {
    listings,
    saved,
    status,
    business,
    creator,
    storefront,
    loading,
    error,
    refresh,
  };
}