import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  BarChart3,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DollarSign,
  ExternalLink,
  FileText,
  Hash,
  Link2,
  MessageCircle,
  Package,
  Percent,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
  X,
} from 'lucide-react';

const STATUSES = [
  'Draft',
  'Pending',
  'Approved',
  'Rejected',
  'Scheduled',
  'Published',
  'Completed',
];

const DEFAULT_DISCLOSURE = {
  paidPartnership: true,
  sponsoredLabel: true,
  brandTag: true,
  disclosureText: 'Paid partnership',
};

const DEFAULT_DELIVERABLES = [
  ['storyPosts', 'Story posts', 0],
  ['storyVideos', 'Story videos', 0],
  ['storyFrames', 'Story frames', 0],
  ['productTags', 'Product tags', 0],
  ['linkClicks', 'Link clicks foundation', 0],
  ['analyticsScreenshots', 'Analytics screenshots', 0],
];

function normalizeCampaign(campaign, index) {
  return {
    ...campaign,
    id: campaign?.id || `campaign-${index}`,
    title: campaign?.title || 'Untitled Campaign',
    status: campaign?.status || 'Draft',
    brandId: campaign?.brandId || campaign?.brand_id || '',
    creatorId:
      campaign?.creatorId ||
      campaign?.creator_id ||
      '',
    budget: Number(campaign?.budget) || 0,
    currency: campaign?.currency || 'INR',
    deadline: campaign?.deadline || null,
    deliverables:
      campaign?.deliverables || DEFAULT_DELIVERABLES,
    disclosure: {
      ...DEFAULT_DISCLOSURE,
      ...(campaign?.disclosure || {}),
    },
    analytics: campaign?.analytics || {},
    affiliateLink:
      campaign?.affiliateLink ||
      campaign?.affiliate_link ||
      '',
    promoCode: campaign?.promoCode || '',
  };
}

function statusColor(status) {
  const colors = {
    Draft: '#aab6cf',
    Pending: '#ffd27d',
    Approved: '#82e9c1',
    Rejected: '#ff9fba',
    Scheduled: '#9deeff',
    Published: '#4dd7ff',
    Completed: '#a895ff',
  };

  return colors[status] || '#aab6cf';
}

