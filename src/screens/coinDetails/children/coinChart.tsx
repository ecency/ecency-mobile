import React, { useEffect, useState } from 'react'
import { View, Dimensions } from 'react-native'
import { SimpleChart } from '../../../components'
import styles, { CHART_NEGATIVE_MARGIN } from './children.styles'

export const CoinChart = () => {

    const [from, setFrom] = useState(0);

    useEffect(() => {
        let min = Number.MAX_VALUE;
        let max = 0;
        CHART_DATA.forEach((val)=>{
            if(val < min){
                min = val;
            }

            if(val > max){
                max = val;
            }
        })

        const diff = max - min;
        setFrom(min - (diff * 0.3));

    }, [])

    const _renderGraph = () => {
        const _baseWidth = Dimensions.get("window").width - 32 + CHART_NEGATIVE_MARGIN;
        return (
          <View style={styles.chartContainer}>
            <SimpleChart 
                data={CHART_DATA}
                baseWidth={_baseWidth} // from react-native
                chartHeight={200}
                showLine={true}
                showLabels={true}
              />
          </View>
      )}
    return (
        <View style={styles.card}>
            {_renderGraph()}
        </View>
    )
}

const CHART_DATA = [
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
        1644019200000,
        1.1191111700809502
      ],
      [
        1644105600000,
        1.1913425380739
      ],
      [
        1644192000000,
        1.2294271885832133
      ],
      [
        1644278400000,
        1.2478837581918967
      ],
      [
        1644364800000,
        1.2010842601365885
      ],
      [
        1644451200000,
        1.180185002237196
      ],
      [
        1644537600000,
        1.1255145830154643
      ],
      [
        1644624000000,
        1.0889391869544809
      ],
      [
        1644710400000,
        1.0608665319539667
      ],
      [
        1644796800000,
        1.0830413804669103
      ],
      [
        1644850711000,
        1.0617638577051183
      ]
].map((item)=>item[1]).reverse()
