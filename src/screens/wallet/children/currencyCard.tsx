import { View, Text, Dimensions } from 'react-native';
import React from 'react';
import styles from './styles';
import {
    LineChart,

  } from "react-native-chart-kit";
import EStyleSheet from 'react-native-extended-stylesheet';

interface CurrencyCardProps {
    id:string
}

const CurrencyCard = ({id}:CurrencyCardProps) => {

  const data = DUMMY_HIVE.map((item)=>item[1]);
  const baseWidth = Dimensions.get("window").width - 32;
  const chartWidth = baseWidth + baseWidth/(data.length -1)

    const _renderHeader = (
        <View style={styles.cardHeader}>
            <View style={styles.logo} />
            <View style={styles.cardTitleContainer}>
                <Text>{id.toUpperCase()}</Text>
                <Text>{'Ecency Points'}</Text>
            </View>
            <Text><Text style={{fontWeight:'bold'}}>{'5.17 ETH'}</Text>{'/$10.64'}</Text>
        </View>
    );


    const _renderGraph = (
      <View style={styles.chartContainer}>
        <LineChart 
          data={{
              labels:['as','ghg','fgf'],
              datasets: [
                {
                  data
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
              backgroundColor:EStyleSheet.value('$primaryLightBlue'),
              backgroundGradientFrom: EStyleSheet.value('$primaryLightBlue'),
              backgroundGradientTo: EStyleSheet.value('$primaryLightBlue'),
              fillShadowGradient: EStyleSheet.value('$primaryBlue'),
              fillShadowGradientOpacity:0.8,
              color: (opacity = 1) => 'transparent',
            }}
          />
      </View>
     
    )

  return (
    <View style={styles.cardContainer}>
      {_renderHeader}
      {_renderGraph}
    </View>
  );
};

export default CurrencyCard;


const DUMMY_HIVE = [
    [
      1641427200000,
      1.55861899055045
    ],
    [
      1641513600000,
      1.5095178512777354
    ],
    [
      1641600000000,
      1.3935547973197175
    ],
    [
      1641686400000,
      1.3566936995201457
    ],
    [
      1641772800000,
      1.3665204670296633
    ],
    [
      1641859200000,
      1.2894281063457327
    ],
    [
      1641945600000,
      1.3327080127770612
    ],
    [
      1642032000000,
      1.4063258743306843
    ],
    [
      1642118400000,
      1.3171980429547225
    ],
    [
      1642204800000,
      1.3303864058211017
    ],
    [
      1642291200000,
      1.3428898215662057
    ],
    [
      1642377600000,
      1.3351678528969129
    ],
    [
      1642464000000,
      1.2749425473242615
    ],
    [
      1642550400000,
      1.2258748579053047
    ],
    [
      1642636800000,
      1.1522017088554435
    ],
    [
      1642723200000,
      1.087432032619008
    ],
    [
      1642809600000,
      0.9222835552405058
    ],
    [
      1642896000000,
      0.8129802124971723
    ],
    [
      1642982400000,
      0.8415726660928751
    ],
    [
      1643068800000,
      0.8488466667559603
    ],
    [
      1643155200000,
      0.8505431837963656
    ],
    [
      1643241600000,
      0.8770820205186732
    ],
    [
      1643328000000,
      0.8948392884061332
    ],
    [
      1643414400000,
      0.9452860097843626
    ],
    [
      1643500800000,
      0.9630356286077462
    ],
    [
      1643587200000,
      0.9592456765509505
    ],
    [
      1643673600000,
      0.9742561651887766
    ],
    [
      1643760000000,
      0.9680029802915636
    ],
    [
      1643846400000,
      0.9546563904418895
    ],
    [
      1643932800000,
      1.0731739971075753
    ],
    [
      1644000835000,
      1.0764904471859396
    ],[
        1644000835000,
        0
    ]
  ].reverse()