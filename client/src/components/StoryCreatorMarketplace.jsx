import {
  useMemo,
  useState,
} from 'react';
import {
  BadgeCheck,
  Briefcase,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  DollarSign,
  FileText,
  Globe2,
  Handshake,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';

const TABS = [
  ['featured', 'Featured Campaigns'],
  ['recommended', 'Recommended For You'],
  ['brands', 'Brand Directory'],
  ['proposals', 'My Proposals'],
  ['deals', 'Active Deals'],
  ['contracts', 'Contracts'],
  ['earnings', 'Earnings'],
  ['analytics', 'Analytics'],
];

const PROPOSAL_STATUSES = [
  'Draft',
  'Submitted',
  'Viewed',
  'Negotiating',
  'Accepted',
  'Rejected',
  'Completed',
];

function normalizeCampaign(campaign, index) {
  return {
    ...campaign,
    id: campaign?.id || `campaign-${index}`,
    brandId: campaign?.brandId || '',
    title: campaign?.title || 'Creator Campaign',
    category: campaign?.category || 'Lifestyle',
    budget: Number(campaign?.budget) || 0,
    currency: campaign?.currency || 'INR',
    deliverables: campaign?.deliverables || [],
    audienceRequirements:
      campaign?.audienceRequirements || 'Open audience',
    deadline: campaign?.deadline || null,
    difficulty: campaign?.difficulty || 'Moderate',
    verified: campaign?.verified !== false,
    status: campaign?.status || 'Open',
    brand: campaign?.brand || null,
  };
}

function normalizeBrand(brand, index) {
  return {
    ...brand,
    id: brand?.id || `brand-${index}`,
    name: brand?.name || 'Brand Partner',
    industry: brand?.industry || 'Lifestyle',
    logo: brand?.logo || brand?.logoUrl || '',
    verified: brand?.verified !== false,
    averageDealValue: Number(
      brand?.averageDealValue ||
        brand?.average_deal_value ||
        0
    ),
    activeCampaigns: Number(
      brand?.activeCampaigns ||
        brand?.active_campaigns ||
        0
    ),
    responseTime: brand?.responseTime || 'Foundation',
  };
}

function formatMoney(value, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return `${currency} ${Math.round(Number(value) || 0)}`;
  }
}

function formatDate(value) {
  if (!value) return 'Flexible';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Flexible';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusColor(status) {
  const colors = {
    Draft: '#aab6cf',
    Submitted: '#9deeff',
    Viewed: '#4dd7ff',
    Negotiating: '#ffd27d',
    Accepted: '#82e9c1',
    Rejected: '#ffb1c8',
    Completed: '#a895ff',
    Open: '#82e9c1',
  };

  return colors[status] || '#aab6cf';
}

