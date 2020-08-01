/* eslint-disable react/no-this-in-sfc */
import React, { useState, Fragment, useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import moment from 'moment';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { BoostIndicatorAnimation, MainButton, BasicHeader, ProductItemLine } from '..';
import ESTM_TAGS from '../../assets/estmTags.png';

// Styles
import styles from './spinGameStyles';

const SpinGameView = ({
  gameRight,
  score,
  isLoading,
  spinProduct,
  isProcessing,
  buyItem,
  nextDate,
  startGame,
}) => {
  const intl = useIntl();
  const [isSpinning, setIsSpinning] = useState(false);
  const calculateTimeLeft = () => {
    return moment.utc(moment(nextDate).diff(new Date())).format('H:m:ss');
  };
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setTimeout(() => {
      setTimeLeft(calculateTimeLeft);
    }, 3000);
  });

  const _handleOnSpinPress = () => {
    startGame('spin');

    setIsSpinning(true);

    this.spinTimeout = setTimeout(() => {
      clearTimeout(this.spinTimeout);
      setIsSpinning(false);
    }, 8 * 1000);
  };

  return (
    <Fragment>
      <BasicHeader title={intl.formatMessage({ id: 'free_estm.title' })} />
      <View style={styles.container}>
        <View style={styles.textWrapper}>
          {!isSpinning && !isLoading && (
            <Fragment>
              <Text style={styles.count}>{gameRight}</Text>
              <Text style={styles.countDesc}>
                {intl.formatMessage({ id: 'free_estm.spin_right' })}
              </Text>
            </Fragment>
          )}
        </View>
        <View style={styles.spinnerWrapper}>
          {!isSpinning && !isLoading && gameRight > 0 && (
            <Image source={ESTM_TAGS} style={styles.backgroundTags} />
          )}
          <BoostIndicatorAnimation key={gameRight} isSpinning={isSpinning} />

          {!isSpinning && score > 0 && (
            <View style={styles.descriptionWrapper}>
              <Fragment>
                <Text style={styles.description}>{`${score} Points`}</Text>
                <View style={styles.triangle} />
              </Fragment>
            </View>
          )}
        </View>
        <View style={styles.productWrapper}>
          {!isSpinning && !isLoading && (
            <Fragment>
              {gameRight > 0 ? (
                <MainButton
                  style={styles.spinButton}
                  onPress={_handleOnSpinPress}
                  text={intl.formatMessage({ id: 'free_estm.button' })}
                />
              ) : (
                <Fragment>
                  {spinProduct.map((product) => (
                    <ProductItemLine
                      key={`key-${get(product, 'productId').toString()}`}
                      product={product}
                      title={intl.formatMessage({ id: 'free_estm.get_spin' })}
                      disabled={isProcessing}
                      handleOnButtonPress={(id) => buyItem(id)}
                    />
                  ))}
                  <Text style={styles.nextDate}>
                    {`${intl.formatMessage({
                      id: 'free_estm.timer_text',
                    })} ${timeLeft}`}
                  </Text>
                </Fragment>
              )}
            </Fragment>
          )}
        </View>
      </View>
    </Fragment>
  );
};

export { SpinGameView as SpinGame };
/* eslint-enable */
