import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { selectCurrency } from '../../../redux/selectors';

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
  currency: selectCurrency(state),
});

export default connect(mapStateToProps)(FormattedCurrency);
