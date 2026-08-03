import { useEffect, useMemo, useState } from 'react';
import { supabase, TABLES, STORAGE, buildPostStoragePath, isValidPostImage, sanitizeCaption } from '../lib/supabase';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import ImagePicker from '../components/ImagePicker';
import ImagePreview from '../components/ImagePreview';
import UploadProgress from '../components/UploadProgress';
import CaptionInput from '../components/CaptionInput';
import UploadActions from '../components/UploadActions';

export default function UploadPage({ session, navigate, route, onPostCreated }) {
  const user = session?.user;

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const canUpload = useMemo(() => !!file && !uploading && !!user?.id, [file, uploading, user]);

  const resetForm = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setCaption('');
    setError('');
    setSuccess('');
    setStage('');
    setProgress(0);
    setUploading(false);
    setProcessing(false);
  };

  const handlePick = async (selectedFile) => {
    setError('');
    setSuccess('');
    setStage('');
    setProgress(0);

    if (!user?.id) {
      setError('You must be signed in to upload a post.');
      return;
    }

    setProcessing(true);

    try {
      if (!isValidPostImage(selectedFile)) {
        if (!selectedFile.type.startsWith('image/')) {
          throw new Error('Only image files are allowed.');
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
          throw new Error('Image must be 10 MB or smaller.');
        }
        throw new Error('Only JPG, JPEG, PNG, and WEBP images are supported.');
      }

      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreviewUrl(url);
    } catch (err) {
      setError(err?.message || 'Invalid file.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setError('');
    setSuccess('');
    setStage('');
    setProgress(0);
  };

  const handleCancel = () => {
    if (uploading) return;
    resetForm();
    navigate('home');
  };

  const handleUpload = async () => {
    if (!user?.id) {
      setError('You must be signed in to upload a post.');
      return;
    }

    if (!file) {
      setError('Please choose an image first.');
      return;
    }

    if (!isValidPostImage(file)) {
      setError('Invalid image selected.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setStage('Preparing upload...');
    setProgress(12);

    const path = buildPostStoragePath(user.id, file);
    const captionValue = sanitizeCaption(caption);

    try {
      setStage('Uploading image...');
      setProgress(35);

      const { error: uploadError } = await supabase.storage.from(STORAGE.posts).upload(path, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: '3600',
      });

      if (uploadError) throw uploadError;

      setProgress(72);
      setStage('Saving post...');

      const { data: publicData } = supabase.storage.from(STORAGE.posts).getPublicUrl(path);
      const imageUrl = publicData?.publicUrl;

      if (!imageUrl) {
        throw new Error('Could not generate public image URL.');
      }

      const { data: insertedPost, error: insertError } = await supabase
        .from(TABLES.posts)
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          caption: captionValue,
          likes_count: 0,
          comments_count: 0,
        })
        .select(
          `
            id,
            user_id,
            image_url,
            caption,
            likes_count,
            comments_count,
            created_at,
            profiles:profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          `
        )
        .single();

      if (insertError) throw insertError;

      setProgress(100);
      setStage('Done');
      setSuccess('Post uploaded successfully.');

      const author = Array.isArray(insertedPost.profiles) ? insertedPost.profiles[0] : insertedPost.profiles;

      const normalizedPost = {
        ...insertedPost,
        username: author?.username || 'you',
        full_name: author?.full_name || '',
        avatar_url: author?.avatar_url || '',
        is_liked: false,
      };

      onPostCreated?.(normalizedPost);
      setTimeout(() => {
        resetForm();
        navigate('home');
      }, 900);
    } catch (err) {
      setError(err?.message || 'Upload failed.');
      setStage('');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="screen-shell">
      <TopBar onSearch={() => navigate('search')} onMessages={() => navigate('notifications')} />

      <main className="content-shell">
        <div className="section-header">
          <div>
            <h2>Upload</h2>
            <p>Create a new post for the Aarush feed.</p>
          </div>
        </div>

        <div className="state-card upload-card">
          <UploadProgress stage={stage} progress={progress} error={error} success={success} />

          <ImagePicker onPick={handlePick} disabled={uploading} processing={processing} error={error && !file ? error : ''} />

          <ImagePreview file={file} previewUrl={previewUrl} onRemove={handleRemove} />

          <CaptionInput value={caption} onChange={setCaption} disabled={uploading} />

          <UploadActions
            onCancel={handleCancel}
            onUpload={handleUpload}
            uploading={uploading}
            canUpload={canUpload}
          />
        </div>
      </main>

      <BottomNav active={route} onNavigate={navigate} />
    </div>
  );
}