import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Shield,
  SlidersHorizontal,
  UserRound,
  VolumeX,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import {
  getFollowing,
  getMutedUsers,
  getRestrictedUsers,
  muteUser,
  restrictUser,
  subscribeToBlockChanges,
  unmuteUser,
  unrestrictUser,
} from "../utils/followEngine";

const PROFILE_FIELDS = `
  id,
  username,
  full_name,
  avatar_url,
  is_private,
  show_followers,
  show_following,
  show_posts,
  show_stories,
  messaging_privacy,
  follow_request_mode,
  story_privacy
`;

const DEFAULT_SETTINGS = {
  is_private: false,
  show_followers: true,
  show_following: true,
  show_posts: true,
  show_stories: true,
  messaging_privacy: 'everyone',
  follow_request_mode: 'manual',
  story_privacy: 'followers',
};

function getDisplayName(profile) {
  return (
    profile?.full_name ||
    profile?.username ||
    'Aarush user'
  );
}

function getInitial(profile) {
  return getDisplayName(profile)
    .charAt(0)
    .toUpperCase();
}

function PrivacyAvatar({ profile }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={getDisplayName(profile)}
        className="privacy-user-avatar"
      />
    );
  }

  return (
    <div className="privacy-user-avatar privacy-user-avatar-fallback">
      {getInitial(profile)}
    </div>
  );
}

function normalizeManagedUser(row) {
  const profile =
    row?.profiles ||
    row?.profile ||
    row;

  return {
    ...profile,
    id:
      profile?.id ||
      row?.muted_user_id ||
      row?.restricted_user_id,
    relationId: row?.id,
  };
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <div className="privacy-setting-row">
      <div className="privacy-setting-icon">
        {icon}
      </div>

      <div className="privacy-setting-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <button
        type="button"
        className={
          checked
            ? 'privacy-toggle is-on'
            : 'privacy-toggle'
        }
        onClick={() => onChange(!checked)}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
        aria-label={title}
      >
        <span />
      </button>
    </div>
  );
}

