import { View, Text, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import styles from './styles';
import {
    LineChart,
  } from "react-native-chart-kit";
import EStyleSheet from 'react-native-extended-stylesheet';
import { fetchMarketChart } from '../../../providers/coingecko/coingecko';

interface CurrencyCardProps {
    id:string,
    notToken:boolean
}

const CurrencyCard = ({id, notToken}:CurrencyCardProps) => {

  const [prices, setPrices] = useState<number[]>([]);


  useEffect(()=>{
    if(!notToken){
      _fetchData();
    }
  },[id])


  const _fetchData = async () => {
    try{
      const _data = await fetchMarketChart(id, 'usd', 30)
      const _prices = _data.prices.map(item=>item.yValue).reverse();
      setPrices(_prices)
    } catch(err){
      console.warn("failed to fetch market data", err)
    }
  }

  const baseWidth = Dimensions.get("window").width - 32;
  const chartWidth = baseWidth + baseWidth/(prices.length -1)

    const _renderHeader = (
        <View style={styles.cardHeader}>
            <View style={styles.logo} />
            <View style={styles.cardTitleContainer}>
                <Text style={styles.textTitle} >{id.toUpperCase()}</Text>
                <Text style={styles.textSubtitle}>{'Ecency Points'}</Text>
            </View>
            <Text  style={styles.textCurValue}><Text style={{fontWeight:'500'}}>{'5.17 ETH'}</Text>{'/$10.64'}</Text>
        </View>
    );


    const _renderGraph = (
      <View style={styles.chartContainer}>
        <LineChart 
          data={{
              datasets: [
                {
                  data:prices
                }
              ],
            }}
            width={chartWidth} // from react-native
            height={130}
            withHorizontalLabels={true}
            withVerticalLabels={false}
            withDots={false}
            withInnerLines={false}
            fromZero
            chartConfig={{
              backgroundColor:EStyleSheet.value('$white'),
              backgroundGradientFrom: EStyleSheet.value('$white'),
              backgroundGradientTo: EStyleSheet.value('$white'),
              fillShadowGradient: EStyleSheet.value('$chartBlue'),
              fillShadowGradientOpacity:0.8,
              color: (opacity = 1) => 'transparent',
            }}
          />
      </View>
     
    )

    const _renderFooter = (
      <View style={styles.cardFooter}>
        <Text style={styles.textCurValue}>$12.3</Text>
        <Text style={styles.textDiffPositive}>+11%</Text>
      </View>
    )

  return (
    <View style={styles.cardContainer}>
      {_renderHeader}
      {!notToken && _renderGraph}
      {!notToken && _renderFooter}
    </View>
  );
};

export default CurrencyCard;
