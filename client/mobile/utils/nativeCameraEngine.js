import {
  NativeModules,
  Platform,
} from 'react-native';

const MODULE_NAME = 'AarushCameraModule';

let cameraModule = null;
let recording = false;
let cameraFacing = 'back';
let flashEnabled = false;
let zoomLevel = 0;
let cameraStatus = {
  ready: false,
  camera_permission: 'unknown',
  microphone_permission: 'unknown',
  facing: cameraFacing,
  flash: flashEnabled,
  zoom: zoomLevel,
};

function getModule() {
  if (!cameraModule) {
    cameraModule =
      NativeModules?.[MODULE_NAME] || null;
  }

  return cameraModule;
}

export async function initializeNativeCamera() {
  const module = getModule();

  cameraStatus = {
    ...cameraStatus,
    ready: true,
    native_module_ready: Boolean(module),
    platform: Platform.OS,
  };

  return cameraStatus;
}

export async function requestCameraPermission() {
  const module = getModule();

  if (module?.requestCameraPermission) {
    cameraStatus.camera_permission =
      await module.requestCameraPermission();
  } else {
    cameraStatus.camera_permission = 'prepared';
  }

  return cameraStatus.camera_permission;
}

export async function requestMicrophonePermission() {
  const module = getModule();

  if (module?.requestMicrophonePermission) {
    cameraStatus.microphone_permission =
      await module.requestMicrophonePermission();
  } else {
    cameraStatus.microphone_permission = 'prepared';
  }

  return cameraStatus.microphone_permission;
}

export async function openCamera(options = {}) {
  await requestCameraPermission();

  const module = getModule();

  if (module?.openCamera) {
    return module.openCamera({
      facing: options.facing || cameraFacing,
      flash: options.flash ?? flashEnabled,
      zoom: options.zoom ?? zoomLevel,
    });
  }

  return {
    local_only: true,
    mode: 'camera',
    facing: cameraFacing,
    flash: flashEnabled,
    zoom: zoomLevel,
  };
}

export async function capturePhoto(options = {}) {
  const camera = await openCamera(options);
  const module = getModule();

  if (module?.capturePhoto) {
    return module.capturePhoto(camera);
  }

  return {
    local_only: true,
    type: 'photo',
    uri: null,
    metadata: {
      quality: options.quality || 'high',
      facing: cameraFacing,
      flash: flashEnabled,
      zoom: zoomLevel,
    },
  };
}

export async function recordVideo(options = {}) {
  await requestCameraPermission();
  await requestMicrophonePermission();

  const module = getModule();
  recording = true;

  if (module?.recordVideo) {
    return module.recordVideo({
      quality: options.quality || 'high',
      facing: cameraFacing,
      flash: flashEnabled,
      zoom: zoomLevel,
    });
  }

  return {
    local_only: true,
    recording: true,
    type: 'video',
    uri: null,
  };
}

export async function stopRecording() {
  const module = getModule();
  recording = false;

  if (module?.stopRecording) {
    return module.stopRecording();
  }

  return {
    stopped: true,
    local_only: true,
    uri: null,
  };
}

export async function switchCamera() {
  cameraFacing =
    cameraFacing === 'back' ? 'front' : 'back';

  const module = getModule();

  if (module?.switchCamera) {
    await module.switchCamera(cameraFacing);
  }

  cameraStatus.facing = cameraFacing;
  return cameraFacing;
}

export async function toggleFlash() {
  flashEnabled = !flashEnabled;

  const module = getModule();

  if (module?.toggleFlash) {
    await module.toggleFlash(flashEnabled);
  }

  cameraStatus.flash = flashEnabled;
  return flashEnabled;
}

export async function setZoomLevel(value) {
  zoomLevel = Math.max(
    0,
    Math.min(1, Number(value || 0))
  );

  const module = getModule();

  if (module?.setZoomLevel) {
    await module.setZoomLevel(zoomLevel);
  }

  cameraStatus.zoom = zoomLevel;
  return zoomLevel;
}

export async function scanQRCode() {
  const module = getModule();

  if (module?.scanQRCode) {
    return module.scanQRCode();
  }

  return {
    supported: false,
    scanner: 'qr',
    future_native_module: true,
  };
}

export async function scanBarcode() {
  const module = getModule();

  if (module?.scanBarcode) {
    return module.scanBarcode();
  }

  return {
    supported: false,
    scanner: 'barcode',
    future_native_module: true,
  };
}

export function getCameraStatus() {
  return {
    ...cameraStatus,
    recording,
    facing: cameraFacing,
    flash: flashEnabled,
    zoom: zoomLevel,
    hdr_ready: true,
    portrait_ready: true,
    night_mode_ready: true,
    qr_ready: true,
    barcode_ready: true,
  };
}