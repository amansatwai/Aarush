import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  CircleUserRound,
  Copy,
  Download,
  Eye,
  Image,
  Mail,
  MapPin,
  Palette,
  Phone,
  RefreshCw,
  Save,
  Settings2,
  Share2,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
};

const DEFAULT_PROFILE = {
  full_name: '',
  username: '',
  bio: '',
  website: '',
  location: '',
  profession: '',
  account_type: 'Personal',
  is_private: false,
  avatar_url: '',
  pronouns: '',
  date_of_birth: '',
  gender: '',
  language: 'English',
  region: 'India',
  time_zone: 'Asia/Kolkata',
  date_format: 'DD/MM/YYYY',
  hour_format: '12-hour',
  content_preference: 'Balanced',
  profile_theme: 'Dark',
  accent_color: 'Purple / Blue',
  gradient_style: 'Aurora',
  avatar_ring: true,
  profile_badge: true,
  show_email: false,
  show_phone: false,
  show_birthday: false,
  show_location: false,
  show_profession: true,
  show_online_status: false,
  email: '',
  phone: '',
  backup_email: '',
  backup_phone: '',
};

function isGuestMode() {
  return (
    localStorage.getItem(GUEST_KEYS.isGuest) === 'true' &&
    localStorage.getItem(GUEST_KEYS.guestSession) !== null
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section style={styles.card}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionIcon}>
          <Icon size={17} />
        </span>

        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  disabled = false,
}) {
  return (
    <label style={styles.field}>
      <span>{label}</span>

      <input
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          ...styles.input,
          ...(error ? styles.inputError : {}),
          ...(disabled ? styles.disabledInput : {}),
        }}
      />

      {error ? (
        <small style={styles.errorText}>{error}</small>
      ) : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  disabled = false,
}) {
  return (
    <label style={styles.field}>
      <span>{label}</span>

      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        style={{
          ...styles.input,
          ...(disabled ? styles.disabledInput : {}),
        }}
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  value,
  onChange,
  disabled = false,
}) {
  return (
    <label
      style={{
        ...styles.toggleRow,
        ...(disabled ? styles.disabledRow : {}),
      }}
    >
      <span style={styles.smallIcon}>
        <Icon size={17} />
      </span>

      <span style={styles.rowCopy}>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        style={styles.checkbox}
      />
    </label>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.actionButton,
        ...(danger ? styles.dangerAction : {}),
        ...(disabled ? styles.disabledAction : {}),
      }}
    >
      <Icon size={16} />
      <span>{label}</span>
      <ChevronRight size={15} />
    </button>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value || 'Not set'}</strong>
    </div>
  );
}

function VerificationRow({ label, status }) {
  const verified = status === 'Verified';
  const pending = status === 'Pending';

  return (
    <div style={styles.verificationRow}>
      <span>{label}</span>

      <span
        style={{
          ...styles.verificationStatus,
          color: verified
            ? '#82e9c1'
            : pending
              ? '#ffd27d'
              : '#ffb1c8',
        }}
      >
        {verified ? <Check size={13} /> : null}
        {status}
      </span>
    </div>
  );
}

