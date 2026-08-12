import { useState } from 'react';
import {
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Store,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useMarketplace from '../hooks/useMarketplace';
import {
  createListing,
  getListings,
  searchListings,
  saveListing,
  unsaveListing,
} from '../utils/marketplaceEngine';
import {
  upgradeToBusiness,
} from '../utils/businessAccountEngine';

function isGuestMode() {
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

function getImage(listing) {
  return (
    listing?.cover_url ||
    listing?.image_url ||
    listing?.thumbnail_url ||
    listing?.media_url ||
    null
  );
}

function ListingCard({
  listing,
  saved,
  onSave,
  onOpen,
}) {
  const image = getImage(listing);

  return (
    <article className="marketplace-listing-card">
      <button
        type="button"
        className="marketplace-listing-image"
        onClick={() => onOpen(listing)}
      >
        {image ? (
          <img
            src={image}
            alt={listing.title}
            loading="lazy"
          />
        ) : (
          <span>
            <ShoppingBag size={25} />
          </span>
        )}

        <small>
          {listing.listing_type || 'Listing'}
        </small>
      </button>

      <div className="marketplace-listing-copy">
        <button
          type="button"
          onClick={() => onOpen(listing)}
        >
          <strong>{listing.title}</strong>
          <span>
            {listing.category || 'Marketplace'}
          </span>
        </button>

        <div>
          {listing.price !== null &&
          listing.price !== undefined ? (
            <b>
              {listing.currency || '₹'}
              {listing.price}
            </b>
          ) : (
            <b>Contact seller</b>
          )}

          <button
            type="button"
            className={
              saved
                ? 'marketplace-save is-saved'
                : 'marketplace-save'
            }
            onClick={() => onSave(listing)}
            aria-label={
              saved
                ? 'Remove saved listing'
                : 'Save listing'
            }
          >
            <Heart
              size={17}
              fill={saved ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

function ActionRow({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className="marketplace-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="marketplace-action-icon">
        {icon}
      </div>

      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <ChevronRight size={18} />
    </button>
  );
}

export default function MarketplaceCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const {
    listings,
    saved,
    status,
    business,
    creator,
    storefront,
    loading,
    error,
    refresh,
  } = useMarketplace();

  const [search, setSearch] = useState('');
  const [activeListings, setActiveListings] =
    useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const displayedListings =
    activeListings || listings;

  const savedIds = new Set(
    saved.map(
      (item) =>
        item.listing_id ||
        item.marketplace_listings?.id
    )
  );

  const runSearch = async (value) => {
    setSearch(value);

    if (!value.trim()) {
      setActiveListings(null);
      return;
    }

    try {
      const result = await searchListings(value, {
        page: 0,
        pageSize: 24,
      });

      setActiveListings(result.items || []);
    } catch (searchError) {
      setActionError(
        searchError?.message ||
          'Unable to search marketplace.'
      );
    }
  };

  const handleSave = async (listing) => {
    if (guest) {
      navigate('/login');
      return;
    }

    try {
      setBusy(true);

      if (savedIds.has(listing.id)) {
        await unsaveListing(listing.id);
        setNotice('Listing removed from saved items.');
      } else {
        await saveListing(listing.id);
        setNotice('Listing saved.');
      }

      await refresh();
    } catch (saveError) {
      setActionError(
        saveError?.message ||
          'Unable to update saved listing.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCreateListing = async () => {
    if (guest) {
      navigate('/login');
      return;
    }

    try {
      setBusy(true);

      await createListing({
        title: 'New marketplace listing',
        listing_type: 'Service',
        category: 'Services',
        description: 'Add your listing details.',
        status: 'draft',
      });

      setNotice('Draft listing created.');
      await refresh();
    } catch (createError) {
      setActionError(
        createError?.message ||
          'Unable to create listing.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleUpgrade = async () => {
    if (guest) {
      navigate('/login');
      return;
    }

    try {
      setBusy(true);
      await upgradeToBusiness();
      setNotice('Business account setup started.');
      await refresh();
    } catch (upgradeError) {
      setActionError(
        upgradeError?.message ||
          'Unable to upgrade account.'
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="social-page marketplace-page">
        <TopBar />

        <main className="marketplace-content">
          <div className="marketplace-loading-header" />
          <div className="marketplace-loading-grid" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page marketplace-page">
      <TopBar />

      <main className="marketplace-content">
        <header className="marketplace-header">
          <button
            type="button"
            className="marketplace-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="marketplace-eyebrow">
              Creator economy
            </p>
            <h1>Marketplace</h1>
          </div>

          <button
            type="button"
            className="marketplace-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh marketplace"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="marketplace-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="marketplace-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <label className="marketplace-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) =>
              runSearch(event.target.value)
            }
            placeholder="Search products, services, creators"
          />
        </label>

        <section className="marketplace-status-card">
          <div className="marketplace-status-icon">
            <Store size={27} />
          </div>

          <div className="marketplace-status-copy">
            <p>Marketplace status</p>
            <h2>Open for discovery</h2>
            <span>
              {status?.published_listings || 0}{' '}
              published listings
            </span>
          </div>

          <button
            type="button"
            className="marketplace-primary-button"
            onClick={handleCreateListing}
            disabled={busy}
          >
            <Plus size={15} />
            Create
          </button>
        </section>

        <section className="marketplace-section">
          <div className="marketplace-section-heading">
            <ShoppingBag size={17} />
            <div>
              <h2>Featured listings</h2>
              <p>
                Discover products, services, and digital offerings.
              </p>
            </div>
          </div>

          {displayedListings.length === 0 ? (
            <div className="marketplace-empty">
              <ShoppingBag size={25} />
              <h2>No listings found</h2>
              <p>
                Try another search or check back later.
              </p>
            </div>
          ) : (
            <div className="marketplace-grid">
              {displayedListings.map((listing) => (
                <ListingCard
                  listing={listing}
                  saved={savedIds.has(listing.id)}
                  onSave={handleSave}
                  onOpen={(item) =>
                    navigate(
                      `/marketplace/${item.id}`
                    )
                  }
                  key={listing.id}
                />
              ))}
            </div>
          )}
        </section>

        <section className="marketplace-section">
          <div className="marketplace-section-heading">
            <Heart size={17} />
            <div>
              <h2>Saved listings</h2>
              <p>
                Items you want to revisit later.
              </p>
            </div>
          </div>

          <div className="marketplace-card">
            <ActionRow
              icon={<Heart size={18} />}
              title="View saved items"
              description={`${saved.length} saved listings`}
              onClick={() =>
                setActiveListings(
                  saved
                    .map(
                      (item) =>
                        item.marketplace_listings
                    )
                    .filter(Boolean)
                )
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="marketplace-section">
          <div className="marketplace-section-heading">
            <BriefcaseBusiness size={17} />
            <div>
              <h2>Business and creator tools</h2>
              <p>
                Build a storefront and prepare monetization.
              </p>
            </div>
          </div>

          <div className="marketplace-card">
            <ActionRow
              icon={<BriefcaseBusiness size={18} />}
              title={
                business?.enabled
                  ? 'Manage business profile'
                  : 'Upgrade to business'
              }
              description={
                business?.enabled
                  ? 'Edit business details, categories, and contacts.'
                  : 'Create a verified business foundation.'
              }
              onClick={
                business?.enabled
                  ? () =>
                      navigate(
                        '/business-profile'
                      )
                  : handleUpgrade
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Store size={18} />}
              title={
                storefront
                  ? 'Open storefront'
                  : 'Create storefront'
              }
              description={
                storefront
                  ? 'Manage branding, listings, and storefront settings.'
                  : 'Prepare a branded creator or business storefront.'
              }
              onClick={() =>
                navigate('/storefront')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<UserRound size={18} />}
              title={
                creator?.enabled
                  ? 'Creator tools'
                  : 'Upgrade to creator'
              }
              description={
                creator?.enabled
                  ? 'View audience and monetization readiness.'
                  : 'Prepare digital products and creator features.'
              }
              onClick={() =>
                navigate('/creator-tools')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Marketplace analytics"
              description="Review listing performance and audience insights."
              onClick={() =>
                navigate('/marketplace-analytics')
              }
              disabled={busy}
            />
          </div>
        </section>

        <p className="marketplace-footer">
          Guests can browse marketplace listings. Creating
          listings, saving items, business tools, storefronts,
          and future transactions require authentication.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .marketplace-page {
    min-height: 100vh;
    color: #f4f7ff;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(124,92,255,0.2),
        transparent 35%
      ),
      radial-gradient(
        circle at 100% 18%,
        rgba(77,215,255,0.1),
        transparent 30%
      ),
      #080b13;
  }

  .marketplace-content {
    width: min(100%, 1000px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .marketplace-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .marketplace-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .marketplace-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .marketplace-icon-button {
    width: 2.5rem;
    height: 2.5rem;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.9rem;
    color: #eaf0ff;
    background: rgba(255,255,255,0.06);
    cursor: pointer;
  }

  .marketplace-icon-button:last-child {
    justify-self: end;
  }

  .marketplace-search,
  .marketplace-status-card,
  .marketplace-card,
  .marketplace-listing-card,
  .marketplace-empty {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .marketplace-search {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-height: 3rem;
    margin-bottom: 0.8rem;
    padding: 0 0.9rem;
    border-radius: 1rem;
    color: #8491ad;
  }

  .marketplace-search input {
    width: 100%;
    border: 0;
    outline: 0;
    color: #f4f7ff;
    background: transparent;
    font: inherit;
    font-size: 0.8rem;
  }

  .marketplace-search input::placeholder {
    color: #697691;
  }

  .marketplace-error,
  .marketplace-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .marketplace-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .marketplace-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .marketplace-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .marketplace-status-icon {
    width: 3.3rem;
    height: 3.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 1rem;
    color: #fff;
    background: linear-gradient(
      135deg,
      #7c5cff,
      #4dd7ff
    );
  }

  .marketplace-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .marketplace-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .marketplace-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .marketplace-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .marketplace-primary-button {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    min-height: 2.35rem;
    padding: 0.55rem 0.75rem;
    border: 0;
    border-radius: 999px;
    color: #fff;
    background: linear-gradient(
      135deg,
      #7c5cff,
      #4dd7ff
    );
    font-size: 0.7rem;
    font-weight: 850;
    cursor: pointer;
  }

  .marketplace-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .marketplace-section {
    margin-top: 1.3rem;
  }

  .marketplace-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .marketplace-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .marketplace-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .marketplace-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .marketplace-listing-card {
    overflow: hidden;
    border-radius: 1rem;
  }

  .marketplace-listing-image {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    padding: 0;
    border: 0;
    color: #b8a9ff;
    background: #171e32;
    cursor: pointer;
  }

  .marketplace-listing-image img,
  .marketplace-listing-image > span {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    object-fit: cover;
  }

  .marketplace-listing-image small {
    position: absolute;
    right: 0.45rem;
    bottom: 0.45rem;
    padding: 0.3rem 0.4rem;
    border-radius: 0.45rem;
    color: #fff;
    background: rgba(4,6,12,0.72);
    font-size: 0.58rem;
  }

  .marketplace-listing-copy {
    display: grid;
    gap: 0.6rem;
    padding: 0.7rem;
  }

  .marketplace-listing-copy > button {
    display: grid;
    gap: 0.2rem;
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .marketplace-listing-copy strong {
    overflow: hidden;
    color: #edf2ff;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.76rem;
  }

  .marketplace-listing-copy span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .marketplace-listing-copy > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .marketplace-listing-copy b {
    color: #c9f9ff;
    font-size: 0.72rem;
  }

  .marketplace-save {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.65rem;
    color: #8491ad;
    background: rgba(255,255,255,0.05);
    cursor: pointer;
  }

  .marketplace-save.is-saved {
    color: #ff77b7;
  }

  .marketplace-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .marketplace-action-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .marketplace-action-row + .marketplace-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .marketplace-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .marketplace-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .marketplace-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .marketplace-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .marketplace-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .marketplace-empty {
    display: grid;
    justify-items: center;
    gap: 0.45rem;
    padding: 2.5rem 1rem;
    border-radius: 1.2rem;
    color: #b8a9ff;
    text-align: center;
  }

  .marketplace-empty h2 {
    margin: 0.2rem 0 0;
    color: #edf2ff;
    font-size: 0.95rem;
  }

  .marketplace-empty p {
    margin: 0;
    color: #8491ad;
    font-size: 0.74rem;
  }

  .marketplace-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .marketplace-loading-header,
  .marketplace-loading-grid {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: marketplace-skeleton 1.4s infinite;
  }

  .marketplace-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .marketplace-loading-grid {
    height: 25rem;
    margin-top: 1rem;
  }

  @keyframes marketplace-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 820px) {
    .marketplace-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 600px) {
    .marketplace-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .marketplace-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .marketplace-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .marketplace-primary-button {
      margin-left: auto;
    }
  }
`;