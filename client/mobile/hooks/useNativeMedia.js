import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  capturePhoto as captureNativePhoto,
  getCameraStatus,
  initializeNativeCamera,
  openCamera as openNativeCamera,
  recordVideo as recordNativeVideo,
  scanBarcode as scanNativeBarcode,
  scanQRCode as scanNativeQRCode,
  stopRecording,
} from '../utils/nativeCameraEngine';
import {
  getFileSystemStatus,
  initializeNativeFileSystem,
  pickDocument as pickNativeDocument,
  pickImage as pickNativeImage,
  pickVideo as pickNativeVideo,
  saveFile,
} from '../utils/nativeFileSystemEngine';

export default function useNativeMedia() {
  const [camera, setCamera] = useState(null);
  const [storage, setStorage] =
    useState(null);
  const [selectedMedia, setSelectedMedia] =
    useState(null);
  const [recording, setRecording] =
    useState(false);
  const [cameraPermission, setCameraPermission] =
    useState('unknown');
  const [storagePermission, setStoragePermission] =
    useState('unknown');
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refreshMedia = useCallback(async () => {
    try {
      setError('');

      const [
        cameraStatus,
        storageStatus,
      ] = await Promise.all([
        initializeNativeCamera(),
        initializeNativeFileSystem(),
      ]);

      setCamera({
        ...cameraStatus,
        ...getCameraStatus(),
      });
      setStorage({
        ...storageStatus,
        ...getFileSystemStatus(),
      });
      setLoading(false);
    } catch (refreshError) {
      setError(
        refreshError?.message ||
          'Unable to load native media status.'
      );
      setLoading(false);
    }
  }, []);

  const openCamera = useCallback(
    async (options = {}) => {
      const result =
        await openNativeCamera(options);
      setCamera(getCameraStatus());
      return result;
    },
    []
  );

  const capturePhoto = useCallback(
    async (options = {}) => {
      const result =
        await captureNativePhoto(options);
      setSelectedMedia(result);
      return result;
    },
    []
  );

  const recordVideo = useCallback(
    async (options = {}) => {
      setRecording(true);

      try {
        const result =
          await recordNativeVideo(options);
        setSelectedMedia(result);
        return result;
      } finally {
        setRecording(false);
      }
    },
    []
  );

  const pickImage = useCallback(async () => {
    const result = await pickNativeImage();
    setSelectedMedia(result);
    return result;
  }, []);

  const pickVideo = useCallback(async () => {
    const result = await pickNativeVideo();
    setSelectedMedia(result);
    return result;
  }, []);

  const pickDocument = useCallback(async () => {
    const result = await pickNativeDocument();
    setSelectedMedia(result);
    return result;
  }, []);

  const scanQRCode = useCallback(
    () => scanNativeQRCode(),
    []
  );

  const scanBarcode = useCallback(
    () => scanNativeBarcode(),
    []
  );

  const saveMedia = useCallback(
    (path, content, options = {}) =>
      saveFile(path, content, options),
    []
  );

  useEffect(() => {
    refreshMedia();
  }, [refreshMedia]);

  const computed = useMemo(
    () => ({
      cameraReady: Boolean(camera?.ready),
      storageReady: Boolean(storage?.ready),
      selectedMedia,
      recording,
      cameraPermission:
        camera?.camera_permission ||
        cameraPermission,
      storagePermission,
    }),
    [
      camera,
      cameraPermission,
      recording,
      selectedMedia,
      storage,
      storagePermission,
    ]
  );

  return {
    ...computed,
    camera,
    storage,
    loading,
    error,
    openCamera,
    capturePhoto,
    recordVideo,
    stopRecording,
    pickImage,
    pickVideo,
    pickDocument,
    scanQRCode,
    scanBarcode,
    saveMedia,
    refreshMedia,
  };
}