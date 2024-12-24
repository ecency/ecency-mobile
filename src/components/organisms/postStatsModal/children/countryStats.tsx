import { usePostStatsByCountryQuery } from "../../../../providers/queries"
import React from "react"
import { View, Text } from "react-native"
import styles from '../styles/countryStats.styles'


export const CountryStats = ({ urlPath }: { urlPath: string }) => {

    const statsByCountryQuery = usePostStatsByCountryQuery(urlPath)

    return (
        <View style={styles.container}>
            {statsByCountryQuery.data?.map((stat) => (
                <View key={stat.country} style={styles.statWrapper}>
                    <Text style={styles.statLabel}>
                        {stat.country}
                    </Text>
                    <Text style={styles.statValue}>
                        {stat.stats.pageviews + ' Views'}
                    </Text>
                </View>
            ))}

        </View>
    )
}