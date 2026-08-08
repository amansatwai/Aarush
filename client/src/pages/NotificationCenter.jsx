import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Focus,
  Shield,
  Sparkles,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import NotificationCard from '../components/NotificationCard';
import NotificationFilterChip from '../components/NotificationFilterChip';
import useNotifications from '../hooks/useNotifications';
import { categories, focusModes } from '../utils/notificationEngine';

const backgroundSystems = [
  ['Notification Engine', 'Active'],
  ['Push Notification Service', 'Syncing'],
  ['Privacy Filter Engine', 'Protected'],
  ['AI Prioritization', 'Active'],
  ['Notification Sync', 'Syncing'],
  ['Lock Screen Protection', 'Protected'],
  ['Focus Mode Engine', 'Active'],
  ['Realtime Delivery', 'Syncing'],
  ['Security Notification Service', 'Active'],
  ['Device Token Manager', 'Active'],
  ['Quiet Hours Scheduler', 'Active'],
  ['Notification Analytics', 'Protected'],
];

export default function NotificationCenter() {
  const navigate = useNavigate();
  const {
    state,
    score,
    level,
    summary,
    events,
    toggleNested,
    update,
    markAllRead,
    markRead,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('All');
  const [message, setMessage] = useState('');

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'All') {
      return events;
    }

    if (activeFilter === 'Unread') {
      return events.filter((item) => item.unread);
    }

    if (activeFilter === 'High Priority') {
      return events.filter((item) => item.priority === 'High');
    }

    return events.filter((item) => item.category === activeFilter);
  }, [activeFilter, events]);

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '7rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.52), rgba(7,9,14,1) 62%)',
        color: '#f4f7ff',
      }}
    >
      <TopBar
        pageTitle="Notifications"
        notificationCount={events.filter((item) => item.unread).length}
        onChatClick={() => navigate('/chats')}
        onOneTapLock={() => navigate('/lock')}
      />

      <main
        style={{
          width: '100%',
          maxWidth: '760px',
          margin: '0 auto',
          padding: '0.9rem',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginBottom: '0.8rem',
            padding: '0.35rem 0.55rem',
            border: 0,
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.05)',
            color: '#aebbd5',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={15} />
          Back
        </button>

        <section
          style={{
            padding: '1.2rem',
            borderRadius: '1.45rem',
            background:
              'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.1))',
            border: '1px solid rgba(124,92,255,0.24)',
          }}
        >
          <Bell size={29} color="#9be8ff" />

          <h1
            style={{
              margin: '0.7rem 0 0',
              fontSize: '1.35rem',
              fontWeight: 900,
            }}
          >
            Smart Notifications &amp; Privacy
          </h1>

          <p
            style={{
              margin: '0.4rem 0 0',
              color: '#c1cce2',
              fontSize: '0.78rem',
              lineHeight: 1.5,
            }}
          >
            Control, protect, and intelligently organize every notification
            across your devices.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1rem',
              paddingTop: '0.9rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: '5.8rem',
                height: '5.8rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '999px',
                background: `conic-gradient(#61e8b4 ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
              }}
            >
              <div
                style={{
                  width: '4.8rem',
                  height: '4.8rem',
                  display: 'grid',
                  placeItems: 'center',
                  alignContent: 'center',
                  borderRadius: '999px',
                  background: '#111827',
                }}
              >
                <strong style={{ fontSize: '1.1rem' }}>{score}</strong>
                <span style={{ color: '#91a0bd', fontSize: '0.58rem' }}>
                  / 100
                </span>
              </div>
            </div>

            <div>
              <strong
                style={{
                  display: 'block',
                  color: '#83edc1',
                  fontSize: '0.8rem',
                }}
              >
                {level}
              </strong>

              <span
                style={{
                  display: 'block',
                  marginTop: '0.3rem',
                  color: '#aab7d0',
                  fontSize: '0.68rem',
                  lineHeight: 1.45,
                }}
              >
                Privacy redaction and notification organization are active.
              </span>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Instant Notification Actions
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.5rem',
              marginTop: '0.7rem',
            }}
          >
            {[
              ['Mark All Read', Check, markAllRead],
              ['Enable Privacy Mode', Shield, () => update({ privacyMode: true })],
              ['Hide Sensitive Notifications', Bell, () => toggleNested('privacy', 'hideMessageContent')],
              ['AI Notification Summary', Sparkles, () => showMessage('AI summary generated.')],
              ['Focus Mode', Focus, () => update({ focusMode: 'Work' })],
              ['Notification Settings', Bell, () => navigate('/notification-privacy')],
            ].map(([title, Icon, action]) => (
              <button
                key={title}
                type="button"
                onClick={() => {
                  action();
                  showMessage(`${title} applied.`);
                }}
                style={{
                  minHeight: '4.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dce5f8',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={16} color="#b8aaff" />
                {title}
              </button>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Aarush AI Notification Summary
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.5rem',
              marginTop: '0.7rem',
            }}
          >
            {[
              ['New messages', summary.messages],
              ['Mentions', summary.mentions],
              ['Security alerts', summary.securityAlerts],
              ['Memory reminders', summary.memoryReminders],
              ['Workspace updates', summary.workspaceUpdates],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: '0.7rem',
                  borderRadius: '0.85rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ color: '#8997b3', fontSize: '0.61rem' }}>
                  {label}
                </span>
                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.3rem',
                    color: '#edf2ff',
                    fontSize: '1rem',
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.45rem',
              marginTop: '0.7rem',
            }}
          >
            {['Read Summary', 'Open Important', 'Ignore Low Priority', 'Customize AI'].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => showMessage(`${label} is ready for AI notification integration.`)}
                  style={{
                    minHeight: '2.4rem',
                    flex: 1,
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#dce5f8',
                    fontSize: '0.56rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Notification Categories
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: '0.45rem',
              marginTop: '0.7rem',
            }}
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => showMessage(`${category} channel settings are ready.`)}
                style={{
                  minHeight: '2.6rem',
                  padding: '0.55rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '0.8rem',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dce5f8',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {category}
                <span
                  style={{
                    display: 'block',
                    marginTop: '0.2rem',
                    color: '#83e9c1',
                    fontSize: '0.55rem',
                  }}
                >
                  Enabled · Priority configurable
                </span>
              </button>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Smart Filters
          </h2>

          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              marginTop: '0.7rem',
              paddingBottom: '0.2rem',
            }}
          >
            {[
              'All',
              'Unread',
              'Today',
              'Yesterday',
              'Mentions',
              'Direct Messages',
              'Groups',
              'Security',
              'AI',
              'Workspace',
              'High Priority',
              'Hidden',
              'Archived',
              'Silent',
            ].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                style={{
                  flexShrink: 0,
                  minHeight: '2.2rem',
                  padding: '0 0.65rem',
                  border: activeFilter === filter
                    ? '1px solid rgba(124,92,255,0.35)'
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '999px',
                  background: activeFilter === filter
                    ? 'linear-gradient(135deg, rgba(124,92,255,0.25), rgba(77,215,255,0.12))'
                    : 'rgba(255,255,255,0.04)',
                  color: activeFilter === filter ? '#fff' : '#aebbd5',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
            {filteredEvents.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={markRead}
                onOpen={() => showMessage('Notification opened.')}
              />
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Focus Modes
          </h2>

          <select
            value={state.focusMode}
            onChange={(event) => update({ focusMode: event.target.value })}
            style={{
              width: '100%',
              minHeight: '2.7rem',
              marginTop: '0.7rem',
              padding: '0 0.7rem',
              borderRadius: '0.8rem',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#151b2b',
              color: '#edf3ff',
            }}
          >
            {focusModes.map((mode) => (
              <option key={mode}>{mode}</option>
            ))}
          </select>

          <p
            style={{
              margin: '0.55rem 0 0',
              color: '#8997b3',
              fontSize: '0.67rem',
              lineHeight: 1.45,
            }}
          >
            Each focus mode can later configure allowed contacts, groups,
            apps, sound, vibration, banner behavior, and AI auto-activation.
          </p>
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Notification Scheduling
          </h2>

          {[
            ['quietHours', 'Quiet Hours'],
            ['sleepSchedule', 'Sleep Schedule'],
            ['workSchedule', 'Work Schedule'],
            ['weekendSchedule', 'Weekend Schedule'],
            ['timeBasedDelivery', 'Time-Based Delivery'],
            ['batchDelivery', 'Batch Delivery'],
            ['hourlyDigest', 'Hourly Digest'],
            ['dailyDigest', 'Daily Digest'],
            ['aiSmartTiming', 'AI Smart Timing'],
          ].map(([id, title]) => (
            <div
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minHeight: '2.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.68rem',
              }}
            >
              <Clock3 size={14} color="#aebcda" />
              <span style={{ flex: 1 }}>{title}</span>
              <button
                type="button"
                role="switch"
                aria-checked={state.scheduling[id]}
                onClick={() => toggleNested('scheduling', id)}
                style={{
                  width: '2.35rem',
                  height: '1.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: state.scheduling[id]
                    ? 'flex-end'
                    : 'flex-start',
                  padding: '0.13rem',
                  border: 0,
                  borderRadius: '999px',
                  background: state.scheduling[id]
                    ? 'linear-gradient(135deg, #7c5cff, #4dd7ff)'
                    : 'rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '999px',
                    background: '#fff',
                  }}
                />
              </button>
            </div>
          ))}
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Notification Synchronization
          </h2>

          <p
            style={{
              margin: '0.35rem 0 0.7rem',
              color: '#8997b3',
              fontSize: '0.68rem',
              lineHeight: 1.45,
            }}
          >
            Cross-device synchronization is prepared for phones, tablets,
            desktops, web sessions, and wearables.
          </p>

          {[
            ['Last sync', 'Today, 10:42 AM'],
            ['Device count', '4 connected devices'],
            ['Duplicate prevention', 'Active'],
            ['Read sync status', 'Syncing'],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: '#cbd6ea',
                fontSize: '0.68rem',
              }}
            >
              <span>{label}</span>
              <strong style={{ color: '#edf2ff' }}>{value}</strong>
            </div>
          ))}
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Security Notifications
          </h2>

          {[
            'New Login',
            'New Device',
            'Password Change',
            'Two-Factor Events',
            'Screenshot Detection',
            'Screen Recording Detection',
            'Emergency Privacy Activation',
            'Session Revocation',
            'Vault Access',
            'AI Threat Detection',
          ].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minHeight: '2.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.68rem',
              }}
            >
              <Shield size={14} color="#aebcda" />
              <span style={{ flex: 1 }}>{item}</span>
              <span style={{ color: '#83e9c1', fontSize: '0.58rem' }}>
                Always deliver
              </span>
            </div>
          ))}
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Background Notification Systems
          </h2>

          {backgroundSystems.map(([item, status]) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minHeight: '2.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.68rem',
              }}
            >
              <RefreshCw size={14} color="#a9b8d6" />
              <span style={{ flex: 1 }}>{item}</span>
              <span
                style={{
                  color:
                    status === 'Protected'
                      ? '#8edfff'
                      : status === 'Syncing'
                        ? '#c8b8ff'
                        : '#83e9c1',
                  fontSize: '0.58rem',
                }}
              >
                {status}
              </span>
            </div>
          ))}
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Future Aarush Notification AI (Coming Soon)
          </h2>

          {[
            'Predictive Notification Timing',
            'AI Attention Detection',
            'Emotional Notification Filtering',
            'Context-Aware Delivery',
            'Autonomous Focus Mode',
            'Intelligent Notification Compression',
            'Cross-App Privacy Shield',
            'Universal Notification Assistant',
          ].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minHeight: '2.7rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.68rem',
                opacity: 0.68,
              }}
            >
              <Sparkles size={14} color="#b8aaff" />
              <span style={{ flex: 1 }}>{item}</span>
              <span style={{ color: '#9aa7c1', fontSize: '0.56rem' }}>
                Coming soon
              </span>
            </div>
          ))}
        </section>

        {message ? (
          <div
            role="status"
            style={{
              position: 'fixed',
              right: '1rem',
              bottom: '5.7rem',
              left: '1rem',
              zIndex: 1100,
              maxWidth: '520px',
              margin: '0 auto',
              padding: '0.75rem 0.9rem',
              borderRadius: '0.9rem',
              background: 'rgba(22,28,45,0.96)',
              border: '1px solid rgba(124,92,255,0.25)',
              color: '#dce6fa',
              fontSize: '0.74rem',
              textAlign: 'center',
            }}
          >
            {message}
          </div>
        ) : null}
      </main>

      <BottomNav />

      <style>{`
        button {
          -webkit-tap-highlight-color: transparent;
          transition: transform 180ms ease, filter 180ms ease;
        }

        button:not(:disabled):hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }
      `}</style>
    </div>
  );
}