export default function StoryCreatorMarketplace({
  campaigns = [],
  brands = [],
  creators = [],
  proposals = [],
  contracts = [],
  analytics = {},
  currentUser = null,
  onApplyCampaign,
  onCreateProposal,
  onAcceptProposal,
  onRejectProposal,
  onOpenCampaign,
  onOpenContract,
  onClose,
}) {
  const normalizedCampaigns = useMemo(
    () => campaigns.map(normalizeCampaign),
    [campaigns]
  );

  const normalizedBrands = useMemo(
    () => brands.map(normalizeBrand),
    [brands]
  );

  const [activeTab, setActiveTab] =
    useState('featured');
  const [search, setSearch] = useState('');
  const [selectedCampaign, setSelectedCampaign] =
    useState(null);
  const [selectedBrand, setSelectedBrand] =
    useState(null);
  const [proposalCampaign, setProposalCampaign] =
    useState(null);
  const [proposalMessage, setProposalMessage] =
    useState('');
  const [proposalRate, setProposalRate] =
    useState('');
  const [deliveryDays, setDeliveryDays] =
    useState('7');
  const [notice, setNotice] = useState('');

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return normalizedCampaigns;

    return normalizedCampaigns.filter((campaign) =>
      [
        campaign.title,
        campaign.category,
        campaign.audienceRequirements,
        campaign.brand?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [normalizedCampaigns, search]);

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return normalizedBrands;

    return normalizedBrands.filter((brand) =>
      [
        brand.name,
        brand.industry,
        brand.responseTime,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [normalizedBrands, search]);

  const recommended = useMemo(() => {
    return [...normalizedCampaigns]
      .sort((first, second) => {
        const firstScore =
          Number(first.recommendedScore) ||
          Number(first.budget) ||
          0;
        const secondScore =
          Number(second.recommendedScore) ||
          Number(second.budget) ||
          0;

        return secondScore - firstScore;
      })
      .slice(0, 8);
  }, [normalizedCampaigns]);

  const submitProposal = () => {
    if (!proposalCampaign) return;

    if (!proposalMessage.trim()) {
      showNotice('Add a cover message first.');
      return;
    }

    const proposal = {
      id: `proposal-${Date.now()}`,
      campaignId: proposalCampaign.id,
      brandId: proposalCampaign.brandId,
      creatorId: currentUser?.id || null,
      status: 'Submitted',
      coverMessage: proposalMessage,
      rate: Number(proposalRate) || 0,
      estimatedDeliveryDays: Number(deliveryDays) || 7,
      createdAt: new Date().toISOString(),
      portfolioFoundation: true,
      mediaKitFoundation: true,
    };

    onCreateProposal?.(proposal);
    setProposalCampaign(null);
    setProposalMessage('');
    setProposalRate('');
    showNotice('Proposal submitted.');
  };

  const renderCampaign = (campaign) => (
    <article
      key={campaign.id}
      style={styles.campaignCard}
    >
      <button
        type="button"
        onClick={() => {
          setSelectedCampaign(campaign);
          onOpenCampaign?.(campaign);
        }}
        aria-label={`Open ${campaign.title}`}
        style={styles.campaignMain}
      >
        <span style={styles.brandLogo}>
          {campaign.brand?.logo ? (
            <img
              src={campaign.brand.logo}
              alt=""
              loading="lazy"
              style={styles.logoImage}
            />
          ) : (
            <Briefcase size={20} />
          )}
        </span>

        <span style={styles.campaignCopy}>
          <strong>{campaign.title}</strong>
          <span>
            {campaign.brand?.name || 'Brand partner'} ·{' '}
            {campaign.category}
          </span>
          <small>
            {campaign.deliverables?.length || 0}{' '}
            deliverables · Due{' '}
            {formatDate(campaign.deadline)}
          </small>
        </span>

        {campaign.verified ? (
          <BadgeCheck
            size={16}
            color="#4dd7ff"
          />
        ) : null}

        <ChevronRight size={16} />
      </button>

      <div style={styles.campaignFooter}>
        <span>
          {formatMoney(
            campaign.budget,
            campaign.currency
          )}
        </span>

        <span
          style={{
            ...styles.statusBadge,
            color: statusColor(campaign.status),
          }}
        >
          {campaign.status}
        </span>

        <button
          type="button"
          onClick={() => setProposalCampaign(campaign)}
          style={styles.applyButton}
        >
          Apply
          <Send size={14} />
        </button>
      </div>
    </article>
  );

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close creator marketplace"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Creator Marketplace</strong>
          <span>Find meaningful brand partnerships</span>
        </div>

        <button
          type="button"
          aria-label="Marketplace profile"
          style={styles.primaryIconButton}
        >
          <Users size={17} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <section style={styles.creatorCard}>
          <div style={styles.creatorAvatar}>
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt=""
                style={styles.creatorAvatarImage}
              />
            ) : (
              <Users size={23} />
            )}
          </div>

          <div style={styles.creatorCopy}>
            <strong>
              {currentUser?.name || 'Creator profile'}
            </strong>
            <span>
              {currentUser?.niche || 'Lifestyle creator'} ·{' '}
              {currentUser?.location || 'Global'}
            </span>
          </div>

          <div style={styles.creatorStats}>
            <span>
              Followers
              <strong>
                {currentUser?.followers || '—'}
              </strong>
            </span>
            <span>
              Engagement
              <strong>
                {currentUser?.engagementRate || '—'}
              </strong>
            </span>
          </div>
        </section>

        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search campaigns and brands"
            aria-label="Search marketplace"
            style={styles.searchInput}
          />
        </div>

        <div style={styles.tabs}>
          {TABS.map(([id, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              aria-pressed={activeTab === id}
              style={{
                ...styles.tab,
                ...(activeTab === id
                  ? styles.activeTab
                  : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'featured' ||
        activeTab === 'recommended' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>
                  {activeTab === 'featured'
                    ? 'Featured Campaigns'
                    : 'Recommended For You'}
                </h2>
                <span>
                  Opportunities matched to your creator profile.
                </span>
              </div>
              <Sparkles size={18} color="#4dd7ff" />
            </div>

            <div style={styles.campaignList}>
              {(activeTab === 'featured'
                ? filteredCampaigns
                : recommended
              ).map(renderCampaign)}
            </div>

            {!filteredCampaigns.length ? (
              <Empty label="No campaigns found." />
            ) : null}
          </section>
        ) : null}

        {activeTab === 'brands' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Brand Directory</h2>
                <span>
                  Discover verified brand partners.
                </span>
              </div>
              <Briefcase size={18} color="#ffd27d" />
            </div>

            <div style={styles.brandList}>
              {filteredBrands.map((brand) => (
                <button
                  type="button"
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand)}
                  style={styles.brandCard}
                >
                  <span style={styles.brandDirectoryLogo}>
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt=""
                        loading="lazy"
                        style={styles.logoImage}
                      />
                    ) : (
                      <Briefcase size={19} />
                    )}
                  </span>

                  <span style={styles.brandCopy}>
                    <strong>
                      {brand.name}
                      {brand.verified ? (
                        <BadgeCheck
                          size={14}
                          color="#4dd7ff"
                        />
                      ) : null}
                    </strong>
                    <span>{brand.industry}</span>
                    <small>
                      Avg deal{' '}
                      {formatMoney(
                        brand.averageDealValue
                      )}
                    </small>
                  </span>

                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === 'proposals' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>My Proposals</h2>
                <span>
                  Track submitted and negotiated opportunities.
                </span>
              </div>
              <Send size={18} color="#9deeff" />
            </div>

            <div style={styles.proposalList}>
              {proposals.length ? (
                proposals.map((proposal, index) => (
                  <Proposal
                    key={proposal.id || index}
                    proposal={proposal}
                    onAccept={onAcceptProposal}
                    onReject={onRejectProposal}
                  />
                ))
              ) : (
                <Empty label="No proposals yet." />
              )}
            </div>
          </section>
        ) : null}

        {activeTab === 'deals' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Active Deals</h2>
                <span>
                  Campaign progress and next milestones.
                </span>
              </div>
              <Handshake size={18} color="#82e9c1" />
            </div>

            <div style={styles.dealList}>
              {(campaigns.filter(
                (campaign) =>
                  campaign.status === 'Accepted' ||
                  campaign.status === 'Scheduled' ||
                  campaign.status === 'Published'
              ) || []).map((campaign, index) => (
                <div
                  key={campaign.id || index}
                  style={styles.dealCard}
                >
                  <div style={styles.dealHeader}>
                    <strong>
                      {campaign.title || 'Active deal'}
                    </strong>
                    <span>
                      {campaign.progress || 0}% complete
                    </span>
                  </div>

                  <div style={styles.progressTrack}>
                    <span
                      style={{
                        ...styles.progressFill,
                        width: `${campaign.progress || 0}%`,
                      }}
                    />
                  </div>

                  <div style={styles.dealMeta}>
                    <span>
                      Deliverables completed:{' '}
                      {campaign.completedDeliverables || 0}
                    </span>
                    <span>
                      Payment:{' '}
                      {campaign.paymentStatus || 'Foundation'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === 'contracts' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Contracts</h2>
                <span>
                  Agreement and usage-rights foundation.
                </span>
              </div>
              <FileText size={18} color="#a895ff" />
            </div>

            {contracts.length ? (
              <div style={styles.contractList}>
                {contracts.map((contract, index) => (
                  <button
                    type="button"
                    key={contract.id || index}
                    onClick={() =>
                      onOpenContract?.(contract)
                    }
                    style={styles.contractRow}
                  >
                    <FileText size={18} />
                    <span style={styles.contractCopy}>
                      <strong>
                        {contract.title ||
                          'Digital agreement'}
                      </strong>
                      <span>
                        {contract.status || 'Review foundation'}{' '}
                        ·{' '}
                        {formatDate(contract.updatedAt)}
                      </span>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            ) : (
              <Empty label="No contracts available." />
            )}
          </section>
        ) : null}

        {activeTab === 'earnings' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Earnings</h2>
                <span>Marketplace revenue foundation.</span>
              </div>
              <DollarSign size={18} color="#82e9c1" />
            </div>

            <div style={styles.metricGrid}>
              <Metric
                label="Total earned"
                value={formatMoney(analytics.totalEarned)}
                icon={DollarSign}
              />
              <Metric
                label="Pending"
                value={formatMoney(analytics.pending)}
                icon={Clock3}
              />
              <Metric
                label="This month"
                value={formatMoney(analytics.thisMonth)}
                icon={CalendarClock}
              />
              <Metric
                label="Average deal"
                value={formatMoney(analytics.averageDealValue)}
                icon={Handshake}
              />
            </div>
          </section>
        ) : null}

        {activeTab === 'analytics' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Marketplace Analytics</h2>
                <span>
                  Business performance for your creator profile.
                </span>
              </div>
              <BarChartIcon />
            </div>

            <div style={styles.metricGrid}>
              <Metric
                label="Proposal acceptance"
                value={`${analytics.proposalAcceptanceRate || 0}%`}
                icon={Check}
              />
              <Metric
                label="Response rate"
                value={`${analytics.responseRate || 0}%`}
                icon={MessageCircle}
              />
              <Metric
                label="Negotiation time"
                value={analytics.averageNegotiationTime || '—'}
                icon={Clock3}
              />
              <Metric
                label="Completion rate"
                value={`${analytics.campaignCompletionRate || 0}%`}
                icon={Check}
              />
              <Metric
                label="Repeat brands"
                value={analytics.repeatBrands || 0}
                icon={Users}
              />
              <Metric
                label="Revenue trend"
                value={analytics.revenueTrend || 'Foundation'}
                icon={BarChartIcon}
              />
            </div>
          </section>
        ) : null}
      </div>

      {selectedCampaign ? (
        <CampaignModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onApply={() => {
            setProposalCampaign(selectedCampaign);
            setSelectedCampaign(null);
          }}
        />
      ) : null}

      {proposalCampaign ? (
        <ProposalModal
          campaign={proposalCampaign}
          message={proposalMessage}
          setMessage={setProposalMessage}
          rate={proposalRate}
          setRate={setProposalRate}
          deliveryDays={deliveryDays}
          setDeliveryDays={setDeliveryDays}
          onClose={() => setProposalCampaign(null)}
          onSubmit={submitProposal}
        />
      ) : null}

      {selectedBrand ? (
        <BrandModal
          brand={selectedBrand}
          onClose={() => setSelectedBrand(null)}
          campaigns={normalizedCampaigns.filter(
            (campaign) =>
              campaign.brandId === selectedBrand.id
          )}
        />
      ) : null}

      <style>{`
        @keyframes aarush-marketplace-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-marketplace-card:hover,
        .aarush-marketplace-tab:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 560px) {
          .aarush-marketplace-tabs {
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-marketplace-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </main>
  );
}

function Proposal({
  proposal,
  onAccept,
  onReject,
}) {
  return (
    <div style={styles.proposalRow}>
      <span style={styles.proposalIcon}>
        <Send size={16} />
      </span>

      <div style={styles.proposalCopy}>
        <strong>
          {proposal.title ||
            proposal.campaignTitle ||
            'Campaign proposal'}
        </strong>
        <span>
          {proposal.status || 'Submitted'} ·{' '}
          {formatMoney(proposal.rate)}
        </span>
      </div>

      {proposal.status === 'Pending' ? (
        <div style={styles.proposalActions}>
          <button
            type="button"
            onClick={() => onAccept?.(proposal)}
            style={styles.acceptButton}
          >
            <Check size={13} />
          </button>
          <button
            type="button"
            onClick={() => onReject?.(proposal)}
            style={styles.rejectButton}
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <span
          style={{
            ...styles.statusBadge,
            color: statusColor(proposal.status),
          }}
        >
          {proposal.status || 'Submitted'}
        </span>
      )}
    </div>
  );
}

function CampaignModal({
  campaign,
  onClose,
  onApply,
}) {
  return (
    <Modal title={campaign.title} onClose={onClose}>
      <div style={styles.detailHeader}>
        <span style={styles.detailIcon}>
          <Briefcase size={22} />
        </span>
        <div>
          <strong>
            {campaign.brand?.name || 'Brand Partner'}
          </strong>
          <span>
            {campaign.category} ·{' '}
            {formatMoney(campaign.budget)}
          </span>
        </div>
      </div>

      <Detail label="Objective" value={campaign.objective || 'Build awareness and engagement.'} />
      <Detail label="Required story count" value={campaign.storyCount || campaign.deliverables?.length || 'Foundation'} />
      <Detail label="Required hashtags" value={campaign.requiredHashtags || '#partner #sponsored'} />
      <Detail label="Required mentions" value={campaign.requiredMentions || '@brand'} />
      <Detail label="Timeline" value={formatDate(campaign.deadline)} />
      <Detail label="Payment terms" value={campaign.paymentTerms || 'Foundation'} />

      <button
        type="button"
        onClick={onApply}
        style={styles.primaryButton}
      >
        <Send size={15} />
        Apply to campaign
      </button>
    </Modal>
  );
}

function ProposalModal({
  campaign,
  message,
  setMessage,
  rate,
  setRate,
  deliveryDays,
  setDeliveryDays,
  onClose,
  onSubmit,
}) {
  return (
    <Modal title="Create Proposal" onClose={onClose}>
      <Detail
        label="Campaign"
        value={campaign.title}
      />

      <label style={styles.field}>
        Cover message
        <textarea
          autoFocus
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          placeholder="Tell the brand why this collaboration fits."
          style={styles.textarea}
        />
      </label>

      <label style={styles.field}>
        Rate proposal
        <input
          type="number"
          min="0"
          value={rate}
          onChange={(event) =>
            setRate(event.target.value)
          }
          placeholder="Enter your rate"
          style={styles.textInput}
        />
      </label>

      <label style={styles.field}>
        Estimated delivery time
        <select
          value={deliveryDays}
          onChange={(event) =>
            setDeliveryDays(event.target.value)
          }
          style={styles.select}
        >
          {[3, 5, 7, 10, 14, 21].map((days) => (
            <option value={days} key={days}>
              {days} days
            </option>
          ))}
        </select>
      </label>

      <div style={styles.foundationNote}>
        Portfolio, media kit, story examples, counter offers,
        and revision requests are prepared for future workflows.
      </div>

      <button
        type="button"
        onClick={onSubmit}
        style={styles.primaryButton}
      >
        <Send size={15} />
        Submit Proposal
      </button>
    </Modal>
  );
}

function BrandModal({
  brand,
  campaigns,
  onClose,
}) {
  return (
    <Modal title={brand.name} onClose={onClose}>
      <div style={styles.detailHeader}>
        <span style={styles.detailIcon}>
          <Briefcase size={22} />
        </span>
        <div>
          <strong>
            {brand.industry}
            {brand.verified ? (
              <BadgeCheck
                size={14}
                color="#4dd7ff"
              />
            ) : null}
          </strong>
          <span>
            Avg deal {formatMoney(brand.averageDealValue)}
          </span>
        </div>
      </div>

      <Detail
        label="Active campaigns"
        value={brand.activeCampaigns}
      />
      <Detail
        label="Response time"
        value={brand.responseTime}
      />
      <Detail
        label="Campaigns available"
        value={campaigns.length}
      />
      <Detail
        label="Creator rating foundation"
        value={brand.rating || 'Foundation'}
      />

      <button
        type="button"
        onClick={onClose}
        style={styles.outlineButton}
      >
        Browse campaigns
        <ChevronRight size={15} />
      </button>
    </Modal>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.modalBackdrop}>
      <section style={styles.modal}>
        <div style={styles.modalHeader}>
          <strong>{title}</strong>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={styles.iconButton}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={styles.detail}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div style={styles.metric}>
      <span style={styles.metricIcon}>
        <Icon size={15} />
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BarChartIcon() {
  return (
    <span style={styles.chartIcon}>
      <BarChartSvg />
    </span>
  );
}

function BarChartSvg() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Briefcase size={25} />
      <span>{label}</span>
    </div>
  );
}

function formatMoney(value, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return `${currency} ${Math.round(Number(value) || 0)}`;
  }
}

function statusColor(status) {
  const colors = {
    Draft: '#aab6cf',
    Submitted: '#9deeff',
    Viewed: '#4dd7ff',
    Negotiating: '#ffd27d',
    Accepted: '#82e9c1',
    Rejected: '#ffb1c8',
    Completed: '#a895ff',
    Open: '#82e9c1',
  };

  return colors[status] || '#aab6cf';
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.52),#07090e 68%)',
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.65rem',
    padding: '.75rem',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  iconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.06)',
    cursor: 'pointer',
  },

  primaryIconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  heading: {
    display: 'grid',
    gap: '.18rem',
    textAlign: 'center',
  },

  headingSpan: {
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  content: {
    width: 'min(100%, 980px)',
    margin: '0 auto',
    padding: '.9rem',
    display: 'grid',
    gap: '.8rem',
  },

  creatorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.6rem',
    padding: '.85rem',
    border: '1px solid rgba(124,92,255,.24)',
    borderRadius: '1rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.14),rgba(77,215,255,.06))',
  },

  creatorAvatar: {
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  creatorAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '999px',
  },

  creatorCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.2rem',
    flex: 1,
  },

  creatorCopySpan: {
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  creatorStats: {
    display: 'flex',
    gap: '.7rem',
  },

  creatorStatsSpan: {
    display: 'grid',
    gap: '.15rem',
    color: '#91a0bc',
    fontSize: '.56rem',
    textAlign: 'center',
  },

  creatorStatsStrong: {
    color: '#fff',
    fontSize: '.72rem',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.7rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.8rem',
    color: '#91a0bc',
    background: 'rgba(15,19,30,.88)',
  },

  searchInput: {
    minWidth: 0,
    minHeight: '2.55rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.68rem',
  },

  tabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.35rem',
  },

  tab: {
    minHeight: '2.5rem',
    padding: '0 .45rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activeTab: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-marketplace-in 240ms ease both',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginBottom: '.7rem',
  },

  sectionHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  sectionHeaderH2: {
    margin: 0,
    fontSize: '.86rem',
  },

  sectionHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  campaignList: {
    display: 'grid',
    gap: '.45rem',
  },

  campaignCard: {
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.8rem',
    background: 'rgba(255,255,255,.035)',
    animation: 'aarush-marketplace-in 240ms ease both',
  },

  campaignMain: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: 0,
    border: 0,
    color: '#dce5f8',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },

  brandLogo: {
    width: '2.6rem',
    height: '2.6rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.7rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '.7rem',
  },

  campaignCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  campaignCopySpan: {
    color: '#91a0bc',
    fontSize: '.6rem',
  },

  campaignCopySmall: {
    color: '#6f7d98',
    fontSize: '.56rem',
  },

  campaignFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    marginTop: '.55rem',
    paddingTop: '.5rem',
    borderTop: '1px solid rgba(255,255,255,.06)',
    color: '#cbd6ec',
    fontSize: '.62rem',
  },

  statusBadge: {
    padding: '.25rem .4rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.06)',
    fontSize: '.55rem',
    fontWeight: 800,
  },

  applyButton: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    marginLeft: 'auto',
    padding: '0 .55rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.6rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  brandList: {
    display: 'grid',
    gap: '.45rem',
  },

  brandCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.8rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  brandDirectoryLogo: {
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.7rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  brandCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  brandCopyStrong: {
    display: 'flex',
    alignItems: 'center',
    gap: '.25rem',
  },

  brandCopySpan: {
    color: '#91a0bc',
    fontSize: '.6rem',
  },

  brandCopySmall: {
    color: '#6f7d98',
    fontSize: '.56rem',
  },

  proposalList: {
    display: 'grid',
    gap: '.4rem',
  },

  proposalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  proposalIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  proposalCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  proposalCopySpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  proposalActions: {
    display: 'flex',
    gap: '.25rem',
  },

  acceptButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '.5rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.12)',
    cursor: 'pointer',
  },

  rejectButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '.5rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.1)',
    cursor: 'pointer',
  },

  dealList: {
    display: 'grid',
    gap: '.5rem',
  },

  dealCard: {
    padding: '.65rem',
    border: '1px solid rgba(130,233,193,.16)',
    borderRadius: '.75rem',
    background: 'rgba(130,233,193,.05)',
  },

  dealHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    color: '#c7ffe4',
    fontSize: '.63rem',
  },

  progressTrack: {
    position: 'relative',
    height: '.3rem',
    overflow: 'hidden',
    marginTop: '.55rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.1)',
  },

  progressFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
  },

  dealMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.4rem',
    marginTop: '.5rem',
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  contractList: {
    display: 'grid',
    gap: '.4rem',
  },

  contractRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  contractCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  contractCopySpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  metric: {
    minHeight: '5rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.2rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
  },

  metricIcon: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.55rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  metricStrong: {
    color: '#fff',
    fontSize: '.78rem',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    color: '#aab6cf',
    fontSize: '.64rem',
  },

  textInput: {
    minHeight: '2.5rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.7rem',
  },

  textarea: {
    minHeight: '6rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    resize: 'vertical',
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.68rem',
    lineHeight: 1.45,
  },

  select: {
    minHeight: '2.4rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
  },

  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
    padding: '.65rem',
    borderRadius: '.75rem',
    background: 'rgba(124,92,255,.08)',
  },

  detailIcon: {
    width: '2.5rem',
    height: '2.5rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.7rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  detailHeaderDiv: {
    display: 'grid',
    gap: '.18rem',
  },

  detailHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.6rem',
  },

  detail: {
    display: 'grid',
    gap: '.2rem',
    padding: '.5rem 0',
    borderBottom: '1px solid rgba(255,255,255,.06)',
  },

  detailSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  detailStrong: {
    color: '#dce5f8',
    fontSize: '.66rem',
    lineHeight: 1.4,
  },

  foundationNote: {
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    lineHeight: 1.45,
  },

  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '.8rem',
    background: 'rgba(2,5,10,.72)',
    backdropFilter: 'blur(10px)',
  },

  modal: {
    width: 'min(100%, 480px)',
    maxHeight: '86vh',
    overflowY: 'auto',
    display: 'grid',
    gap: '.7rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 70px rgba(0,0,0,.5)',
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  empty: {
    minHeight: '6rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.4rem',
    color: '#91a0bc',
    fontSize: '.64rem',
    textAlign: 'center',
  },
};