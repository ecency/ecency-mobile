import { View, Text, Dimensions } from 'react-native';
import React, { ComponentType } from 'react';
import styles from './children.styles';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SimpleChart } from '../../../components';

export interface CoinCardProps {
    chartData:number[]
    name:string,
    notCrypto:boolean,
    symbol:string,
    currencySymbol:string,
    changePercent:number,
    currentValue:number,
    ownedTokens:number,
    footerComponent:ComponentType<any>
    onPress:()=>void
}

export const CoinCard = ({
  notCrypto, 
  chartData, 
  name,
  currencySymbol,
  symbol,
  changePercent,
  currentValue,
  ownedTokens,
  footerComponent,
  onPress
}:CoinCardProps) => {
  

  if(!notCrypto && !chartData.length){
    return null
  }

    const _renderHeader = (
        <View style={styles.cardHeader}>
            {/* <View style={styles.logo} /> */}
            <View style={styles.cardTitleContainer}>
                <Text style={styles.textTitle} >{symbol}</Text>
                <Text style={styles.textSubtitle}>{name}</Text>
            </View>
            <Text  
              style={styles.textCurValue}>
                <Text style={{fontWeight:'500'}}>{`${ownedTokens.toFixed(3)} ${symbol}`}</Text>
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
        {!notCrypto  && _renderGraph()}
        {!notCrypto ? _renderFooter : <View style={{height:12}} />}
        {footerComponent && footerComponent}
      </View>
      
    </TouchableOpacity>

  );
};

