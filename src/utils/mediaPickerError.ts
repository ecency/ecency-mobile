import * as Sentry from '@sentry/react-native';

interface MediaPickerErrorContext {
  feature: string;
  action: 'openPicker' | 'openCamera';
  mediaType?: 'photo' | 'video' | 'mixed';
}

export const isMediaPickerCancellation = (error: any): boolean => {
  const code = String(error?.code || '').toUpperCase();
  const message = String(error?.message || '').toLowerCase();

  return (
    code === 'E_PICKER_CANCELLED' ||
    code === 'E_PICKER_CANCELLED_KEY' ||
    message.includes('cancelled') ||
    message.includes('canceled')
  );
};

export const reportMediaPickerError = (error: any, context: MediaPickerErrorContext) => {
  if (!error || isMediaPickerCancellation(error)) {
    return;
  }

  Sentry.captureException(error, (scope) => {
    scope.setTag('context', 'media-picker');
    scope.setTag('feature', context.feature);
    scope.setTag('action', context.action);
    if (context.mediaType) {
      scope.setTag('media_type', context.mediaType);
    }

    scope.setContext('mediaPickerError', {
      code: error?.code || null,
      message: error?.message || String(error),
      name: error?.name || null,
      stack: error?.stack || null,
    });

    return scope;
  });
};
