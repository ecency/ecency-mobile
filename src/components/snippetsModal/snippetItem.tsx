import * as React from 'react';
import { Text, View, Button } from 'react-native';
import IconButton from '../iconButton';
import styles from './snippetsModalStyles';

interface SnippetItemProps {
    title:string;
    body:string;
    index:number;
    onEditPress:()=>void;
    onRemovePress:()=>void;
}

const SnippetItem = ({title, body, index, onEditPress, onRemovePress}: SnippetItemProps) => {
  return (
    <View style={[styles.itemWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
      <View style={styles.itemHeader}>
        <Text style={styles.title} numberOfLines={1} >{`${title}`}</Text>
        <IconButton
          iconStyle={styles.itemIcon}
          style={styles.itemIconWrapper}
          iconType="MaterialCommunityIcons"
          name="pencil"
          onPress={onEditPress}
          size={20}
        />
        <IconButton
          iconStyle={styles.itemIcon}
          style={styles.itemIconWrapper}
          iconType="MaterialCommunityIcons"
          name="delete"
          onPress={onRemovePress}
          size={20}
        />
      </View>
      
      <Text style={styles.body} numberOfLines={2} ellipsizeMode="tail">{`${body}`}</Text>
  
    </View>
  )
};

export default SnippetItem;