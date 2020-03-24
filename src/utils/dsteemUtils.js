import createIntl from './createIntl';

export const getDsteemDateErrorMessage = (error) => {
  const intl = createIntl();
  const trxTime = error.jse_info.stack[0].data['trx.expiration'];
  const { now } = error.jse_info.stack[0].data;

  return `${intl.formatMessage({
    id: 'dsteem.date_error.device_time',
  })} ${trxTime} \n ${intl.formatMessage({
    id: 'dsteem.date_error.current_time',
  })} ${now} \n \n ${intl.formatMessage({ id: 'dsteem.date_error.information' })}`;
};
