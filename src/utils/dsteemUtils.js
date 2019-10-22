import createIntl from './createIntl';
export const getDateErrorMessage = (trxTime, now) => {
  const intl = createIntl();
  console.log('intl :', intl);
  return `${intl.formatMessage({
    id: 'dsteem.date_error.device_time',
  })} ${trxTime} \n ${intl.formatMessage({
    id: 'dsteem.date_error.current_time',
  })} ${now} \n \n ${intl.formatMessage({ id: 'dsteem.date_error.information' })}`;
};
