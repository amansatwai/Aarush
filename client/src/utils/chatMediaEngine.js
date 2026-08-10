import { supabase } from '../lib/supabase';

const CHAT_MEDIA_BUCKET = 'chat-media';

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/zip',
  'application/octet-stream',
];

function isGuestMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.localStorage.getItem('aarush_is_guest') === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) !== null
  );
}

async function getAuthenticatedUser() {
  if (isGuestMode()) {
    throw new Error(
      'Sign in to upload chat media.'
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      'Authentication is required to upload media.'
    );
  }

  return user;
}

function randomId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
}

function getExtension(file) {
  const extension = file?.name
    ?.split('.')
    .pop()
    ?.toLowerCase();

  if (extension && extension !== file.name?.toLowerCase()) {
    return extension.replace(/[^a-z0-9]/g, '');
  }

  const mimeExtensionMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'audio/webm': 'webm',
    'audio/mp4': 'm4a',
    'audio/mpeg': 'mp3',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
  };

  return mimeExtensionMap[file?.type] || 'bin';
}

export function getMediaTypeFromFile(file) {
  if (!file?.type) {
    return 'file';
  }

  if (file.type.startsWith('image/')) {
    return 'image';
  }

  if (file.type.startsWith('video/')) {
    return 'video';
  }

  if (file.type.startsWith('audio/')) {
    return 'audio';
  }

  return 'file';
}

export function validateChatMedia(file) {
  if (!file) {
    return {
      valid: false,
      error: 'Please select a file.',
    };
  }

  if (!file.size || file.size <= 0) {
    return {
      valid: false,
      error: 'The selected file is empty.',
    };
  }

  const isImage = file.type?.startsWith('image/');
  const isVideo = file.type?.startsWith('video/');
  const isAudio = file.type?.startsWith('audio/');
  const isDocument =
    ALLOWED_MIME_TYPES.includes(file.type) ||
    file.type?.startsWith('text/');

  if (!isImage && !isVideo && !isAudio && !isDocument) {
    return {
      valid: false,
      error:
        'This file type is not supported in chat.',
    };
  }

  if (isAudio && file.size > MAX_AUDIO_SIZE) {
    return {
      valid: false,
      error: 'Audio files must be 25 MB or smaller.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Files must be 100 MB or smaller.',
    };
  }

  return {
    valid: true,
    error: '',
  };
}

function getUploadPath(userId, conversationId, file) {
  const extension = getExtension(file);

  return [
    userId,
    conversationId || 'direct',
    `${Date.now()}-${randomId()}.${extension}`,
  ].join('/');
}

function createMetadata(file, mediaUrl, storagePath) {
  return {
    mediaUrl,
    storagePath,
    mediaType: getMediaTypeFromFile(file),
    fileName: file.name || 'chat-media',
    fileSize: file.size || 0,
    mimeType: file.type || 'application/octet-stream',
    duration: null,
  };
}

export async function uploadChatMedia({
  file,
  conversationId,
  onProgress,
}) {
  const user = await getAuthenticatedUser();

  const validation = validateChatMedia(file);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const storagePath = getUploadPath(
    user.id,
    conversationId,
    file
  );

  onProgress?.(5);

  const { error: uploadError } = await supabase.storage
    .from(CHAT_MEDIA_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      contentType:
        file.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  onProgress?.(78);

  const { data: publicUrlData } = supabase.storage
    .from(CHAT_MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  const mediaUrl = publicUrlData?.publicUrl;

  if (!mediaUrl) {
    await supabase.storage
      .from(CHAT_MEDIA_BUCKET)
      .remove([storagePath]);

    throw new Error(
      'Unable to generate the chat media URL.'
    );
  }

  onProgress?.(100);

  return createMetadata(
    file,
    mediaUrl,
    storagePath
  );
}

export async function uploadVoiceNote({
  blob,
  conversationId,
  fileName = 'voice-note.webm',
  onProgress,
}) {
  if (!blob) {
    throw new Error('No voice recording was provided.');
  }

  const file = new File(
    [blob],
    fileName,
    {
      type: blob.type || 'audio/webm',
      lastModified: Date.now(),
    }
  );

  return uploadChatMedia({
    file,
    conversationId,
    onProgress,
  });
}

export async function uploadFile({
  file,
  conversationId,
  onProgress,
}) {
  return uploadChatMedia({
    file,
    conversationId,
    onProgress,
  });
}

export function getChatMediaUrl(storagePath) {
  if (!storagePath) {
    return '';
  }

  const { data } = supabase.storage
    .from(CHAT_MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  return data?.publicUrl || '';
}

export async function deleteChatMedia(
  storagePath
) {
  const user = await getAuthenticatedUser();

  if (!storagePath) {
    throw new Error('Storage path is required.');
  }

  if (!storagePath.startsWith(`${user.id}/`)) {
    throw new Error(
      'You can only delete your own chat media.'
    );
  }

  const { error } = await supabase.storage
    .from(CHAT_MEDIA_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw error;
  }

  return true;
}

export async function downloadChatMedia({
  mediaUrl,
  fileName = 'chat-media',
}) {
  if (!mediaUrl) {
    throw new Error('Media URL is required.');
  }

  const response = await fetch(mediaUrl);

  if (!response.ok) {
    throw new Error('Unable to download chat media.');
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);

  return true;
}

export async function getFileMetadata(file) {
  if (!file) {
    return null;
  }

  const metadata = {
    fileName: file.name || 'chat-media',
    fileSize: file.size || 0,
    mimeType: file.type || 'application/octet-stream',
    mediaType: getMediaTypeFromFile(file),
    duration: null,
  };

  if (
    file.type?.startsWith('audio/') ||
    file.type?.startsWith('video/')
  ) {
    metadata.duration = await new Promise((resolve) => {
      const element = document.createElement(
        file.type.startsWith('audio/')
          ? 'audio'
          : 'video'
      );

      const objectUrl = URL.createObjectURL(file);

      element.preload = 'metadata';
      element.src = objectUrl;

      element.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(
          Number.isFinite(element.duration)
            ? element.duration
            : null
        );
      };

      element.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
    });
  }

  return metadata;
}

export function getChatMediaBucketName() {
  return CHAT_MEDIA_BUCKET;
}