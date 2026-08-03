import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase, AVATARS_BUCKET } from '../lib/supabase';

const USERNAME_REGEX = /^[a-z0-9_]+$/;

function sanitizeUsername(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_]/g, '');
}

function getFileExtension(fileName = '') {
  const parts = fileName.split('.');
  if (parts.length < 2) return 'jpg';
  return parts.pop().toLowerCase();
}

function buildAvatarPath(userId, file) {
  const ext = getFileExtension(file.name);
  const timestamp = Date.now();
  return `${userId}/avatar-${timestamp}.${ext}`;
}

export default function Profile({ session }) {
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profile, setProfile] = useState({
    id: '',
    email: '',
    full_name: '',
    username: '',
    bio: '',
    avatar_url: '',
  });

  const [originalUsername, setOriginalUsername] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  const fileInputRef = useRef(null);

  const displayAvatar = useMemo(() => {
    return avatarPreview || profile.avatar_url || '';
  }, [avatarPreview, profile.avatar_url]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user?.id) return;

      setLoading(true);
      setMessage({ type: '', text: '' });
      setErrors({});

      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id, email, full_name, username, bio, avatar_url, created_at, updated_at')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!existingProfile) {
          const initialUsername = sanitizeUsername(
            user.user_metadata?.preferred_username ||
              user.user_metadata?.user_name ||
              user.email?.split('@')?.[0] ||
              ''
          );

          const newProfile = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            username: initialUsername,
            bio: '',
            avatar_url: user.user_metadata?.avatar_url || '',
          };

          const { error: insertError } = await supabase.from('profiles').insert(newProfile);
          if (insertError) throw insertError;

          if (active) {
            setProfile(newProfile);
            setOriginalUsername(initialUsername);
          }
        } else if (active) {
          setProfile({
            id: existingProfile.id,
            email: existingProfile.email || user.email || '',
            full_name: existingProfile.full_name || '',
            username: existingProfile.username || '',
            bio: existingProfile.bio || '',
            avatar_url: existingProfile.avatar_url || '',
          });
          setOriginalUsername(existingProfile.username || '');
        }
      } catch (err) {
        if (active) {
          setMessage({
            type: 'error',
            text: err?.message || 'Failed to load profile.',
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  const validateForm = () => {
    const nextErrors = {};

    const fullName = profile.full_name.trim();
    const username = sanitizeUsername(profile.username);

    if (!fullName) nextErrors.full_name = 'Full name is required.';
    if (!username) nextErrors.username = 'Username is required.';
    else if (username.length < 3) nextErrors.username = 'Username must be at least 3 characters.';
    else if (username.length > 24) nextErrors.username = 'Username must be 24 characters or less.';
    else if (!USERNAME_REGEX.test(username)) {
      nextErrors.username = 'Use only lowercase letters, numbers, and underscores.';
    }

    if (profile.bio && profile.bio.length > 160) {
      nextErrors.bio = 'Bio must be 160 characters or less.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const checkUsernameUnique = async (username) => {
    const normalized = sanitizeUsername(username);
    if (!normalized) return false;

    if (normalized === originalUsername) return true;

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', normalized)
      .neq('id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !data;
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setProfile((prev) => ({
      ...prev,
      [field]: field === 'username' ? sanitizeUsername(value) : value,
    }));

    setErrors((prev) => ({ ...prev, [field]: '' }));
    setMessage({ type: '', text: '' });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage({ type: '', text: '' });
    setErrors({});

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, avatar: 'Please choose a valid image file.' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: 'Image must be 5 MB or smaller.' }));
      return;
    }

    setUploadingAvatar(true);
    setAvatarFile(file);

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    try {
      const path = buildAvatarPath(user.id, file);

      const existingPath = profile.avatar_url?.includes('/storage/v1/object/public/')
        ? profile.avatar_url.split(`/object/public/${AVATARS_BUCKET}/`)[1]
        : null;

      if (existingPath) {
        await supabase.storage.from(AVATARS_BUCKET).remove([existingPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);

      setProfile((prev) => ({
        ...prev,
        avatar_url: publicData.publicUrl,
      }));
    } catch (err) {
      setAvatarPreview('');
      setAvatarFile(null);
      setErrors((prev) => ({
        ...prev,
        avatar: err?.message || 'Failed to upload avatar.',
      }));
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) return;

    try {
      setSaving(true);

      const normalizedUsername = sanitizeUsername(profile.username);

      const unique = await checkUsernameUnique(normalizedUsername);
      if (!unique) {
        setErrors((prev) => ({
          ...prev,
          username: 'That username is already taken.',
        }));
        return;
      }

      const updatePayload = {
        full_name: profile.full_name.trim(),
        username: normalizedUsername,
        bio: profile.bio.trim(),
        avatar_url: profile.avatar_url || '',
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile((prev) => ({
        ...prev,
        username: normalizedUsername,
        full_name: prev.full_name.trim(),
        bio: prev.bio.trim(),
      }));
      setOriginalUsername(normalizedUsername);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      const msg = err?.message || 'Failed to save profile.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Logout failed.' });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-shell">
        <div className="profile-card">
          <div className="skeleton header" />
          <div className="skeleton avatar" />
          <div className="skeleton line" />
          <div className="skeleton line" />
          <div className="skeleton line" />
          <div className="skeleton button" />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-shell">
      <div className="profile-card">
        <div className="profile-header">
          <div>
            <h1>Profile</h1>
            <p>Manage your public identity and account details.</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleLogout}
            disabled={saving || uploadingAvatar}
          >
            Logout
          </button>
        </div>

        {message.text ? (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message.text}
          </div>
        ) : null}

        <form onSubmit={handleSave} className="profile-form">
          <div className="avatar-section">
            <div className="avatar-wrap" onClick={handleAvatarClick} role="button" tabIndex={0}>
              {displayAvatar ? (
                <img src={displayAvatar} alt="Avatar preview" className="avatar-img" />
              ) : (
                <div className="avatar-fallback">
                  {profile.full_name?.trim()?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="avatar-overlay">
                {uploadingAvatar ? 'Uploading...' : 'Change photo'}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden-input"
              onChange={handleAvatarSelect}
            />

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar || saving}
            >
              {uploadingAvatar ? 'Uploading...' : 'Upload avatar'}
            </button>

            {errors.avatar ? <span className="field-error">{errors.avatar}</span> : null}
          </div>

          <div className="grid">
            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                value={profile.full_name}
                onChange={handleChange('full_name')}
                placeholder="Your full name"
                maxLength={80}
                autoComplete="name"
              />
              {errors.full_name ? <span className="field-error">{errors.full_name}</span> : null}
            </label>

            <label className="field">
              <span>Username</span>
              <input
                type="text"
                value={profile.username}
                onChange={handleChange('username')}
                placeholder="your_username"
                maxLength={24}
                autoComplete="username"
                inputMode="text"
              />
              <div className="field-help">Lowercase letters, numbers, and underscores only.</div>
              {errors.username ? <span className="field-error">{errors.username}</span> : null}
            </label>

            <label className="field field-full">
              <span>Bio</span>
              <textarea
                value={profile.bio}
                onChange={handleChange('bio')}
                placeholder="Write a short bio..."
                maxLength={160}
                rows={4}
              />
              <div className="field-help">{profile.bio.length}/160</div>
              {errors.bio ? <span className="field-error">{errors.bio}</span> : null}
            </label>

            <label className="field field-full">
              <span>Email</span>
              <input type="email" value={profile.email} readOnly disabled />
            </label>
          </div>

          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={saving || uploadingAvatar}>
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}