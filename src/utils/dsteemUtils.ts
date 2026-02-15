import createIntl from './createIntl';

export const getDsteemDateErrorMessage = (error: any): string => {
  const intl = createIntl();

  const stackData = error?.jse_info?.stack?.[0]?.data;
  const trxTime = stackData?.['trx.expiration'] ?? stackData?.trx_expiration;
  const now = stackData?.now;

  const parts: string[] = [];
  if (trxTime) {
    parts.push(`${intl.formatMessage({ id: 'dsteem.date_error.device_time' })} ${trxTime}`);
  }
  if (now) {
    parts.push(`${intl.formatMessage({ id: 'dsteem.date_error.current_time' })} ${now}`);
  }
  parts.push(intl.formatMessage({ id: 'dsteem.date_error.information' }));

  return parts.join(' \n ');
};