function formatDate(value) {
  if (!value) return 'Not set';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not set';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function StoryBrandCollaborationStudio({
  campaigns = [],
  currentCampaign = null,
  brand = null,
  creator = null,
  draftStory = null,
  analytics = {},
  onCreateCampaign,
  onSubmitForApproval,
  onApprove,
  onReject,
  onPublishSponsored,
  onGenerateReport,
  onClose,
}) {
  const normalizedCampaigns = useMemo(
    () => campaigns.map(normalizeCampaign),
    [campaigns]
  );

  const [activeId, setActiveId] = useState(
    currentCampaign?.id ||
      normalizedCampaigns[0]?.id ||
      null
  );
  const [activeSection, setActiveSection] =
    useState('campaigns');
  const [notice, setNotice] = useState('');
  const [reporting, setReporting] = useState(false);
  const [disclosure, setDisclosure] =
    useState(DEFAULT_DISCLOSURE);
  const [promoCode, setPromoCode] = useState('');
  const [cta, setCta] = useState('Learn more');
  const [publishDate, setPublishDate] =
    useState('');
  const [affiliateLink, setAffiliateLink] =
    useState('');

  const activeCampaign = useMemo(
    () =>
      normalizedCampaigns.find(
        (campaign) => campaign.id === activeId
      ) || null,
    [activeId, normalizedCampaigns]
  );

  const campaignAnalytics = useMemo(
    () => ({
      storyViews:
        analytics.storyViews ||
        activeCampaign?.analytics?.storyViews ||
        0,
      reach:
        analytics.reach ||
        activeCampaign?.analytics?.reach ||
        0,
      completionRate:
        analytics.completionRate ||
        activeCampaign?.analytics?.completionRate ||
        0,
      linkClicks:
        analytics.linkClicks ||
        activeCampaign?.analytics?.linkClicks ||
        0,
      replies:
        analytics.replies ||
        activeCampaign?.analytics?.replies ||
        0,
      shares:
        analytics.shares ||
        activeCampaign?.analytics?.shares ||
        0,
      conversions:
        analytics.conversions ||
        activeCampaign?.analytics?.conversions ||
        0,
      estimatedEarnings:
        analytics.estimatedEarnings ||
        activeCampaign?.analytics?.estimatedEarnings ||
        0,
    }),
    [activeCampaign, analytics]
  );

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  }, []);

  const submitApproval = useCallback(() => {
    if (!activeCampaign) {
      showNotice('Select a campaign first.');
      return;
    }

    onSubmitForApproval?.({
      campaign: activeCampaign,
      draftStory,
      disclosure,
      cta,
      promoCode,
    });

    showNotice('Campaign submitted for approval.');
  }, [
    activeCampaign,
    cta,
    disclosure,
    draftStory,
    onSubmitForApproval,
    promoCode,
    showNotice,
  ]);

  const generateReport = useCallback(async () => {
    if (!activeCampaign) return;

    setReporting(true);

    await new Promise((resolve) =>
      window.setTimeout(resolve, 500)
    );

    onGenerateReport?.({
      campaign: activeCampaign,
      analytics: campaignAnalytics,
      generatedAt: new Date().toISOString(),
      exportFormats: ['pdf', 'csv', 'image'],
    });

    setReporting(false);
    showNotice('Campaign report prepared.');
  }, [
    activeCampaign,
    campaignAnalytics,
    onGenerateReport,
    showNotice,
  ]);

  const sections = [
    ['campaigns', 'Active Campaigns', ClipboardList],
    ['sponsored', 'Sponsored Story', Tag],
    ['brief', 'Brand Brief', FileText],
    ['deliverables', 'Deliverables', Package],
    ['approval', 'Approval Workflow', ShieldCheck],
    ['affiliate', 'Affiliate Links', Link2],
    ['analytics', 'Creator Analytics', BarChart3],
    ['report', 'Campaign Report', FileText],
  ];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close brand collaboration studio"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Brand Collaboration Studio</strong>
          <span>Campaigns, approvals, and earnings</span>
        </div>

        <button
          type="button"
          onClick={() =>
            onCreateCampaign?.({
              creatorId: creator?.id,
            })
          }
          aria-label="Create campaign"
          style={styles.primaryIconButton}
        >
          <Sparkles size={17} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <section style={styles.brandHeader}>
          <div style={styles.brandLogo}>
            {brand?.logo ? (
              <img
                src={brand.logo}
                alt=""
                loading="lazy"
                style={styles.brandLogoImage}
              />
            ) : (
              <Tag size={23} />
            )}
          </div>

          <div style={styles.brandCopy}>
            <strong>
              {brand?.name || 'Brand Workspace'}
            </strong>
            <span>
              Creator: {creator?.name || 'Aarush Creator'}
            </span>
          </div>

          <span style={styles.foundationBadge}>
            Business-ready
          </span>
        </section>

        <div style={styles.sectionTabs}>
          {sections.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveSection(id)}
              aria-pressed={activeSection === id}
              style={{
                ...styles.sectionTab,
                ...(activeSection === id
                  ? styles.activeSectionTab
                  : {}),
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {activeSection === 'campaigns' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Active Campaigns</h2>
                <span>
                  Manage sponsored story partnerships.
                </span>
              </div>
              <ClipboardList size={18} color="#4dd7ff" />
            </div>

            {normalizedCampaigns.length ? (
              <div style={styles.campaignList}>
                {normalizedCampaigns.map((campaign) => {
                  const active =
                    campaign.id === activeId;
                  const completed =
                    Array.isArray(campaign.deliverables)
                      ? campaign.deliverables.filter(
                          (item) =>
                            Number(item?.[2] || item?.completed) >
                            0
                        ).length
                      : 0;

                  return (
                    <button
                      type="button"
                      key={campaign.id}
                      onClick={() => setActiveId(campaign.id)}
                      aria-pressed={active}
                      style={{
                        ...styles.campaignCard,
                        ...(active
                          ? styles.activeCampaignCard
                          : {}),
                      }}
                    >
                      <span style={styles.campaignIcon}>
                        <Tag size={18} />
                      </span>

                      <span style={styles.campaignCopy}>
                        <strong>{campaign.title}</strong>
                        <span>
                          Due {formatDate(campaign.deadline)}
                        </span>
                        <small>
                          {completed} deliverables complete
                        </small>
                      </span>

                      <span
                        style={{
                          ...styles.statusBadge,
                          color: statusColor(
                            campaign.status
                          ),
                        }}
                      >
                        {campaign.status}
                      </span>

                      <ChevronRight size={16} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <Empty label="No campaigns yet." />
            )}
          </section>
        ) : null}

        {activeCampaign ? (
          <>
            {activeSection === 'sponsored' ? (
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2>Sponsored Story</h2>
                    <span>
                      Prepare compliant branded content.
                    </span>
                  </div>
                  <Tag size={18} color="#ffd27d" />
                </div>

                <div style={styles.storyPreview}>
                  {draftStory?.mediaUrl ||
                  draftStory?.media_url ? (
                    <img
                      src={
                        draftStory.mediaUrl ||
                        draftStory.media_url
                      }
                      alt="Sponsored story preview"
                      style={styles.storyPreviewImage}
                    />
                  ) : (
                    <div style={styles.previewPlaceholder}>
                      <ImageIcon size={30} />
                      <span>Story preview foundation</span>
                    </div>
                  )}

                  <div style={styles.storyPreviewOverlay}>
                    <span style={styles.paidBadge}>
                      Paid partnership
                    </span>
                    <strong>
                      {draftStory?.caption ||
                        'Sponsored story draft'}
                    </strong>
                  </div>
                </div>

                <div style={styles.settingList}>
                  <label style={styles.settingRow}>
                    <span>Brand tag</span>
                    <input
                      type="checkbox"
                      checked={disclosure.brandTag}
                      onChange={(event) =>
                        setDisclosure((current) => ({
                          ...current,
                          brandTag: event.target.checked,
                        }))
                      }
                    />
                  </label>

                  <label style={styles.settingRow}>
                    <span>Paid partnership label</span>
                    <input
                      type="checkbox"
                      checked={disclosure.paidPartnership}
                      onChange={(event) =>
                        setDisclosure((current) => ({
                          ...current,
                          paidPartnership:
                            event.target.checked,
                        }))
                      }
                    />
                  </label>

                  <label style={styles.settingRow}>
                    <span>Disclosure text</span>
                    <input
                      value={disclosure.disclosureText}
                      onChange={(event) =>
                        setDisclosure((current) => ({
                          ...current,
                          disclosureText:
                            event.target.value,
                        }))
                      }
                      style={styles.smallInput}
                    />
                  </label>

                  <label style={styles.settingRow}>
                    <span>CTA</span>
                    <select
                      value={cta}
                      onChange={(event) =>
                        setCta(event.target.value)
                      }
                      style={styles.select}
                    >
                      <option>Learn more</option>
                      <option>Shop now</option>
                      <option>Sign up</option>
                      <option>Download</option>
                      <option>Get offer</option>
                    </select>
                  </label>

                  <label style={styles.settingRow}>
                    <span>Promo code</span>
                    <input
                      value={promoCode}
                      onChange={(event) =>
                        setPromoCode(event.target.value)
                      }
                      placeholder="AARUSH20"
                      style={styles.smallInput}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={submitApproval}
                  style={styles.primaryButton}
                >
                  <Send size={16} />
                  Submit for Approval
                </button>
              </section>
            ) : null}

            {activeSection === 'brief' ? (
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2>Brand Brief</h2>
                    <span>
                      Campaign requirements and guidelines.
                    </span>
                  </div>
                  <FileText size={18} color="#9deeff" />
                </div>

                <BriefItem
                  title="Campaign objective"
                  value={
                    activeCampaign.objective ||
                    'Build awareness and qualified engagement.'
                  }
                />
                <BriefItem
                  title="Target audience"
                  value={
                    activeCampaign.targetAudience ||
                    'Aarush community and relevant creators.'
                  }
                />
                <BriefItem
                  title="Key messages"
                  value={
                    activeCampaign.keyMessages ||
                    'Authentic, useful, and creator-led.'
                  }
                />
                <BriefItem
                  title="Required hashtags"
                  value={
                    activeCampaign.requiredHashtags ||
                    '#partner #sponsored'
                  }
                />
                <BriefItem
                  title="Required mentions"
                  value={
                    activeCampaign.requiredMentions ||
                    '@brand'
                  }
                />
                <BriefItem
                  title="Visual guidelines"
                  value={
                    activeCampaign.visualGuidelines ||
                    'Use clear lighting and visible product context.'
                  }
                />
                <BriefItem
                  title="Music restrictions foundation"
                  value={
                    activeCampaign.musicRestrictions ||
                    'Approved audio only.'
                  }
                />
              </section>
            ) : null}

            {activeSection === 'deliverables' ? (
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2>Deliverables</h2>
                    <span>
                      Track campaign completion.
                    </span>
                  </div>
                  <Package size={18} color="#82e9c1" />
                </div>

                <div style={styles.deliverableList}>
                  {DEFAULT_DELIVERABLES.map(
                    ([key, label, fallback]) => {
                      const source =
                        activeCampaign.deliverables?.find(
                          (item) =>
                            item?.[0] === key ||
                            item?.key === key
                        );

                      const value = Number(
                        source?.[2] ||
                          source?.completed ||
                          fallback
                      );

                      return (
                        <div
                          key={key}
                          style={styles.deliverableRow}
                        >
                          <span>{label}</span>
                          <span style={styles.deliverableCount}>
                            {value}
                          </span>
                          <div style={styles.progressTrack}>
                            <span
                              style={{
                                ...styles.progressFill,
                                width: `${Math.min(
                                  100,
                                  value * 20
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            ) : null}

            {activeSection === 'approval' ? (
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2>Approval Workflow</h2>
                    <span>
                      Move the campaign from draft to publish.
                    </span>
                  </div>
                  <ShieldCheck size={18} color="#82e9c1" />
                </div>

                <div style={styles.workflow}>
                  {[
                    'Draft',
                    'Submit for Approval',
                    'Brand Review',
                    'Requested Changes',
                    'Approved',
                    'Scheduled',
                    'Published',
                  ].map((stage, index) => {
                    const current =
                      stage === activeCampaign.status ||
                      (index === 0 &&
                        activeCampaign.status === 'Draft');

                    return (
                      <div
                        key={stage}
                        style={{
                          ...styles.workflowStep,
                          ...(current
                            ? styles.activeWorkflowStep
                            : {}),
                        }}
                      >
                        <span>{index + 1}</span>
                        <strong>{stage}</strong>
                      </div>
                    );
                  })}
                </div>

                <div style={styles.commentBox}>
                  <MessageCircle size={16} />
                  <span>
                    Comments and revision history foundation
                    ready.
                  </span>
                </div>
              </section>
            ) : null}

            {activeSection === 'affiliate' ? (
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2>Affiliate Links</h2>
                    <span>
                      Track clicks, conversions, and promo usage.
                    </span>
                  </div>
                  <Link2 size={18} color="#4dd7ff" />
                </div>

                <input
                  value={affiliateLink}
                  onChange={(event) =>
                    setAffiliateLink(event.target.value)
                  }
                  placeholder="Generate affiliate link foundation"
                  style={styles.textInput}
                />

                <div style={styles.affiliateGrid}>
                  <Metric
                    label="Link clicks"
                    value={activeCampaign.analytics?.linkClicks || 0}
                    icon={Link2}
                  />
                  <Metric
                    label="Conversions"
                    value={activeCampaign.analytics?.conversions || 0}
                    icon={Check}
                  />
                  <Metric
                    label="Conversion rate"
                    value="Foundation"
                    icon={Percent}
                  />
                  <Metric
                    label="QR code"
                    value="Ready"
                    icon={QrCode}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAffiliateLink(
                      `https://aarush.app/brand/${activeCampaign.id}`
                    );
                    showNotice('Affiliate link generated.');
                  }}
                  style={styles.primaryButton}
                >
                  <Link2 size={16} />
                  Generate Affiliate Link
                </button>
              </section>
            ) : null}

            {activeSection === 'analytics' ? (
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2>Creator Analytics</h2>
                    <span>
                      Campaign-specific performance metrics.
                    </span>
                  </div>
                  <BarChart3 size={18} color="#a895ff" />
                </div>

                <div style={styles.analyticsGrid}>
                  <Metric
                    label="Story views"
                    value={campaignAnalytics.storyViews}
                    icon={EyeIcon}
                  />
                  <Metric
                    label="Reach"
                    value={campaignAnalytics.reach}
                    icon={Users}
                  />
                  <Metric
                    label="Completion rate"
                    value={`${campaignAnalytics.completionRate}%`}
                    icon={Check}
                  />
                  <Metric
                    label="Replies"
                    value={campaignAnalytics.replies}
                    icon={MessageCircle}
                  />
                  <Metric
                    label="Shares"
                    value={campaignAnalytics.shares}
                    icon={ShareIcon}
                  />
                  <Metric
                    label="Estimated earnings"
                    value={campaignAnalytics.estimatedEarnings || '—'}
                    icon={DollarSign}
                  />
                </div>
              </section>
            ) : null}

            {activeSection === 'report' ? (
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2>Campaign Report</h2>
                    <span>
                      Brand-ready reporting foundation.
                    </span>
                  </div>
                  <FileText size={18} color="#ffd27d" />
                </div>

                <div style={styles.reportSummary}>
                  <span>
                    Campaign
                    <strong>{activeCampaign.title}</strong>
                  </span>
                  <span>
                    Brand
                    <strong>
                      {brand?.name || 'Brand partner'}
                    </strong>
                  </span>
                  <span>
                    Audience reached
                    <strong>{campaignAnalytics.reach}</strong>
                  </span>
                  <span>
                    Engagement
                    <strong>
                      {campaignAnalytics.replies +
                        campaignAnalytics.shares}
                    </strong>
                  </span>
                  <span>
                    ROI foundation
                    <strong>Ready</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={generateReport}
                  disabled={reporting}
                  style={styles.primaryButton}
                >
                  {reporting ? (
                    <span style={styles.spinner} />
                  ) : (
                    <FileText size={16} />
                  )}
                  {reporting
                    ? 'Generating report…'
                    : 'Generate Campaign Report'}
                </button>
              </section>
            ) : null}

            <section style={styles.scheduleCard}>
              <div style={styles.scheduleHeader}>
                <div>
                  <strong>Scheduling foundation</strong>
                  <span>
                    Prepare the approved story for publishing.
                  </span>
                </div>
                <CalendarClock size={17} />
              </div>

              <div style={styles.scheduleRow}>
                <label style={styles.field}>
                  Publish date
                  <input
                    type="datetime-local"
                    value={publishDate}
                    onChange={(event) =>
                      setPublishDate(event.target.value)
                    }
                    style={styles.smallInput}
                  />
                </label>

                <span style={styles.bestTime}>
                  Best time
                  <strong>8:00 PM</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  onPublishSponsored?.({
                    campaign: activeCampaign,
                    publishDate,
                    draftStory,
                    disclosure,
                  })
                }
                style={styles.outlineButton}
              >
                <CalendarClock size={15} />
                Schedule Sponsored Story
              </button>
            </section>
          </>
        ) : (
          <Empty label="Select a campaign to continue." />
        )}
      </div>

      <style>{`
        @keyframes aarush-brand-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-brand-tab:hover,
        .aarush-brand-campaign:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 560px) {
          .aarush-brand-tabs {
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-brand-analytics {
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

function BriefItem({ title, value }) {
  return (
    <div style={styles.briefItem}>
      <strong>{title}</strong>
      <span>{value}</span>
    </div>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <ClipboardList size={25} />
      <span>{label}</span>
    </div>
  );
}

function EyeIcon(props) {
  return (
    <svg
      width={props.size || 17}
      height={props.size || 17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ShareIcon(props) {
  return (
    <svg
      width={props.size || 17}
      height={props.size || 17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4" />
      <path d="m15.4 6.5-6.8 4" />
    </svg>
  );
}

function DollarSign(props) {
  return (
    <svg
      width={props.size || 17}
      height={props.size || 17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
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

  heading: {
    display: 'grid',
    gap: '.18rem',
    textAlign: 'center',
  },

  headingSpan: {
    color: '#91a0bc',
    fontSize: '.64rem',
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

  content: {
    width: 'min(100%, 940px)',
    margin: '0 auto',
    padding: '.9rem',
    display: 'grid',
    gap: '.8rem',
  },

  notice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    padding: '.65rem',
    border: '1px solid rgba(130,233,193,.22)',
    borderRadius: '.7rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.64rem',
  },

  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '.6rem',
    padding: '.9rem',
    border: '1px solid rgba(124,92,255,.24)',
    borderRadius: '1.1rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.15),rgba(77,215,255,.06))',
  },

  brandLogo: {
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.85rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  brandLogoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '.85rem',
  },

  brandCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.2rem',
    flex: 1,
  },

  brandCopySpan: {
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  foundationBadge: {
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '.55rem',
    fontWeight: 800,
  },

  sectionTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.35rem',
  },

  sectionTab: {
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
    transition: 'all 180ms ease',
  },

  activeSectionTab: {
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
    animation: 'aarush-brand-in 240ms ease both',
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
    transition: 'transform 180ms ease, border-color 180ms ease',
  },

  activeCampaignCard: {
    borderColor: 'rgba(124,92,255,.48)',
    background: 'rgba(124,92,255,.12)',
  },

  campaignIcon: {
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

  campaignCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  campaignCopySpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  campaignCopySmall: {
    color: '#6f7d98',
    fontSize: '.56rem',
  },

  statusBadge: {
    padding: '.3rem .4rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.06)',
    fontSize: '.55rem',
    fontWeight: 800,
  },

  storyPreview: {
    position: 'relative',
    minHeight: '16rem',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    borderRadius: '1rem',
    color: '#9deeff',
    background: '#17233d',
  },

  storyPreviewImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  previewPlaceholder: {
    display: 'grid',
    justifyItems: 'center',
    gap: '.45rem',
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  storyPreviewOverlay: {
    position: 'absolute',
    right: '.8rem',
    bottom: '.7rem',
    left: '.8rem',
    display: 'grid',
    gap: '.35rem',
    color: '#fff',
    textShadow: '0 2px 12px rgba(0,0,0,.65)',
  },

  paidBadge: {
    width: 'fit-content',
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.14)',
    fontSize: '.55rem',
    fontWeight: 800,
  },

  settingList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.75rem',
  },

  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    minHeight: '2.4rem',
    color: '#aab6cf',
    fontSize: '.63rem',
  },

  smallInput: {
    minHeight: '2.25rem',
    maxWidth: '12rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.63rem',
  },

  select: {
    minHeight: '2.3rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.63rem',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '0 .8rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  outlineButton: {
    minHeight: '2.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.3rem',
    marginTop: '.7rem',
    padding: '0 .7rem',
    border: '1px solid rgba(77,215,255,.22)',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.08)',
    fontSize: '.63rem',
    cursor: 'pointer',
  },

  briefItem: {
    display: 'grid',
    gap: '.2rem',
    marginBottom: '.7rem',
    paddingBottom: '.6rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
  },

  briefItemSpan: {
    color: '#aab6cf',
    fontSize: '.65rem',
    lineHeight: 1.45,
  },

  deliverableList: {
    display: 'grid',
    gap: '.65rem',
  },

  deliverableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '.35rem',
    color: '#cbd6ec',
    fontSize: '.64rem',
  },

  deliverableCount: {
    color: '#9deeff',
  },

  progressTrack: {
    gridColumn: '1 / -1',
    position: 'relative',
    height: '.3rem',
    overflow: 'hidden',
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

  workflow: {
    display: 'grid',
    gap: '.4rem',
  },

  workflowStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    minHeight: '2.35rem',
    padding: '0 .55rem',
    borderRadius: '.6rem',
    color: '#8290ad',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.63rem',
  },

  activeWorkflowStep: {
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.22),rgba(77,215,255,.08))',
  },

  workflowStepSpan: {
    width: '1.45rem',
    height: '1.45rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.1)',
    fontSize: '.58rem',
  },

  commentBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    marginTop: '.7rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.61rem',
  },

  affiliateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  metric: {
    minHeight: '4.8rem',
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

  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  reportSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.45rem',
  },

  reportSummarySpan: {
    display: 'grid',
    gap: '.2rem',
    padding: '.55rem',
    borderRadius: '.65rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.58rem',
  },

  reportSummaryStrong: {
    color: '#fff',
    fontSize: '.7rem',
  },

  scheduleCard: {
    padding: '.8rem',
    border: '1px solid rgba(255,210,125,.18)',
    borderRadius: '1rem',
    background: 'rgba(255,210,125,.05)',
  },

  scheduleHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    color: '#ffd27d',
  },

  scheduleHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  scheduleHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  scheduleRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '.6rem',
    alignItems: 'end',
    marginTop: '.7rem',
  },

  bestTime: {
    display: 'grid',
    gap: '.2rem',
    color: '#91a0bc',
    fontSize: '.6rem',
  },

  bestTimeStrong: {
    color: '#fff',
    fontSize: '.78rem',
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

  spinner: {
    animation: 'aarush-brand-spin 800ms linear infinite',
  },
};