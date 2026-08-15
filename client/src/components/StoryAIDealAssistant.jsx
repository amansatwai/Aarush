import {
  useMemo,
  useState,
} from 'react';
import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  DollarSign,
  FileText,
  Handshake,
  Link2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react';

const NEGOTIATION_OPTIONS = [
  ['Increase Budget', 'increaseBudget'],
  ['Increase Deliverables', 'increaseDeliverables'],
  ['Reduce Deliverables', 'reduceDeliverables'],
  ['Shorter Timeline', 'shorterTimeline'],
  ['Longer Timeline', 'longerTimeline'],
  ['Better Payment Terms', 'paymentTerms'],
  ['Usage Rights Adjustment', 'usageRights'],
  ['Exclusivity Adjustment', 'exclusivity'],
  ['Revision Limits', 'revisions'],
];

const TONES = [
  'Professional',
  'Friendly',
  'Confident',
  'Premium',
  'Agency Style',
  'Luxury',
];

function number(value) {
  return Number(value) || 0;
}

function money(value, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(number(value));
  } catch {
    return `${currency} ${Math.round(number(value))}`;
  }
}

function percent(value) {
  return `${Math.round(number(value))}%`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function Metric({ label, value, icon: Icon, color = '#4dd7ff' }) {
  return (
    <div style={styles.metric}>
      <span
        style={{
          ...styles.metricIcon,
          color,
          background: `${color}18`,
        }}
      >
        <Icon size={16} />
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ScoreRing({ score }) {
  const circumference = 2 * Math.PI * 45;
  const offset =
    circumference - (clamp(score, 0, 100) / 100) * circumference;

  return (
    <div style={styles.scoreWrap}>
      <svg
        viewBox="0 0 110 110"
        style={styles.scoreSvg}
        aria-label={`Deal score ${score} out of 100`}
        role="img"
      >
        <circle
          cx="55"
          cy="55"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,.1)"
          strokeWidth="8"
        />
        <circle
          cx="55"
          cy="55"
          r="45"
          fill="none"
          stroke="#4dd7ff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
        />
      </svg>
      <div style={styles.scoreText}>
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
    </div>
  );
}

export default function StoryAIDealAssistant({
  campaign = {},
  creatorProfile = {},
  analytics = {},
  proposal = {},
  contract = {},
  marketRates = {},
  onApplySuggestion,
  onGenerateCounterOffer,
  onClose,
}) {
  const [activeSection, setActiveSection] =
    useState('score');
  const [tone, setTone] =
    useState('Professional');
  const [selectedNegotiation, setSelectedNegotiation] =
    useState('Increase Budget');
  const [notice, setNotice] = useState('');
  const [followers, setFollowers] = useState(
    number(creatorProfile.followers)
  );
  const [views, setViews] = useState(
    number(analytics.storyViews || creatorProfile.storyViews)
  );
  const [engagement, setEngagement] = useState(
    number(
      analytics.engagementRate ||
        creatorProfile.engagementRate
    )
  );
  const [deliverables, setDeliverables] =
    useState(
      number(campaign.deliverablesCount) || 1
    );
  const [exclusive, setExclusive] =
    useState(false);
  const [usageMonths, setUsageMonths] =
    useState(
      number(campaign.usageMonths) || 1
    );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const dealScore = useMemo(() => {
    const audienceScore =
      followers > 0 ? 24 : 10;
    const viewScore =
      views > 0 ? 22 : 10;
    const engagementScore = clamp(
      engagement * 1.6,
      0,
      22
    );
    const paymentScore =
      number(campaign.budget) > 0 ? 16 : 8;
    const brandScore =
      campaign.verified === false ? 2 : 12;

    return Math.round(
      clamp(
        audienceScore +
          viewScore +
          engagementScore +
          paymentScore +
          brandScore,
        0,
        100
      )
    );
  }, [
    campaign.budget,
    campaign.verified,
    engagement,
    followers,
    views,
  ]);

  const dealStatus =
    dealScore >= 85
      ? 'Excellent'
      : dealScore >= 70
        ? 'Good'
        : dealScore >= 50
          ? 'Moderate'
          : dealScore >= 30
            ? 'Risky'
            : 'Avoid';

  const fairPricing = useMemo(() => {
    const base =
      number(marketRates.baseStoryRate) ||
      Math.max(
        500,
        followers * 0.015 +
          views * 0.05 +
          engagement * 45
      );

    const deliverableMultiplier =
      1 + Math.max(0, deliverables - 1) * 0.35;
    const exclusivityMultiplier = exclusive ? 1.45 : 1;
    const usageMultiplier =
      1 + Math.max(0, usageMonths - 1) * 0.12;

    const sponsored =
      base *
      deliverableMultiplier *
      exclusivityMultiplier *
      usageMultiplier;

    return {
      story: base,
      sequence: base * 1.8,
      sponsored,
      link: base * 1.15,
      affiliate: base * 0.55,
      exclusive: sponsored * 1.4,
    };
  }, [
    deliverables,
    exclusive,
    followers,
    engagement,
    marketRates.baseStoryRate,
    usageMonths,
    views,
  ]);

  const proposedRate =
    number(proposal.rate || campaign.budget);

  const riskFlags = useMemo(() => {
    const flags = [];

    if (proposedRate <= 0) {
      flags.push('Compensation is not clearly defined.');
    }

    if (
      contract.usageRights === 'perpetual' ||
      contract.perpetualUsage
    ) {
      flags.push('Perpetual usage rights require separate pricing.');
    }

    if (
      contract.exclusivity &&
      !contract.exclusivityFee
    ) {
      flags.push('Exclusivity fee is not specified.');
    }

    if (contract.revisions > 3) {
      flags.push('Revision limit may be too high.');
    }

    if (
      contract.paymentTiming === 'after-publish' ||
      contract.paymentTerms === 'net-90'
    ) {
      flags.push('Payment timing may create cash-flow risk.');
    }

    if (campaign.verified === false) {
      flags.push('Brand verification should be confirmed.');
    }

    return flags;
  }, [
    campaign.verified,
    contract,
    proposedRate,
  ]);

  const riskLevel =
    riskFlags.length >= 3
      ? 'High'
      : riskFlags.length
        ? 'Moderate'
        : 'Low';

  const brandMatch = useMemo(() => {
    const nicheMatch = campaign.category &&
      creatorProfile.niche
      ? campaign.category
          .toLowerCase()
          .includes(
            String(creatorProfile.niche).toLowerCase()
          )
      : false;

    const audienceMatch =
      number(analytics.audienceOverlap) ||
      (nicheMatch ? 88 : 62);

    return {
      audienceOverlap: audienceMatch,
      nicheMatch: nicheMatch ? 92 : 64,
      geographicMatch: number(
        analytics.geographicMatch
      ) || 72,
      languageMatch: number(
        analytics.languageMatch
      ) || 78,
      engagementCompatibility: number(
        analytics.engagementCompatibility
      ) || 81,
      estimatedPerformance: nicheMatch ? 'High' : 'Moderate',
    };
  }, [
    analytics,
    campaign.category,
    creatorProfile.niche,
  ]);

  const forecast = useMemo(() => {
    const current = fairPricing.sponsored || proposedRate;
    const monthly = current * 4;
    const quarterly = monthly * 3;
    const yearly = monthly * 12;

    return {
      conservative: current * 0.75,
      expected: current,
      best: current * 1.35,
      monthly,
      quarterly,
      yearly,
    };
  }, [fairPricing.sponsored, proposedRate]);

  const suggestions = useMemo(
    () => [
      'Ask for 20% higher compensation.',
      'Reduce deliverables to improve profit.',
      'Avoid perpetual usage rights.',
      'Request payment before publishing.',
      'Add a revision limit.',
      'Negotiate exclusivity separately.',
    ],
    []
  );

  const generateCounterOffer = () => {
    const suggestedRate = Math.round(
      fairPricing.sponsored * 1.2
    );

    const message = `${tone} counter-offer: Thank you for sharing the ${
      campaign.title || 'campaign'
    } brief. Based on the deliverables, usage terms, and my audience performance, I can deliver this package for ${money(
      suggestedRate,
      campaign.currency || 'INR'
    )}. This includes a defined revision limit, clear usage duration, and agreed payment milestones.`;

    onGenerateCounterOffer?.({
      message,
      tone,
      suggestedRate,
      requestedDeliverables: deliverables,
      usageMonths,
      exclusive,
    });

    showNotice('Counter-offer prepared.');
  };

  const sections = [
    ['score', 'Deal Score', ShieldCheck],
    ['pricing', 'Fair Pricing', DollarSign],
    ['negotiation', 'AI Negotiation', MessageCircle],
    ['match', 'Brand Match', Users],
    ['contract', 'Contract Analysis', FileText],
    ['scam', 'Scam Detection', AlertIcon],
    ['forecast', 'Revenue Forecast', BarChartIcon],
    ['recommendations', 'Recommendations', Sparkles],
  ];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI deal assistant"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>AI Deal Assistant</strong>
          <span>Evaluate, negotiate, and protect your value</span>
        </div>

        <button
          type="button"
          aria-label="Deal assistant status"
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

        <section style={styles.scoreCard}>
          <div>
            <span style={styles.aiBadge}>
              <Sparkles size={12} />
              AI assessment foundation
            </span>
            <h1>Deal Score</h1>
            <strong style={styles.scoreStatus}>
              {dealStatus}
            </strong>
            <p>
              Based on audience quality, proposed budget,
              engagement, brand fit, and contract signals.
            </p>
          </div>

          <ScoreRing score={dealScore} />
        </section>

        <div style={styles.tabs}>
          {sections.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveSection(id)}
              aria-pressed={activeSection === id}
              style={{
                ...styles.tab,
                ...(activeSection === id
                  ? styles.activeTab
                  : {}),
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {activeSection === 'score' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Why this score?</h2>
                <span>Key deal signals</span>
              </div>
              <ShieldCheck size={18} color="#82e9c1" />
            </div>

            <div style={styles.signalList}>
              {[
                ['Audience quality', followers > 0 ? 'Strong' : 'Needs data'],
                ['Story performance', views > 0 ? 'Available' : 'Needs data'],
                ['Engagement compatibility', `${Math.round(engagement)}%`],
                ['Brand verification', campaign.verified === false ? 'Verify' : 'Positive'],
                ['Payment clarity', proposedRate ? 'Defined' : 'Review'],
              ].map(([label, value]) => (
                <div key={label} style={styles.signalRow}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'pricing' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Fair Pricing Simulator</h2>
                <span>Adjust variables to estimate your value.</span>
              </div>
              <DollarSign size={18} color="#82e9c1" />
            </div>

            <div style={styles.simulator}>
              <RangeField
                label="Followers"
                value={followers}
                min="0"
                max="1000000"
                step="1000"
                onChange={setFollowers}
              />
              <RangeField
                label="Story views"
                value={views}
                min="0"
                max="1000000"
                step="1000"
                onChange={setViews}
              />
              <RangeField
                label="Engagement rate"
                value={engagement}
                min="0"
                max="100"
                step=".1"
                onChange={setEngagement}
              />
              <RangeField
                label="Deliverables"
                value={deliverables}
                min="1"
                max="12"
                step="1"
                onChange={setDeliverables}
              />
              <RangeField
                label="Usage months"
                value={usageMonths}
                min="1"
                max="36"
                step="1"
                onChange={setUsageMonths}
              />

              <label style={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={exclusive}
                  onChange={(event) =>
                    setExclusive(event.target.checked)
                  }
                />
                Exclusivity included
              </label>
            </div>

            <div style={styles.priceGrid}>
              <Price label="Story Rate" value={fairPricing.story} />
              <Price label="Story Sequence" value={fairPricing.sequence} />
              <Price label="Sponsored Story" value={fairPricing.sponsored} />
              <Price label="Link Story" value={fairPricing.link} />
              <Price label="Affiliate Story" value={fairPricing.affiliate} />
              <Price label="Exclusive Story" value={fairPricing.exclusive} />
            </div>
          </section>
        ) : null}

        {activeSection === 'negotiation' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>AI Negotiation</h2>
                <span>Choose a negotiation direction.</span>
              </div>
              <MessageCircle size={18} color="#4dd7ff" />
            </div>

            <div style={styles.optionGrid}>
              {NEGOTIATION_OPTIONS.map(([label, id]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setSelectedNegotiation(label)}
                  aria-pressed={selectedNegotiation === label}
                  style={{
                    ...styles.optionButton,
                    ...(selectedNegotiation === label
                      ? styles.activeOption
                      : {}),
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <select
              value={tone}
              onChange={(event) =>
                setTone(event.target.value)
              }
              aria-label="Counter offer tone"
              style={styles.select}
            >
              {TONES.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={generateCounterOffer}
              style={styles.primaryButton}
            >
              <MessageCircle size={16} />
              Generate Counter Offer
            </button>

            <div style={styles.counterPreview}>
              <strong>{selectedNegotiation}</strong>
              <p>
                Prepare a {tone.toLowerCase()} message that
                addresses {selectedNegotiation.toLowerCase()}.
              </p>
            </div>
          </section>
        ) : null}

        {activeSection === 'match' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Brand Match</h2>
                <span>Compatibility with your creator profile.</span>
              </div>
              <Target size={18} color="#a895ff" />
            </div>

            <MatchRow label="Audience overlap" value={brandMatch.audienceOverlap} />
            <MatchRow label="Niche match" value={brandMatch.nicheMatch} />
            <MatchRow label="Geographic match" value={brandMatch.geographicMatch} />
            <MatchRow label="Language match" value={brandMatch.languageMatch} />
            <MatchRow label="Engagement compatibility" value={brandMatch.engagementCompatibility} />

            <div style={styles.matchSummary}>
              Estimated performance:
              <strong>{brandMatch.estimatedPerformance}</strong>
            </div>
          </section>
        ) : null}

        {activeSection === 'contract' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Contract Analysis</h2>
                <span>Review important commercial terms.</span>
              </div>
              <FileText size={18} color="#ffd27d" />
            </div>

            <ContractRow label="Payment terms" value={contract.paymentTerms || 'Review foundation'} />
            <ContractRow label="Usage rights" value={contract.usageRights || 'Review foundation'} />
            <ContractRow label="Exclusivity" value={contract.exclusivity || 'Not specified'} />
            <ContractRow label="Revision policy" value={contract.revisions || 'Set a limit'} />
            <ContractRow label="Content ownership" value={contract.ownership || 'Review foundation'} />
            <ContractRow label="Cancellation terms" value={contract.cancellation || 'Review foundation'} />
            <ContractRow label="Deadlines" value={contract.deadline || campaign.deadline || 'Review foundation'} />

            {riskFlags.length ? (
              <div style={styles.riskBox}>
                <AlertIcon />
                <div>
                  <strong>Review before accepting</strong>
                  {riskFlags.map((flag) => (
                    <span key={flag}>{flag}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={styles.safeBox}>
                <ShieldCheck size={17} />
                No immediate risk signals detected.
              </div>
            )}
          </section>
        ) : null}

        {activeSection === 'scam' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Scam Detection</h2>
                <span>Trust and payment risk foundation.</span>
              </div>
              <AlertIcon />
            </div>

            <div style={styles.riskLevel}>
              <span>Risk level</span>
              <strong
                style={{
                  color:
                    riskLevel === 'Low'
                      ? '#82e9c1'
                      : riskLevel === 'Moderate'
                        ? '#ffd27d'
                        : '#ff5b84',
                }}
              >
                {riskLevel}
              </strong>
            </div>

            {[
              'Unrealistic payment promises',
              'Upfront payment requests',
              'Suspicious links',
              'Fake verification',
              'Identity mismatch',
              'Payment method risks',
            ].map((item) => (
              <div key={item} style={styles.checkRow}>
                <Check size={14} color="#82e9c1" />
                {item} check prepared
              </div>
            ))}
          </section>
        ) : null}

        {activeSection === 'forecast' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Revenue Forecast</h2>
                <span>Potential outcomes for this deal.</span>
              </div>
              <BarChartIcon />
            </div>

            <div style={styles.forecastGrid}>
              <Price label="This Deal" value={proposedRate} />
              <Price label="Monthly Projection" value={forecast.monthly} />
              <Price label="Quarterly Projection" value={forecast.quarterly} />
              <Price label="Yearly Projection" value={forecast.yearly} />
              <Price label="Conservative" value={forecast.conservative} />
              <Price label="Expected" value={forecast.expected} />
              <Price label="Best Case" value={forecast.best} />
            </div>
          </section>
        ) : null}

        {activeSection === 'recommendations' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>AI Recommendations</h2>
                <span>Actions that can improve deal quality.</span>
              </div>
              <Sparkles size={18} color="#4dd7ff" />
            </div>

            <div style={styles.recommendationList}>
              {[
                'Ask for 20% higher compensation.',
                'Reduce deliverables to improve profit.',
                'Avoid perpetual usage rights.',
                'Request payment before publishing.',
                'Add a revision limit.',
                'Negotiate exclusivity separately.',
              ].map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => {
                    onApplySuggestion?.(suggestion);
                    showNotice('Suggestion applied.');
                  }}
                  style={styles.recommendation}
                >
                  <Sparkles size={15} />
                  <span>{suggestion}</span>
                  <ChevronRight
                    size={14}
                    style={{ marginLeft: 'auto' }}
                  />
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <style>{`
        @keyframes aarush-deal-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-deal-option:hover,
        .aarush-deal-recommendation:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 560px) {
          .aarush-deal-tabs {
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-deal-price-grid {
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

function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}) {
  return (
    <label style={styles.rangeRow}>
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
      />
      <output>{Math.round(number(value))}</output>
    </label>
  );
}

function Price({ label, value }) {
  return (
    <div style={styles.price}>
      <span>{label}</span>
      <strong>{money(value)}</strong>
    </div>
  );
}

function MatchRow({ label, value }) {
  return (
    <div style={styles.matchRow}>
      <span>{label}</span>
      <div style={styles.matchTrack}>
        <span
          style={{
            ...styles.matchFill,
            width: `${clamp(number(value), 0, 100)}%`,
          }}
        />
      </div>
      <strong>{Math.round(number(value))}%</strong>
    </div>
  );
}

function ContractRow({ label, value }) {
  return (
    <div style={styles.contractRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AlertIcon() {
  return (
    <span style={styles.alertIcon}>
      <AlertTriangleSvg />
    </span>
  );
}

function AlertTriangleSvg() {
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
      <path d="m21.7 18-8.4-14a1.5 1.5 0 0 0-2.6 0L2.3 18a1.5 1.5 0 0 0 1.3 2.2h16.8a1.5 1.5 0 0 0 1.3-2.2Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
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

function money(value, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(number(value));
  } catch {
    return `${currency} ${Math.round(number(value))}`;
  }
}

function number(value) {
  return Number(value) || 0;
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

  scoreCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.8rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.16),rgba(77,215,255,.06))',
    animation: 'aarush-deal-in 240ms ease both',
  },

  scoreCardH1: {
    margin: '.5rem 0 .2rem',
    fontSize: '1.1rem',
  },

  scoreCardP: {
    maxWidth: '26rem',
    margin: '.4rem 0 0',
    color: '#91a0bc',
    fontSize: '.65rem',
    lineHeight: 1.45,
  },

  aiBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.56rem',
    fontWeight: 800,
  },

  scoreStatus: {
    color: '#82e9c1',
    fontSize: '.78rem',
  },

  scoreWrap: {
    position: 'relative',
    width: '7rem',
    height: '7rem',
    flexShrink: 0,
  },

  scoreSvg: {
    width: '100%',
    height: '100%',
    transform: 'rotate(0deg)',
  },

  scoreText: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    color: '#fff',
  },

  scoreTextStrong: {
    fontSize: '1.55rem',
  },

  scoreTextSpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  tabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.35rem',
  },

  tab: {
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
    animation: 'aarush-deal-in 240ms ease both',
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

  signalList: {
    display: 'grid',
    gap: '.4rem',
  },

  signalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    minHeight: '2.3rem',
    padding: '0 .55rem',
    borderRadius: '.65rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.63rem',
  },

  simulator: {
    display: 'grid',
    gap: '.6rem',
  },

  rangeRow: {
    display: 'grid',
    gridTemplateColumns: '8rem 1fr 3rem',
    alignItems: 'center',
    gap: '.5rem',
    color: '#aab6cf',
    fontSize: '.62rem',
  },

  rangeRowInput: {
    width: '100%',
    accentColor: '#7c5cff',
  },

  rangeRowOutput: {
    color: '#9deeff',
    textAlign: 'right',
  },

  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    minHeight: '2.2rem',
    color: '#cbd6ec',
    fontSize: '.63rem',
  },

  priceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
    marginTop: '.8rem',
  },

  price: {
    display: 'grid',
    gap: '.2rem',
    padding: '.6rem',
    border: '1px solid rgba(130,233,193,.15)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(130,233,193,.045)',
    fontSize: '.58rem',
  },

  priceStrong: {
    color: '#c7ffe4',
    fontSize: '.78rem',
  },

  optionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
  },

  optionButton: {
    minHeight: '2.45rem',
    padding: '0 .45rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.65rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.59rem',
    cursor: 'pointer',
  },

  activeOption: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  select: {
    minHeight: '2.45rem',
    width: '100%',
    marginTop: '.65rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
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

  counterPreview: {
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.75rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.07)',
    fontSize: '.63rem',
  },

  counterPreviewP: {
    margin: '.35rem 0 0',
    color: '#91a0bc',
    lineHeight: 1.45,
  },

  matchRow: {
    display: 'grid',
    gridTemplateColumns: '8rem 1fr 2.7rem',
    alignItems: 'center',
    gap: '.5rem',
    minHeight: '2.2rem',
    color: '#aab6cf',
    fontSize: '.62rem',
  },

  matchTrack: {
    position: 'relative',
    height: '.3rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.1)',
  },

  matchFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
  },

  matchRowStrong: {
    color: '#9deeff',
    textAlign: 'right',
  },

  matchSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginTop: '.7rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.62rem',
  },

  matchSummaryStrong: {
    color: '#c9f9ff',
  },

  contractRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    minHeight: '2.35rem',
    padding: '0 .55rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  contractRowStrong: {
    maxWidth: '60%',
    color: '#dce5f8',
    textAlign: 'right',
  },

  riskBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '.45rem',
    marginTop: '.7rem',
    padding: '.7rem',
    border: '1px solid rgba(255,210,125,.22)',
    borderRadius: '.75rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.07)',
  },

  riskBoxDiv: {
    display: 'grid',
    gap: '.25rem',
  },

  riskBoxSpan: {
    color: '#c9a77a',
    fontSize: '.6rem',
  },

  safeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.62rem',
  },

  riskLevel: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    padding: '.8rem',
    borderRadius: '.8rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.7rem',
  },

  alertIcon: {
    color: '#ffd27d',
  },

  forecastGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  recommendationList: {
    display: 'grid',
    gap: '.4rem',
  },

  recommendation: {
    minHeight: '2.55rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .65rem',
    border: '1px solid rgba(124,92,255,.15)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.63rem',
    textAlign: 'left',
    cursor: 'pointer',
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

  chartIcon: {
    color: '#a895ff',
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
    width: 'min(100%, 470px)',
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
};