import 'react-native-gesture-handler/jestSetup';

// Ensure dev-only code paths such as dynamic imports are skipped
global.__DEV__ = false;

// Mock Sentry to avoid loading native modules during tests
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  mobileReplayIntegration: jest.fn(() => ({})),
  feedbackIntegration: jest.fn(() => ({})),
  wrap: jest.fn((app) => app),
}));

// Provide a mock implementation for react-native-device-info
jest.mock('react-native-device-info', () =>
  require('react-native-device-info/jest/react-native-device-info-mock'),
);

// Mock NetInfo to prevent native module errors during tests
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock'),
);

// Mock Firebase messaging used in the app container
jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({
    onMessage: jest.fn(),
    setBackgroundMessageHandler: jest.fn(),
  })),
}));

// Mock version number module
jest.mock('react-native-version-number', () => ({
  appVersion: '0.0.0',
}));

// Mock receive sharing intent module
jest.mock('react-native-receive-sharing-intent', () => ({
  getReceivedFiles: jest.fn(),
  clearReceivedFiles: jest.fn(),
}));

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock Expo crypto
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn(),
}));

// Mock expo-image to avoid native dependency
jest.mock('expo-image', () => ({
  Image: 'Image',
}));

// Mock orientation locker
jest.mock('react-native-orientation-locker', () => ({
  addOrientationListener: jest.fn(),
  removeOrientationListener: jest.fn(),
  getDeviceOrientation: jest.fn(),
  lockToPortrait: jest.fn(),
  lockToLandscape: jest.fn(),
  getInitialOrientation: jest.fn(() => 'PORTRAIT'),
}));

// Mock background timer
jest.mock('react-native-background-timer', () => ({
  runBackgroundTimer: jest.fn(),
  stopBackgroundTimer: jest.fn(),
}));

// Mock image crop picker
jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn(),
  openCamera: jest.fn(),
  clean: jest.fn(),
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  check: jest.fn(),
  request: jest.fn(),
  PERMISSIONS: {},
  RESULTS: {},
  openSettings: jest.fn(),
}));

// Mock react-native-create-thumbnail
jest.mock('react-native-create-thumbnail', () => ({
  createThumbnail: jest.fn(),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock clipboard module
jest.mock('@react-native-clipboard/clipboard', () => ({
  getString: jest.fn(),
  setString: jest.fn(),
}));

// Mock react-native-webview
jest.mock('react-native-webview', () => 'WebView');

// Mock media controls
jest.mock('react-native-media-controls', () => ({
  __esModule: true,
  default: () => null,
  PLAYER_STATES: {},
}));

// Mock camera roll
jest.mock('@react-native-camera-roll/camera-roll', () => ({
  CameraRoll: {
    save: jest.fn(),
    getPhotos: jest.fn(),
  },
}));

// Mock rn-fetch-blob
jest.mock('rn-fetch-blob', () => ({
  fs: { dirs: { DocumentDir: '' } },
  config: () => ({
    fetch: jest.fn(() => Promise.resolve({ path: () => '' })),
  }),
}));

// Mock react-native-vision-camera to avoid requiring the native camera module
jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevices: jest.fn(() => ({ back: {}, front: {} })),
  useCameraPermission: jest.fn(() => ({ hasPermission: true, requestPermission: jest.fn() })),
}));

// Mock bootsplash to bypass native module in tests
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(),
  show: jest.fn(),
  getVisibilityStatus: jest.fn(() => 'visible'),
}));

// Mock Expo local authentication
jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock notifee to prevent native notification module loading
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    onForegroundEvent: jest.fn(),
    setBackgroundMessageHandler: jest.fn(),
    displayNotification: jest.fn(),
    requestPermission: jest.fn(() => Promise.resolve()),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
  },
}));
