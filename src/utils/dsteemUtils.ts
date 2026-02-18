import createIntl from './createIntl';

export const getDsteemDateErrorMessage = (error: any): string => {
  const intl = createIntl();

  const stack = Array.isArray(error?.jse_info?.stack) ? error.jse_info.stack : [];
  const stackData = stack.find((frame: any) => frame?.data)?.data || {};

  const normalizeValue = (value: any): string | undefined => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const str = String(value).trim();
    if (!str || str === 'undefined' || str === 'null') {
      return undefined;
    }
    return str;
  };

  const trxTime = normalizeValue(stackData?.['trx.expiration'] ?? stackData?.trx_expiration);
  const now = normalizeValue(stackData?.now);

  const parts: string[] = [];
  if (trxTime) {
    parts.push(`${intl.formatMessage({ id: 'dsteem.date_error.device_time' })} ${trxTime}`);
  }
  if (now) {
    parts.push(`${intl.formatMessage({ id: 'dsteem.date_error.current_time' })} ${now}`);
  }
  parts.push(intl.formatMessage({ id: 'dsteem.date_error.information' }));
  parts.push(intl.formatMessage({ id: 'dsteem.date_error.server_hint' }));

  return parts.join(' \n ');
};
