import React, { Fragment } from 'react';
import { connect } from 'react-redux';

const FormattedCurrency = ({ value, fixAt = 3, currency }) => {
  const { currencyRate, currencySymbol } = currency;
  const valueInCurrency = value * currencyRate;
  const toFixedValue = valueInCurrency.toFixed(fixAt);

  return <Fragment key={toFixedValue.toString()}>{`${currencySymbol} ${toFixedValue}`}</Fragment>;
};

const mapStateToProps = state => ({
  currency: state.application.currency,
});

export default connect(mapStateToProps)(FormattedCurrency);
