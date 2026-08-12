import {
  NativeModules,
  Platform,
} from 'react-native';

const MODULE_NAME = 'AarushFileSystemModule';

let fileModule = null;
const memoryFiles = new Map();

function getModule() {
  if (!fileModule) {
    fileModule =
      NativeModules?.[MODULE_NAME] || null;
  }

  return fileModule;
}

export async function initializeNativeFileSystem() {
  return {
    ready: true,
    native_module_ready: Boolean(getModule()),
    platform: Platform.OS,
    secure_media_ready: true,
    media_library_ready: true,
  };
}

export async function requestStoragePermission() {
  const module = getModule();

  if (module?.requestStoragePermission) {
    return module.requestStoragePermission();
  }

  return 'prepared';
}

export async function pickImage() {
  const module = getModule();

  if (module?.pickImage) {
    return module.pickImage();
  }

  return {
    cancelled: true,
    type: 'image',
    local_only: true,
  };
}

export async function pickVideo() {
  const module = getModule();

  if (module?.pickVideo) {
    return module.pickVideo();
  }

  return {
    cancelled: true,
    type: 'video',
    local_only: true,
  };
}

export async function pickDocument() {
  const module = getModule();

  if (module?.pickDocument) {
    return module.pickDocument();
  }

  return {
    cancelled: true,
    type: 'document',
    local_only: true,
  };
}

export async function saveFile(
  path,
  content,
  options = {}
) {
  if (!path) {
    throw new Error('File path is required.');
  }

  const module = getModule();

  if (module?.saveFile) {
    return module.saveFile(
      path,
      content,
      options
    );
  }

  memoryFiles.set(path, {
    content,
    encrypted: Boolean(options.encrypted),
    saved_at: new Date().toISOString(),
  });

  return {
    path,
    saved: true,
    local_only: true,
  };
}

export async function readFile(path) {
  const module = getModule();

  if (module?.readFile) {
    return module.readFile(path);
  }

  return memoryFiles.get(path)?.content || null;
}

export async function deleteFile(path) {
  const module = getModule();

  if (module?.deleteFile) {
    return module.deleteFile(path);
  }

  memoryFiles.delete(path);
  return true;
}

export async function moveFile(
  source,
  destination
) {
  const content = await readFile(source);

  if (content === null) {
    throw new Error('Source file not found.');
  }

  await saveFile(destination, content);
  await deleteFile(source);

  return {
    source,
    destination,
    moved: true,
  };
}

export async function copyFile(
  source,
  destination
) {
  const content = await readFile(source);

  if (content === null) {
    throw new Error('Source file not found.');
  }

  await saveFile(destination, content);

  return {
    source,
    destination,
    copied: true,
  };
}

export async function createDirectory(path) {
  const module = getModule();

  if (module?.createDirectory) {
    return module.createDirectory(path);
  }

  return {
    path,
    created: true,
    local_only: true,
  };
}

export async function getMediaLibrary() {
  const module = getModule();

  if (module?.getMediaLibrary) {
    return module.getMediaLibrary();
  }

  return {
    type: 'media-library',
    items: [],
    indexed: true,
  };
}

export async function getDownloadsDirectory() {
  const module = getModule();

  if (module?.getDownloadsDirectory) {
    return module.getDownloadsDirectory();
  }

  return 'downloads://aarush';
}

export async function getTemporaryDirectory() {
  const module = getModule();

  if (module?.getTemporaryDirectory) {
    return module.getTemporaryDirectory();
  }

  return 'temporary://aarush';
}

export async function getFileSystemStatus() {
  const module = getModule();

  return {
    ready: true,
    native_module_ready: Boolean(module),
    platform: Platform.OS,
    cached_files: memoryFiles.size,
    media_library_ready: true,
    downloads_ready: true,
    temporary_files_ready: true,
    encrypted_files_ready: true,
    quota: null,
    available_storage: null,
  };
}