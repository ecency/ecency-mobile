import React, { Fragment } from 'react';
import { connect } from 'react-redux';

const FormattedCurrency = ({
  value,
  fixAt = 3,
  currency,
  isApproximate = false,
  isToken = false,
}) => {
  const { currencyRate, currencySymbol } = currency;
  const valueInCurrency = value * (isToken ? 1 : currencyRate);
  const toFixedValue = valueInCurrency.toFixed(fixAt);

  return (
    <Fragment key={toFixedValue.toString()}>
      {`${isApproximate ? '~' : ''}${currencySymbol} ${toFixedValue}`}
    </Fragment>
  );
};

const mapStateToProps = (state) => ({
  currency: state.application.currency,
});

export default connect(mapStateToProps)(FormattedCurrency);
