import { View, Text, Dimensions } from 'react-native';
import React from 'react';
import styles from './styles';
import {
    LineChart,
  } from "react-native-chart-kit";
import EStyleSheet from 'react-native-extended-stylesheet';

export interface CurrencyCardProps {
    chartData:number[]
    id:string,
    tokenName:string,
    notCryptoToken:boolean,
    tokenSymbol:string,
    currencySymbol:string,
    changePercent:number,
    currentValue:number,
    ownedTokens:number,
}

const CurrencyCard = ({
  id, 
  notCryptoToken, 
  chartData, 
  tokenName,
  currencySymbol,
  tokenSymbol,
  changePercent,
  currentValue,
  ownedTokens,
}:CurrencyCardProps) => {
  
  console.log(chartData);
  if(!notCryptoToken && !chartData.length){
    return null
  }

    const _renderHeader = (
        <View style={styles.cardHeader}>
            {/* <View style={styles.logo} /> */}
            <View style={styles.cardTitleContainer}>
                <Text style={styles.textTitle} >{id}</Text>
                <Text style={styles.textSubtitle}>{tokenName}</Text>
            </View>
            <Text  
              style={styles.textCurValue}>
                <Text style={{fontWeight:'500'}}>{`${ownedTokens} ${tokenSymbol}`}</Text>
                {`/${(ownedTokens * currentValue).toFixed(2)}${currencySymbol}`}
            </Text>
        </View>
    );


    const _renderGraph = () => {
      const _baseWidth = Dimensions.get("window").width - 32;
      const _chartWidth = _baseWidth + _baseWidth/(chartData.length -1)
      return (
        <View style={styles.chartContainer}>
          <LineChart 
            data={{
                labels: [],
                datasets: [
                  {
                    data:chartData
                  }
                ],
              }}
              width={_chartWidth} // from react-native
              height={130}
              withHorizontalLabels={true}
              withVerticalLabels={false}
              withDots={false}
              withInnerLines={false}
           
              
              chartConfig={{
                backgroundColor:EStyleSheet.value('$white'),
                backgroundGradientFrom: EStyleSheet.value('$white'),
                backgroundGradientTo: EStyleSheet.value('$white'),
                fillShadowGradient: EStyleSheet.value('$chartBlue'),
                fillShadowGradientOpacity:0.8,
                color: () => 'transparent',
              }}
            />
        </View>
    )}

    const _renderFooter = (
      <View style={styles.cardFooter}>
        <Text style={styles.textCurValue}>{`${currencySymbol} ${currentValue.toFixed(2)}`}</Text>
        <Text style={ changePercent > 0 ? styles.textDiffPositive : styles.textDiffNegative}>{`${changePercent > 0 ? '+':''}${changePercent.toFixed(1)}%`}</Text>
      </View>
    )

  return (
    <View style={styles.cardContainer}>
      {_renderHeader}
      {!notCryptoToken  && _renderGraph()}
      {!notCryptoToken && _renderFooter}
    </View>
  );
};

export default CurrencyCard;
