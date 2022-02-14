import { View, Text, Dimensions } from 'react-native';
import React from 'react';
import styles from './children.styles';
import {
    LineChart,
  } from "react-native-chart-kit";
import EStyleSheet from 'react-native-extended-stylesheet';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SimpleChart } from '../../../components';

export interface CoinCardProps {
    chartData:number[]
    id:string,
    tokenName:string,
    notCryptoToken:boolean,
    tokenSymbol:string,
    currencySymbol:string,
    changePercent:number,
    currentValue:number,
    ownedTokens:number,
    onPress:()=>void
}

export const CoinCard = ({
  id, 
  notCryptoToken, 
  chartData, 
  tokenName,
  currencySymbol,
  tokenSymbol,
  changePercent,
  currentValue,
  ownedTokens,
  onPress
}:CoinCardProps) => {
  
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
      return (
        <View style={styles.chartContainer}>
          <SimpleChart 
            data={chartData}
            baseWidth={_baseWidth}
            showLine={false}
            chartHeight={130}
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
    <TouchableOpacity onPress={onPress}>
      <View style={styles.cardContainer}>
        {_renderHeader}
        {!notCryptoToken  && _renderGraph()}
        {!notCryptoToken ? _renderFooter : <View style={{height:12}} />}
      </View>
    </TouchableOpacity>

  );
};

