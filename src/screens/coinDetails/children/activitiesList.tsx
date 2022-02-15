import React, { ComponentType, JSXElementConstructor, ReactElement, useEffect, useState } from 'react'
import { FlatList } from 'react-native-gesture-handler';
import { Transaction } from '../../../components';
import styles from './children.styles';

interface ActivitiesListProps {
    header:ComponentType<any> | ReactElement<any, string | JSXElementConstructor<any>>
    activities:any[];
    filter:'Points'| 'HIVE'| 'HBD'| 'HP';
}

const ActivitiesList = ({header, activities, filter}:ActivitiesListProps) => {
    const [filteredActivities, setFilteredActivites] = useState([])

    //filter activities based on selection coin
    useEffect(() => {
        if (activities) {
            const _activities = activities
              ? activities.filter((item) => {
                  return (
                    item &&
                    item.value &&
                    item.value.includes(filter)
                  );
                })
              : [];
            setFilteredActivites(_activities);
        }else {
            setFilteredActivites([]);
        }
    }, [activities])


  const _renderActivityItem = ({item, index}) => {
    return <Transaction item={item} index={index} />
  }

    return (
        <FlatList 
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={filteredActivities}
            renderItem={_renderActivityItem}
            keyExtractor={(item, index)=>`activity_item_${index}_${item.created}`}
            ListHeaderComponent={header}
        />
    )
}

export default ActivitiesList
