import React, { ComponentType, JSXElementConstructor, ReactElement, useEffect, useState } from 'react'
import { FlatList } from 'react-native-gesture-handler';
import { Transaction } from '../../../components';
import styles from './children.styles';

interface ActivitiesListProps {
    header:ComponentType<any> | ReactElement<any, string | JSXElementConstructor<any>>
    activities:any[];
}

const ActivitiesList = ({header, activities}:ActivitiesListProps) => {

  const _renderActivityItem = ({item, index}) => {
    return <Transaction item={item} index={index} />
  }

    return (
        <FlatList 
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={activities}
            renderItem={_renderActivityItem}
            keyExtractor={(item, index)=>`activity_item_${index}_${item.created}`}
            ListHeaderComponent={header}
        />
    )
}

export default ActivitiesList