function SelectRow({
  icon,
  title,
  description,
  value,
  options,
  onChange,
  disabled = false,
}) {
  return (
    <div className="privacy-setting-row privacy-select-row">
      <div className="privacy-setting-icon">
        {icon}
      </div>

      <div className="privacy-setting-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        aria-label={title}
      >
        {options.map((option) => (
          <option
            value={option.value}
            key={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SocialPrivacySettings() {
  const navigate = useNavigate();

  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);
  const [mutedUsers, setMutedUsers] = useState([]);
  const [restrictedUsers, setRestrictedUsers] =
    useState([]);
  const [following, setFollowing] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingPeople, setLoadingPeople] =
    useState(false);
  const [savingSettings, setSavingSettings] =
    useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [pickerMode, setPickerMode] =
    useState(null);
  const [search, setSearch] = useState('');

  const loadPrivacyData = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError('');
        setNotice('');

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error(
            'Sign in to manage social privacy.'
          );
        }

        const [
          profileResult,
          mutedResult,
          restrictedResult,
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select(PROFILE_FIELDS)
            .eq('id', user.id)
            .maybeSingle(),

          getMutedUsers({
            page: 0,
            pageSize: 100,
          }),

          getRestrictedUsers({
            page: 0,
            pageSize: 100,
          }),
        ]);

        if (profileResult.error) {
          throw profileResult.error;
        }

        setSettings({
          ...DEFAULT_SETTINGS,
          ...(profileResult.data || {}),
        });

        setMutedUsers(
          (mutedResult || []).map(normalizeManagedUser)
        );

        setRestrictedUsers(
          (restrictedResult || []).map(
            normalizeManagedUser
          )
        );
      } catch (loadError) {
        setError(
          loadError?.message ||
            'Unable to load social privacy settings.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPrivacyData();

    const unsubscribe = subscribeToBlockChanges(
      () => {
        loadPrivacyData({ refresh: true });
      }
    );

    return unsubscribe;
  }, [loadPrivacyData]);

  const updateSetting = async (key, value) => {
    const previousSettings = settings;
    const nextSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(nextSettings);
    setSavingSettings(true);
    setError('');
    setNotice('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          'Sign in to update privacy settings.'
        );
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          [key]: value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setNotice('Privacy setting updated.');
    } catch (updateError) {
      setSettings(previousSettings);
      setError(
        updateError?.message ||
          'Unable to update this setting.'
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const openPicker = async (mode) => {
    setPickerMode(mode);
    setSearch('');

    if (following.length > 0) {
      return;
    }

    try {
      setLoadingPeople(true);
      setError('');

      const profiles = await getFollowing(
        undefined,
        {
          page: 0,
          pageSize: 100,
        }
      );

      setFollowing(profiles || []);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load people you follow.'
      );
    } finally {
      setLoadingPeople(false);
    }
  };

  const closePicker = () => {
    if (savingId) {
      return;
    }

    setPickerMode(null);
    setSearch('');
  };

  const isMuted = (profileId) =>
    mutedUsers.some(
      (profile) => profile.id === profileId
    );

  const isRestricted = (profileId) =>
    restrictedUsers.some(
      (profile) => profile.id === profileId
    );

  const handleMute = async (profile) => {
    if (!profile?.id || savingId) {
      return;
    }

    try {
      setSavingId(profile.id);
      setError('');

      if (isMuted(profile.id)) {
        await unmuteUser(profile.id);
        setMutedUsers((current) =>
          current.filter(
            (item) => item.id !== profile.id
          )
        );
      } else {
        await muteUser(profile.id);
        setMutedUsers((current) => [
          profile,
          ...current.filter(
            (item) => item.id !== profile.id
          ),
        ]);
      }

      setNotice(
        isMuted(profile.id)
          ? 'User unmuted.'
          : 'User muted.'
      );
    } catch (actionError) {
      setError(
        actionError?.message ||
          'Unable to update mute settings.'
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleRestrict = async (profile) => {
    if (!profile?.id || savingId) {
      return;
    }

    try {
      setSavingId(profile.id);
      setError('');

      if (isRestricted(profile.id)) {
        await unrestrictUser(profile.id);
        setRestrictedUsers((current) =>
          current.filter(
            (item) => item.id !== profile.id
          )
        );
      } else {
        await restrictUser(profile.id);
        setRestrictedUsers((current) => [
          profile,
          ...current.filter(
            (item) => item.id !== profile.id
          ),
        ]);
      }

      setNotice(
        isRestricted(profile.id)
          ? 'User unrestricted.'
          : 'User restricted.'
      );
    } catch (actionError) {
      setError(
        actionError?.message ||
          'Unable to update restriction settings.'
      );
    } finally {
      setSavingId(null);
    }
  };

  const openProfile = (profile) => {
    if (!profile?.username) {
      return;
    }

    closePicker();
    navigate(`/profile/${profile.username}`);
  };

  const pickerUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return following.filter((profile) => {
      if (!query) {
        return true;
      }

      return [
        profile?.full_name,
        profile?.username,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [following, search]);

  const pickerTitle =
    pickerMode === 'muted'
      ? 'Manage muted users'
      : 'Manage restricted users';

  const pickerDescription =
    pickerMode === 'muted'
      ? 'Muted users will not send you activity notifications.'
      : 'Restricted users have limited interactions with you.';

  if (loading) {
    return (
      <div className="social-page social-privacy-page">
        <TopBar />

        <main className="social-page-content">
          <header className="social-page-header">
            <div className="social-skeleton privacy-loading-back" />
            <div>
              <div className="social-skeleton privacy-loading-eyebrow" />
              <div className="social-skeleton privacy-loading-title" />
            </div>
          </header>

          <div className="privacy-loading-card">
            <div className="social-skeleton privacy-loading-line" />
            <div className="social-skeleton privacy-loading-line short" />
            <div className="social-skeleton privacy-loading-row" />
            <div className="social-skeleton privacy-loading-row" />
            <div className="social-skeleton privacy-loading-row" />
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="social-page social-privacy-page">
      <TopBar />

      <main className="social-page-content">
        <header className="social-page-header">
          <button
            type="button"
            className="social-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="social-eyebrow">
              Settings
            </p>
            <h1>Social privacy</h1>
          </div>

          <button
            type="button"
            className="social-icon-button"
            onClick={() =>
              loadPrivacyData({ refresh: true })
            }
            disabled={refreshing}
            aria-label="Refresh privacy settings"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? 'social-spin'
                  : undefined
              }
            />
          </button>
        </header>

        <section className="privacy-hero-card">
          <div className="privacy-hero-icon">
            <Shield size={24} />
          </div>

          <div>
            <h2>Control your social experience</h2>
            <p>
              Choose who can see, contact, and interact
              with you on Aarush.
            </p>
          </div>
        </section>

        {error ? (
          <div
            className="social-error"
            role="alert"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() =>
                loadPrivacyData({ refresh: true })
              }
            >
              Try again
            </button>
          </div>
        ) : null}

        {notice ? (
          <div className="privacy-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="privacy-section">
          <div className="privacy-section-heading">
            <SlidersHorizontal size={17} />
            <div>
              <h2>Profile visibility</h2>
              <p>
                Decide what people can discover.
              </p>
            </div>
          </div>

          <div className="privacy-card">
            <ToggleRow
              icon={
                settings.is_private ? (
                  <Lock size={17} />
                ) : (
                  <Eye size={17} />
                )
              }
              title="Private account"
              description={
                settings.is_private
                  ? 'Only approved followers can see your shared content.'
                  : 'Anyone can discover your profile and public content.'
              }
              checked={Boolean(settings.is_private)}
              onChange={(value) =>
                updateSetting('is_private', value)
              }
              disabled={savingSettings}
            />

            <ToggleRow
              icon={<UserRound size={17} />}
              title="Show followers"
              description="Allow people to open your followers list."
              checked={Boolean(
                settings.show_followers
              )}
              onChange={(value) =>
                updateSetting(
                  'show_followers',
                  value
                )
              }
              disabled={savingSettings}
            />

            <ToggleRow
              icon={<UserRound size={17} />}
              title="Show following"
              description="Allow people to open your following list."
              checked={Boolean(
                settings.show_following
              )}
              onChange={(value) =>
                updateSetting(
                  'show_following',
                  value
                )
              }
              disabled={savingSettings}
            />

            <ToggleRow
              icon={
                settings.show_posts ? (
                  <Eye size={17} />
                ) : (
                  <EyeOff size={17} />
                )
              }
              title="Show posts"
              description="Control whether your posts appear to other people."
              checked={Boolean(settings.show_posts)}
              onChange={(value) =>
                updateSetting('show_posts', value)
              }
              disabled={savingSettings}
            />

            <ToggleRow
              icon={
                settings.show_stories ? (
                  <Eye size={17} />
                ) : (
                  <EyeOff size={17} />
                )
              }
              title="Show stories"
              description="Control who can view your active stories."
              checked={Boolean(
                settings.show_stories
              )}
              onChange={(value) =>
                updateSetting(
                  'show_stories',
                  value
                )
              }
              disabled={savingSettings}
            />
          </div>
        </section>

        <section className="privacy-section">
          <div className="privacy-section-heading">
            <MessageCircle size={17} />
            <div>
              <h2>Interactions</h2>
              <p>
                Set boundaries for requests and messages.
              </p>
            </div>
          </div>

          <div className="privacy-card">
            <SelectRow
              icon={<MessageCircle size={17} />}
              title="Who can message you"
              description="Choose who can start a conversation."
              value={
                settings.messaging_privacy ||
                'everyone'
              }
              onChange={(value) =>
                updateSetting(
                  'messaging_privacy',
                  value
                )
              }
              disabled={savingSettings}
              options={[
                {
                  value: 'everyone',
                  label: 'Everyone',
                },
                {
                  value: 'followers',
                  label: 'Followers',
                },
                {
                  value: 'following',
                  label: 'People you follow',
                },
              ]}
            />

            <SelectRow
              icon={<UserRound size={17} />}
              title="Follow requests"
              description="Choose how new follow requests work."
              value={
                settings.follow_request_mode ||
                'manual'
              }
              onChange={(value) =>
                updateSetting(
                  'follow_request_mode',
                  value
                )
              }
              disabled={savingSettings}
              options={[
                {
                  value: 'manual',
                  label: 'Approve manually',
                },
                {
                  value: 'auto_accept',
                  label: 'Accept automatically',
                },
              ]}
            />

            <SelectRow
              icon={<Eye size={17} />}
              title="Story audience"
              description="Choose the default audience for stories."
              value={
                settings.story_privacy ||
                'followers'
              }
              onChange={(value) =>
                updateSetting(
                  'story_privacy',
                  value
                )
              }
              disabled={savingSettings}
              options={[
                {
                  value: 'everyone',
                  label: 'Everyone',
                },
                {
                  value: 'followers',
                  label: 'Followers',
                },
                {
                  value: 'close_friends',
                  label: 'Close friends',
                },
              ]}
            />
          </div>
        </section>

        <section className="privacy-section">
          <div className="privacy-section-heading">
            <Shield size={17} />
            <div>
              <h2>Manage people</h2>
              <p>
                Mute or restrict profiles without blocking them.
              </p>
            </div>
          </div>

          <div className="privacy-card">
            <button
              type="button"
              className="privacy-action-row"
              onClick={() => openPicker('muted')}
            >
              <div className="privacy-setting-icon">
                <VolumeX size={17} />
              </div>

              <span className="privacy-setting-copy">
                <strong>Muted users</strong>
                <span>
                  {mutedUsers.length} muted{' '}
                  {mutedUsers.length === 1
                    ? 'profile'
                    : 'profiles'}
                </span>
              </span>

              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              className="privacy-action-row"
              onClick={() =>
                openPicker('restricted')
              }
            >
              <div className="privacy-setting-icon">
                <Shield size={17} />
              </div>

              <span className="privacy-setting-copy">
                <strong>Restricted users</strong>
                <span>
                  {restrictedUsers.length} restricted{' '}
                  {restrictedUsers.length === 1
                    ? 'profile'
                    : 'profiles'}
                </span>
              </span>

              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              className="privacy-action-row"
              onClick={() => navigate('/blocked-users')}
            >
              <div className="privacy-setting-icon">
                <Ban size={17} />
              </div>

              <span className="privacy-setting-copy">
                <strong>Blocked users</strong>
                <span>
                  Manage profiles you have blocked.
                </span>
              </span>

              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        <p className="privacy-footer-note">
          Your social privacy choices are saved to your
          Aarush account and apply across devices.
        </p>
      </main>

      <BottomNav />

      {pickerMode ? (
        <div
          className="privacy-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePicker();
            }
          }}
        >
          <section
            className="privacy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-modal-title"
          >
            <header className="privacy-modal-header">
              <div>
                <p className="social-eyebrow">
                  Manage people
                </p>
                <h2 id="privacy-modal-title">
                  {pickerTitle}
                </h2>
              </div>

              <button
                type="button"
                className="social-icon-button"
                onClick={closePicker}
                disabled={Boolean(savingId)}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </header>

            <p className="privacy-modal-description">
              {pickerDescription}
            </p>

            <label className="privacy-search">
              <Search size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search people you follow"
                autoFocus
              />
            </label>

            {loadingPeople ? (
              <div className="privacy-picker-empty">
                Loading people you follow…
              </div>
            ) : pickerUsers.length === 0 ? (
              <div className="privacy-picker-empty">
                <UserRound size={22} />
                <span>
                  No matching people found.
                </span>
              </div>
            ) : (
              <div className="privacy-picker-list">
                {pickerUsers.map((profile) => {
                  const active =
                    pickerMode === 'muted'
                      ? isMuted(profile.id)
                      : isRestricted(profile.id);

                  const busy =
                    savingId === profile.id;

                  return (
                    <div
                      className="privacy-picker-row"
                      key={profile.id}
                    >
                      <button
                        type="button"
                        className="privacy-profile-button"
                        onClick={() =>
                          openProfile(profile)
                        }
                      >
                        <PrivacyAvatar
                          profile={profile}
                        />

                        <span>
                          <strong>
                            {getDisplayName(profile)}
                          </strong>
                          <small>
                            {profile?.username
                              ? `@${profile.username}`
                              : 'Aarush member'}
                          </small>
                        </span>
                      </button>

                      <button
                        type="button"
                        className={
                          active
                            ? 'privacy-remove-button'
                            : 'privacy-add-button'
                        }
                        onClick={() =>
                          pickerMode === 'muted'
                            ? handleMute(profile)
                            : handleRestrict(profile)
                        }
                        disabled={busy}
                      >
                        {active ? (
                          <>
                            <Check size={15} />
                            <span>
                              {pickerMode === 'muted'
                                ? 'Muted'
                                : 'Restricted'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Plus size={15} />
                            <span>
                              {pickerMode === 'muted'
                                ? 'Mute'
                                : 'Restrict'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      ) : null}

      <style>{`
        .social-page {
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
              rgba(77,215,255,0.11),
              transparent 30%
            ),
            #080b13;
        }

        .social-page-content {
          width: min(100%, 760px);
          margin: 0 auto;
          padding: 1.1rem 1rem 7rem;
        }

        .social-page-header {
          display: grid;
          grid-template-columns: 2.5rem 1fr 2.5rem;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .social-page-header h1 {
          margin: 0;
          font-size: 1.35rem;
          letter-spacing: -0.03em;
        }

        .social-eyebrow {
          margin: 0 0 0.2rem;
          color: #8d9abb;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .social-icon-button {
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

        .social-icon-button:last-child {
          justify-self: end;
        }

        .social-icon-button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .privacy-hero-card,
        .privacy-card,
        .privacy-loading-card,
        .privacy-error {
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(17,22,36,0.72);
          box-shadow: 0 20px 55px rgba(0,0,0,0.18);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .privacy-hero-card {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1rem;
          padding: 1rem;
          border-radius: 1.25rem;
        }

        .privacy-hero-icon {
          width: 3.1rem;
          height: 3.1rem;
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
          box-shadow: 0 8px 25px rgba(124,92,255,0.24);
        }

        .privacy-hero-card h2 {
          margin: 0;
          font-size: 0.98rem;
        }

        .privacy-hero-card p {
          margin: 0.3rem 0 0;
          color: #98a5c2;
          font-size: 0.8rem;
          line-height: 1.45;
        }

        .social-error,
        .privacy-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.8rem 0.9rem;
          border-radius: 1rem;
          font-size: 0.78rem;
        }

        .social-error {
          justify-content: space-between;
          border: 1px solid rgba(255,91,132,0.26);
          color: #ffc2d0;
          background: rgba(255,91,132,0.08);
        }

        .social-error button {
          border: 0;
          color: #d9ceff;
          background: transparent;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
        }

        .privacy-notice {
          border: 1px solid rgba(77,215,255,0.2);
          color: #c9f9ff;
          background: rgba(77,215,255,0.08);
        }

        .privacy-section {
          margin-top: 1.2rem;
        }

        .privacy-section-heading {
          display: flex;
          align-items: flex-start;
          gap: 0.55rem;
          margin: 0 0 0.55rem 0.2rem;
          color: #aeb9d0;
        }

        .privacy-section-heading > svg {
          margin-top: 0.1rem;
          color: #9d8aff;
        }

        .privacy-section-heading h2 {
          margin: 0;
          color: #eaf0ff;
          font-size: 0.86rem;
        }

        .privacy-section-heading p {
          margin: 0.2rem 0 0;
          color: #75829e;
          font-size: 0.7rem;
        }

        .privacy-card {
          overflow: hidden;
          border-radius: 1.2rem;
        }

        .privacy-setting-row,
        .privacy-action-row {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          min-height: 4.3rem;
          padding: 0.8rem 0.9rem;
        }

        .privacy-setting-row + .privacy-setting-row,
        .privacy-action-row + .privacy-action-row {
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        .privacy-setting-icon {
          width: 2.25rem;
          height: 2.25rem;
          display: grid;
          flex: 0 0 auto;
          place-items: center;
          border-radius: 0.75rem;
          color: #c8bfff;
          background: rgba(124,92,255,0.13);
        }

        .privacy-setting-copy {
          min-width: 0;
          flex: 1;
          display: grid;
          gap: 0.2rem;
        }

        .privacy-setting-copy strong {
          color: #edf2ff;
          font-size: 0.8rem;
        }

        .privacy-setting-copy span {
          color: #8491ad;
          font-size: 0.7rem;
          line-height: 1.35;
        }

        .privacy-toggle {
          width: 2.65rem;
          height: 1.5rem;
          flex: 0 0 auto;
          padding: 0.15rem;
          border: 0;
          border-radius: 999px;
          background: rgba(255,255,255,0.15);
          cursor: pointer;
        }

        .privacy-toggle span {
          display: block;
          width: 1.2rem;
          height: 1.2rem;
          border-radius: 50%;
          background: #a6b2ca;
          transition: transform 0.2s ease;
        }

        .privacy-toggle.is-on {
          background: linear-gradient(
            135deg,
            #7c5cff,
            #4dd7ff
          );
        }

        .privacy-toggle.is-on span {
          background: #fff;
          transform: translateX(1.15rem);
        }

        .privacy-toggle:disabled,
        .privacy-select-row select:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .privacy-select-row select {
          max-width: 9.2rem;
          padding: 0.5rem 0.55rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.65rem;
          outline: 0;
          color: #e9eeff;
          background: #171d30;
          font-size: 0.7rem;
        }

        .privacy-action-row {
          width: 100%;
          border: 0;
          color: inherit;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .privacy-action-row > svg {
          color: #7483a1;
        }

        .privacy-footer-note {
          margin: 1.3rem 0 0;
          color: #697691;
          font-size: 0.7rem;
          line-height: 1.5;
          text-align: center;
        }

        .privacy-modal-backdrop {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: grid;
          align-items: end;
          padding: 1rem;
          background: rgba(3,5,10,0.68);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .privacy-modal {
          width: min(100%, 620px);
          max-height: min(75vh, 680px);
          overflow: auto;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 1.4rem;
          background: rgba(14,18,31,0.98);
          box-shadow: 0 -20px 70px rgba(0,0,0,0.42);
        }

        .privacy-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .privacy-modal-header h2 {
          margin: 0;
          font-size: 1.05rem;
        }

        .privacy-modal-description {
          margin: 0.7rem 0 1rem;
          color: #8996b1;
          font-size: 0.76rem;
          line-height: 1.45;
        }

        .privacy-search {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          min-height: 2.8rem;
          margin-bottom: 0.8rem;
          padding: 0 0.85rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.9rem;
          color: #8390ac;
          background: rgba(255,255,255,0.05);
        }

        .privacy-search input {
          width: 100%;
          border: 0;
          outline: 0;
          color: #f4f7ff;
          background: transparent;
          font: inherit;
          font-size: 0.8rem;
        }

        .privacy-search input::placeholder {
          color: #687590;
        }

        .privacy-picker-list {
          display: grid;
          gap: 0.4rem;
        }

        .privacy-picker-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.7rem;
          padding: 0.55rem;
          border-radius: 0.95rem;
          background: rgba(255,255,255,0.035);
        }

        .privacy-profile-button {
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0;
          border: 0;
          color: inherit;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .privacy-profile-button > span {
          min-width: 0;
          display: grid;
          gap: 0.15rem;
        }

        .privacy-profile-button strong,
        .privacy-profile-button small {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .privacy-profile-button strong {
          font-size: 0.8rem;
        }

        .privacy-profile-button small {
          color: #8996b1;
          font-size: 0.7rem;
        }

        .privacy-user-avatar {
          width: 2.65rem;
          height: 2.65rem;
          flex: 0 0 auto;
          border-radius: 0.85rem;
          object-fit: cover;
          background: #202a43;
        }

        .privacy-user-avatar-fallback {
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(
            135deg,
            #7c5cff,
            #4f91ff
          );
          font-weight: 900;
        }

        .privacy-add-button,
        .privacy-remove-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          min-height: 2.25rem;
          padding: 0.55rem 0.7rem;
          border-radius: 0.75rem;
          font-size: 0.7rem;
          font-weight: 850;
          cursor: pointer;
        }

        .privacy-add-button {
          border: 1px solid rgba(124,92,255,0.3);
          color: #e4dcff;
          background: rgba(124,92,255,0.12);
        }

        .privacy-remove-button {
          border: 1px solid rgba(77,215,255,0.24);
          color: #d9fbff;
          background: rgba(77,215,255,0.11);
        }

        .privacy-add-button:disabled,
        .privacy-remove-button:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .privacy-picker-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 8rem;
          color: #8d9abb;
          font-size: 0.8rem;
          text-align: center;
        }

        .social-skeleton {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.06),
            rgba(255,255,255,0.12),
            rgba(255,255,255,0.06)
          );
          background-size: 220% 100%;
          animation: aarush-skeleton 1.4s infinite;
        }

        .privacy-loading-card {
          display: grid;
          gap: 1rem;
          padding: 1rem;
          border-radius: 1.2rem;
        }

        .privacy-loading-back {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.9rem;
        }

        .privacy-loading-eyebrow {
          width: 4rem;
          height: 0.5rem;
          border-radius: 999px;
        }

        .privacy-loading-title {
          width: 10rem;
          height: 1rem;
          margin-top: 0.35rem;
          border-radius: 999px;
        }

        .privacy-loading-line {
          width: 55%;
          height: 0.7rem;
          border-radius: 999px;
        }

        .privacy-loading-line.short {
          width: 35%;
        }

        .privacy-loading-row {
          width: 100%;
          height: 3.5rem;
          border-radius: 0.9rem;
        }

        .social-spin {
          animation: aarush-spin 0.9s linear infinite;
        }

        @keyframes aarush-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes aarush-skeleton {
          to {
            background-position: -220% 0;
          }
        }

        @media (max-width: 560px) {
          .privacy-select-row {
            align-items: flex-start;
          }

          .privacy-select-row select {
            max-width: 7.3rem;
          }

          .privacy-add-button span,
          .privacy-remove-button span {
            display: none;
          }

          .privacy-add-button,
          .privacy-remove-button {
            width: 2.25rem;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}