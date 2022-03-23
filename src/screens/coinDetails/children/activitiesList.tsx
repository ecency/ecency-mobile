import React, { ComponentType, JSXElementConstructor, ReactElement } from 'react'
import { useIntl } from 'react-intl';
import { SectionList, Text } from 'react-native';
import { Transaction } from '../../../components';
import { CoinActivity } from '../../../redux/reducers/walletReducer';
import styles from './children.styles';

interface ActivitiesListProps {
  header: ComponentType<any> | ReactElement<any, string | JSXElementConstructor<any>>
  pendingActivities: CoinActivity[];
  completedActivities: CoinActivity[]
}

const ActivitiesList = ({ header, completedActivities, pendingActivities }: ActivitiesListProps) => {
  const intl = useIntl();

  const _renderActivityItem = ({ item, index }) => {
    return <Transaction item={item} index={index} />
  }

  const sections = [];

  if (pendingActivities && pendingActivities.length) {
    sections.push({
      title: 'Pending Requests',
      data: pendingActivities
    })
  }


  sections.push({
    title: intl.formatMessage({id:'wallet.activities'}),
    data: completedActivities || []
  })



  return (
    <SectionList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      sections={sections}
      renderItem={_renderActivityItem}
      keyExtractor={(item, index) => `activity_item_${index}_${item.created}`}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.textActivities}>{title}</Text>
      )}
      ListHeaderComponent={header}
    />
  )
}

export default ActivitiesList