export default function ProfileSettings() {
  const navigate = useNavigate();

  const guest = useMemo(() => isGuestMode(), []);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [originalProfile, setOriginalProfile] =
    useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [photoPreview, setPhotoPreview] = useState('');

  const hasChanges = useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(originalProfile),
    [profile, originalProfile]
  );

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (guest) {
        if (mounted) {
          setLoading(false);
          setMessage(
            'Profile editing is not available in Guest Mode.'
          );
          setMessageType('info');
        }

        return;
      }

      try {
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !currentUser) {
          navigate('/login', { replace: true });
          return;
        }

        const { data: profileRow, error: profileError } =
          await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        const mergedProfile = {
          ...DEFAULT_PROFILE,
          ...(profileRow || {}),
          email:
            profileRow?.email ||
            currentUser.email ||
            DEFAULT_PROFILE.email,
        };

        if (!mounted) {
          return;
        }

        setUser(currentUser);
        setProfile(mergedProfile);
        setOriginalProfile(mergedProfile);
        setPhotoPreview(mergedProfile.avatar_url || '');
      } catch (error) {
        if (mounted) {
          setMessage(
            error.message || 'Unable to load profile settings.'
          );
          setMessageType('error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [guest, navigate]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: '',
    }));
  };

  const updateValue = (name, value) => {
    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!profile.full_name.trim()) {
      nextErrors.full_name = 'Full name is required.';
    }

    if (!profile.username.trim()) {
      nextErrors.username = 'Username is required.';
    } else if (!/^[a-zA-Z0-9._]+$/.test(profile.username)) {
      nextErrors.username =
        'Use only letters, numbers, dots, and underscores.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveProfile = async () => {
    if (guest) {
      setMessage(
        'Profile editing is not available in Guest Mode.'
      );
      setMessageType('info');
      return;
    }

    if (!user || !validate()) {
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const normalizedUsername = profile.username
        .trim()
        .toLowerCase();

      const { data: existingProfile, error: usernameError } =
        await supabase
          .from('profiles')
          .select('id')
          .eq('username', normalizedUsername)
          .neq('id', user.id)
          .maybeSingle();

      if (usernameError) {
        throw usernameError;
      }

      if (existingProfile) {
        setErrors((current) => ({
          ...current,
          username: 'This username is already taken.',
        }));
        setMessageType('error');
        setMessage('Please choose a different username.');
        return;
      }

      const updatePayload = {
        full_name: profile.full_name.trim(),
        username: normalizedUsername,
        bio: profile.bio?.trim() || '',
        website: profile.website?.trim() || '',
        location: profile.location?.trim() || '',
        profession: profile.profession?.trim() || '',
        account_type: profile.account_type || 'Personal',
        is_private: Boolean(profile.is_private),
        avatar_url: profile.avatar_url || null,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedProfile, error: updateError } =
        await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', user.id)
          .select()
          .single();

      if (updateError) {
        throw updateError;
      }

      const nextProfile = {
        ...profile,
        ...updatedProfile,
      };

      setProfile(nextProfile);
      setOriginalProfile(nextProfile);
      setMessage('Profile changes saved successfully.');
      setMessageType('success');
    } catch (error) {
      setMessage(
        error.message || 'Unable to save profile changes.'
      );
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !user || guest) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file.');
      setMessageType('error');
      return;
    }

    try {
      setUploading(true);
      setMessage('');

      const extension =
        file.name.split('.').pop()?.toLowerCase() || 'jpg';

      const filePath = `${user.id}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData?.publicUrl;

      if (!avatarUrl) {
        throw new Error('Unable to generate avatar URL.');
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      setProfile((current) => ({
        ...current,
        avatar_url: avatarUrl,
      }));

      setOriginalProfile((current) => ({
        ...current,
        avatar_url: avatarUrl,
      }));

      setPhotoPreview(avatarUrl);
      setMessage('Profile photo updated successfully.');
      setMessageType('success');
    } catch (error) {
      setMessage(
        error.message || 'Unable to upload profile photo.'
      );
      setMessageType('error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeAvatar = async () => {
    if (!user || guest) {
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setProfile((current) => ({
        ...current,
        avatar_url: '',
      }));

      setOriginalProfile((current) => ({
        ...current,
        avatar_url: '',
      }));

      setPhotoPreview('');
      setMessage('Profile photo removed.');
      setMessageType('success');
    } catch (error) {
      setMessage(
        error.message || 'Unable to remove profile photo.'
      );
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const copyProfileLink = async () => {
    const profileLink = `${window.location.origin}/profile`;

    try {
      await navigator.clipboard.writeText(profileLink);
      setMessage('Profile link copied.');
      setMessageType('success');
    } catch {
      setMessage(profileLink);
      setMessageType('info');
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <TopBar pageTitle="Profile Settings" showBackButton />

        <main style={styles.loadingState}>
          <RefreshCw size={24} />
          <span>Loading profile settings…</span>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Profile Settings"
        profileMode
        username={`@${profile.username || 'user'}`}
        onMenuClick={() => navigate('/profile')}
      />

      <main style={styles.content}>
        {guest ? (
          <div style={styles.guestNotice}>
            <ShieldCheck size={18} />
            <span>
              Profile editing is not available in Guest Mode.
            </span>
          </div>
        ) : null}

        {message ? (
          <div
            role="status"
            style={{
              ...styles.message,
              ...(messageType === 'error'
                ? styles.errorMessage
                : messageType === 'info'
                  ? styles.infoMessage
                  : {}),
            }}
          >
            {message}
          </div>
        ) : null}

        <section style={styles.hero}>
          <span style={styles.heroIcon}>
            <UserRound size={25} />
          </span>

          <div style={styles.heroCopy}>
            <h1 style={styles.title}>Profile Settings</h1>
            <p style={styles.subtitle}>
              Manage your personal information, profile appearance,
              and account identity.
            </p>
          </div>

          {hasChanges(profile, originalProfile) ? (
            <span style={styles.unsavedBadge}>
              Unsaved changes
            </span>
          ) : null}
        </section>

        <Section icon={UserRound} title="Profile Information">
          <div style={styles.photoArea}>
            <div
              style={{
                ...styles.avatar,
                ...(profile.avatar_ring
                  ? styles.avatarRing
                  : {}),
                backgroundImage: photoPreview
                  ? `url(${photoPreview})`
                  : undefined,
              }}
            >
              {!photoPreview ? <UserRound size={34} /> : null}
            </div>

            <div style={styles.photoActions}>
              <strong>Profile Photo</strong>
              <small>
                Upload a clear image that represents you.
              </small>

              {!guest ? (
                <div style={styles.buttonRow}>
                  <label
                    style={{
                      ...styles.smallAction,
                      opacity: uploading ? 0.6 : 1,
                    }}
                  >
                    <Camera size={14} />
                    {uploading ? 'Uploading…' : 'Change Photo'}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      disabled={uploading}
                      style={styles.hiddenInput}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={removeAvatar}
                    disabled={saving || uploading}
                    style={styles.smallDangerAction}
                  >
                    <Trash2 size={14} />
                    Remove Photo
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div style={styles.grid}>
            <Field
              label="Full Name"
              name="full_name"
              value={profile.full_name}
              onChange={updateField}
              placeholder="Your full name"
              error={errors.full_name}
              disabled={guest}
            />

            <Field
              label="Username"
              name="username"
              value={profile.username}
              onChange={updateField}
              placeholder="your.username"
              error={errors.username}
              disabled={guest}
            />

            <Field
              label="Bio"
              name="bio"
              value={profile.bio}
              onChange={updateField}
              placeholder="Tell people about yourself"
              disabled={guest}
            />

            <Field
              label="Website"
              name="website"
              value={profile.website}
              onChange={updateField}
              placeholder="example.com"
              disabled={guest}
            />

            <Field
              label="Location"
              name="location"
              value={profile.location}
              onChange={updateField}
              placeholder="City or region"
              disabled={guest}
            />

            <Field
              label="Profession"
              name="profession"
              value={profile.profession}
              onChange={updateField}
              placeholder="Your profession"
              disabled={guest}
            />

            <SelectField
              label="Account Type"
              name="account_type"
              value={profile.account_type}
              onChange={updateField}
              options={['Personal', 'Creator', 'Business']}
              disabled={guest}
            />

            <SelectField
              label="Gender"
              name="gender"
              value={profile.gender}
              onChange={updateField}
              options={[
                'Woman',
                'Man',
                'Non-binary',
                'Prefer not to say',
              ]}
              disabled={guest}
            />

            <Field
              label="Pronouns"
              name="pronouns"
              value={profile.pronouns}
              onChange={updateField}
              placeholder="Optional"
              disabled={guest}
            />

            <Field
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={profile.date_of_birth}
              onChange={updateField}
              disabled={guest}
            />
          </div>

          <div style={styles.placeholderBox}>
            <Image size={17} />
            <span>Crop placeholder and profile preview</span>
          </div>
        </Section>

        <Section
          icon={Palette}
          title="Cover / Profile Appearance"
        >
          <div style={styles.grid}>
            <SelectField
              label="Profile Theme"
              name="profile_theme"
              value={profile.profile_theme}
              onChange={updateField}
              options={['Dark', 'Light', 'System']}
              disabled={guest}
            />

            <SelectField
              label="Accent Color"
              name="accent_color"
              value={profile.accent_color}
              onChange={updateField}
              options={[
                'Purple / Blue',
                'Violet / Pink',
                'Cyan / Purple',
              ]}
              disabled={guest}
            />

            <SelectField
              label="Gradient Style"
              name="gradient_style"
              value={profile.gradient_style}
              onChange={updateField}
              options={['Aurora', 'Midnight', 'Ocean', 'Violet']}
              disabled={guest}
            />
          </div>

          <div style={styles.settingsList}>
            <ToggleRow
              icon={CircleUserRound}
              title="Avatar Ring"
              description="Show a premium gradient ring around your avatar."
              value={profile.avatar_ring}
              onChange={(value) =>
                updateValue('avatar_ring', value)
              }
              disabled={guest}
            />

            <ToggleRow
              icon={BadgeCheck}
              title="Profile Badge"
              description="Show your profile status badge."
              value={profile.profile_badge}
              onChange={(value) =>
                updateValue('profile_badge', value)
              }
              disabled={guest}
            />
          </div>
        </Section>

        <Section icon={BadgeCheck} title="Account Identity">
          <InfoRow
            label="User ID"
            value={user?.id || 'Unavailable'}
          />
          <InfoRow
            label="Username"
            value={
              profile.username
                ? `@${profile.username}`
                : 'Not set'
            }
          />
          <InfoRow
            label="Account Type"
            value={profile.account_type}
          />
          <InfoRow
            label="Verification Status"
            value="Not verified"
          />
          <InfoRow label="Member Since" value="Current account" />
          <InfoRow
            label="Last Profile Update"
            value={
              profile.updated_at
                ? new Date(
                    profile.updated_at
                  ).toLocaleString()
                : 'Not available'
            }
          />

          <div style={styles.buttonRow}>
            <ActionButton
              icon={Copy}
              label="Copy Profile Link"
              onClick={copyProfileLink}
            />

            <ActionButton
              icon={Share2}
              label="Share Profile"
              onClick={copyProfileLink}
            />
          </div>
        </Section>

        <Section icon={Mail} title="Contact Information">
          <div style={styles.grid}>
            <Field
              label="Email"
              name="email"
              type="email"
              value={profile.email}
              onChange={updateField}
              placeholder="you@example.com"
              error={errors.email}
              disabled={guest}
            />

            <Field
              label="Phone Number"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={updateField}
              placeholder="Optional"
              disabled={guest}
            />

            <Field
              label="Backup Email"
              name="backup_email"
              type="email"
              value={profile.backup_email}
              onChange={updateField}
              placeholder="backup@example.com"
              error={errors.backup_email}
              disabled={guest}
            />

            <Field
              label="Backup Phone"
              name="backup_phone"
              type="tel"
              value={profile.backup_phone}
              onChange={updateField}
              placeholder="Optional"
              disabled={guest}
            />
          </div>

          <div style={styles.verificationList}>
            <VerificationRow
              label="Email verification"
              status={
                profile.email ? 'Verified' : 'Not Verified'
              }
            />

            <VerificationRow
              label="Phone verification"
              status={
                profile.phone ? 'Pending' : 'Not Verified'
              }
            />
          </div>
        </Section>

        <Section icon={Eye} title="Profile Visibility">
          <div style={styles.settingsList}>
            <ToggleRow
              icon={Mail}
              title="Show Email"
              description="Display your email on your public profile."
              value={profile.show_email}
              onChange={(value) =>
                updateValue('show_email', value)
              }
              disabled={guest}
            />

            <ToggleRow
              icon={Phone}
              title="Show Phone"
              description="Display your phone number publicly."
              value={profile.show_phone}
              onChange={(value) =>
                updateValue('show_phone', value)
              }
              disabled={guest}
            />

            <ToggleRow
              icon={CalendarDays}
              title="Show Birthday"
              description="Display your birthday on your profile."
              value={profile.show_birthday}
              onChange={(value) =>
                updateValue('show_birthday', value)
              }
              disabled={guest}
            />

            <ToggleRow
              icon={MapPin}
              title="Show Location"
              description="Display your location publicly."
              value={profile.show_location}
              onChange={(value) =>
                updateValue('show_location', value)
              }
              disabled={guest}
            />

            <ToggleRow
              icon={Users}
              title="Show Profession"
              description="Display your profession on your profile."
              value={profile.show_profession}
              onChange={(value) =>
                updateValue('show_profession', value)
              }
              disabled={guest}
            />

            <ToggleRow
              icon={ShieldCheck}
              title="Show Online Status"
              description="Allow people to see when you are online."
              value={profile.show_online_status}
              onChange={(value) =>
                updateValue('show_online_status', value)
              }
              disabled={guest}
            />
          </div>
        </Section>

        <Section
          icon={Settings2}
          title="Personal Preferences"
        >
          <div style={styles.grid}>
            <SelectField
              label="Language"
              name="language"
              value={profile.language}
              onChange={updateField}
              options={[
                'English',
                'Hindi',
                'Spanish',
                'French',
              ]}
              disabled={guest}
            />

            <SelectField
              label="Region"
              name="region"
              value={profile.region}
              onChange={updateField}
              options={[
                'India',
                'United States',
                'United Kingdom',
              ]}
              disabled={guest}
            />

            <SelectField
              label="Time Zone"
              name="time_zone"
              value={profile.time_zone}
              onChange={updateField}
              options={[
                'Asia/Kolkata',
                'America/New_York',
                'Europe/London',
              ]}
              disabled={guest}
            />

            <SelectField
              label="Date Format"
              name="date_format"
              value={profile.date_format}
              onChange={updateField}
              options={[
                'DD/MM/YYYY',
                'MM/DD/YYYY',
                'YYYY-MM-DD',
              ]}
              disabled={guest}
            />

            <SelectField
              label="12/24 Hour Format"
              name="hour_format"
              value={profile.hour_format}
              onChange={updateField}
              options={['12-hour', '24-hour']}
              disabled={guest}
            />

            <SelectField
              label="Content Preferences"
              name="content_preference"
              value={profile.content_preference}
              onChange={updateField}
              options={[
                'Balanced',
                'Latest',
                'Recommended',
              ]}
              disabled={guest}
            />
          </div>
        </Section>

        <Section icon={Settings2} title="Account Actions">
          <button
            type="submit"
            disabled={guest || saving || uploading}
            style={{
              ...styles.primaryButton,
              opacity: guest || saving || uploading ? 0.55 : 1,
            }}
          >
            <Save size={16} />
            {saving ? 'Saving Changes…' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => {
              setProfile(originalProfile);
              setErrors({});
              setMessage('Unsaved changes have been reset.');
              setMessageType('success');
            }}
            disabled={!hasChanges || guest || saving}
            style={{
              ...styles.actionButton,
              opacity:
                !hasChanges || guest || saving ? 0.45 : 1,
            }}
          >
            <RefreshCw size={15} />
            Reset Changes
          </button>

          <ActionButton
            icon={ShieldCheck}
            label="Open Privacy Center"
            onClick={() => navigate('/privacy-center')}
          />

          <ActionButton
            icon={ShieldCheck}
            label="Open Security Center"
            onClick={() => navigate('/security-center')}
          />

          <ActionButton
            icon={Download}
            label="Download My Profile Data"
            onClick={() =>
              notify('Profile data download prepared.')
            }
          />

          <ActionButton
            icon={Trash2}
            label="Delete Profile Picture"
            onClick={removeAvatar}
            disabled={guest || saving}
            danger
          />
        </Section>
      </main>

      <BottomNav />
    </div>
  );
}

function hasChanges(current, original) {
  return JSON.stringify(current) !== JSON.stringify(original);
}

function notify(value) {
  window.dispatchEvent(
    new CustomEvent('aarush-profile-message', {
      detail: value,
    })
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '6.8rem',
    background:
      'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
    color: '#f4f7ff',
  },

  content: {
    width: '100%',
    maxWidth: '860px',
    margin: '0 auto',
    padding: '1rem 0.9rem',
    display: 'grid',
    gap: '0.9rem',
  },

  loadingState: {
    minHeight: '60vh',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.6rem',
    color: '#9deeff',
    fontSize: '0.8rem',
  },

  guestNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 0.8rem',
    borderRadius: '0.85rem',
    background: 'rgba(255,210,125,0.08)',
    border: '1px solid rgba(255,210,125,0.2)',
    color: '#ffd27d',
    fontSize: '0.72rem',
    fontWeight: 750,
  },

  message: {
    padding: '0.75rem 0.8rem',
    borderRadius: '0.85rem',
    background: 'rgba(130,233,193,0.08)',
    border: '1px solid rgba(130,233,193,0.2)',
    color: '#82e9c1',
    fontSize: '0.72rem',
    lineHeight: 1.45,
  },

  errorMessage: {
    background: 'rgba(255,79,122,0.08)',
    borderColor: 'rgba(255,79,122,0.22)',
    color: '#ffb1c8',
  },

  infoMessage: {
    background: 'rgba(77,215,255,0.08)',
    borderColor: 'rgba(77,215,255,0.2)',
    color: '#9deeff',
  },

  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  heroIcon: {
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '1rem',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
  },

  heroCopy: {
    minWidth: 0,
    flex: 1,
  },

  title: {
    margin: 0,
    fontSize: '1.08rem',
    fontWeight: 850,
  },

  subtitle: {
    margin: '0.25rem 0 0',
    color: '#96a3bf',
    fontSize: '0.74rem',
    lineHeight: 1.5,
  },

  unsavedBadge: {
    alignSelf: 'flex-start',
    padding: '0.3rem 0.45rem',
    borderRadius: '999px',
    background: 'rgba(255,210,125,0.12)',
    color: '#ffd27d',
    fontSize: '0.58rem',
    fontWeight: 850,
  },

  card: {
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    marginBottom: '0.8rem',
  },

  sectionIcon: {
    width: '2.15rem',
    height: '2.15rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))',
    color: '#dce8ff',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '0.92rem',
    fontWeight: 850,
  },

  photoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    marginBottom: '1rem',
  },

  avatar: {
    width: '5.6rem',
    height: '5.6rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    backgroundColor: '#202a43',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    color: '#dce8ff',
  },

  avatarRing: {
    border: '3px solid #7c5cff',
    boxShadow: '0 0 20px rgba(124,92,255,0.3)',
  },

  photoActions: {
    minWidth: 0,
    display: 'grid',
    gap: '0.25rem',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.7rem',
  },

  field: {
    display: 'grid',
    gap: '0.35rem',
    color: '#dce5f8',
    fontSize: '0.72rem',
    fontWeight: 800,
  },

  input: {
    width: '100%',
    minHeight: '2.65rem',
    boxSizing: 'border-box',
    padding: '0.65rem 0.7rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.1)',
    outline: 0,
    background: 'rgba(255,255,255,0.045)',
    color: '#f4f7ff',
    fontSize: '0.74rem',
  },

  disabledInput: {
    opacity: 0.55,
    cursor: 'not-allowed',
  },

  inputError: {
    borderColor: 'rgba(255,79,122,0.58)',
  },

  errorText: {
    color: '#ff9fba',
    fontSize: '0.63rem',
    fontWeight: 700,
  },

  placeholderBox: {
    minHeight: '3.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    marginTop: '0.8rem',
    borderRadius: '0.85rem',
    border: '1px dashed rgba(124,92,255,0.35)',
    background: 'rgba(124,92,255,0.06)',
    color: '#96a3bf',
    fontSize: '0.7rem',
  },

  settingsList: {
    display: 'grid',
    gap: '0.5rem',
  },

  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    padding: '0.75rem',
    borderRadius: '0.9rem',
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.04)',
  },

  disabledRow: {
    opacity: 0.55,
  },

  smallIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.1))',
    color: '#dce8ff',
  },

  rowCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.18rem',
    flex: 1,
  },

  checkbox: {
    width: '1.15rem',
    height: '1.15rem',
    flexShrink: 0,
    accentColor: '#7c5cff',
  },

  hiddenInput: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },

  buttonRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginTop: '0.35rem',
  },

  smallAction: {
    position: 'relative',
    minHeight: '2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0 0.55rem',
    border: '1px solid rgba(124,92,255,0.28)',
    borderRadius: '999px',
    background: 'rgba(124,92,255,0.1)',
    color: '#dce5f8',
    fontSize: '0.62rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  smallDangerAction: {
    minHeight: '2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0 0.55rem',
    border: '1px solid rgba(255,79,122,0.22)',
    borderRadius: '999px',
    background: 'rgba(255,79,122,0.08)',
    color: '#ffb1c8',
    fontSize: '0.62rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginTop: '0.7rem',
    padding: '0.7rem',
    borderRadius: '0.8rem',
    background: 'rgba(255,210,125,0.08)',
    border: '1px solid rgba(255,210,125,0.18)',
    color: '#ffd27d',
    fontSize: '0.68rem',
  },

  inlineButton: {
    border: 0,
    background: 'transparent',
    color: '#9deeff',
    fontSize: '0.66rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  infoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    padding: '0.65rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },

  infoLabel: {
    color: '#96a3bf',
    fontSize: '0.72rem',
  },

  infoValue: {
    color: '#dce5f8',
    fontSize: '0.72rem',
    textAlign: 'right',
  },

  verificationList: {
    display: 'grid',
    gap: '0.35rem',
    marginTop: '0.7rem',
  },

  verificationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.6rem',
    padding: '0.6rem 0.7rem',
    borderRadius: '0.7rem',
    background: 'rgba(255,255,255,0.04)',
    color: '#cbd6ec',
    fontSize: '0.7rem',
  },

  verificationStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    fontSize: '0.64rem',
    fontWeight: 800,
  },

  actionButton: {
    minHeight: '2.6rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    flex: '1 1 12rem',
    border: '1px solid rgba(124,92,255,0.25)',
    borderRadius: '0.8rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.17), rgba(77,215,255,0.08))',
    color: '#eaf0ff',
    fontSize: '0.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  disabledAction: {
    cursor: 'not-allowed',
  },

  dangerAction: {
    borderColor: 'rgba(255,79,122,0.22)',
    background: 'rgba(255,79,122,0.08)',
    color: '#ffb1c8',
  },

  primaryButton: {
    width: '100%',
    minHeight: '2.8rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    marginBottom: '0.5rem',
    border: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  toast: {
    position: 'fixed',
    right: '1rem',
    bottom: '6.2rem',
    left: '1rem',
    zIndex: 1200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    width: 'fit-content',
    maxWidth: 'calc(100% - 2rem)',
    margin: '0 auto',
    padding: '0.75rem 0.9rem',
    borderRadius: '999px',
    background: 'rgba(17,22,35,0.97)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#eaf0ff',
    fontSize: '0.72rem',
    fontWeight: 750,
  },

  toastClose: {
    width: '1.6rem',
    height: '1.6rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    color: '#aab6cf',
    cursor: 'pointer',
  },
};