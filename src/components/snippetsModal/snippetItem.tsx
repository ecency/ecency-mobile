import * as React from 'react';
import { Text, View, Button } from 'react-native';
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
      <Text style={styles.title}>{`${title}`}</Text>
      <Text style={styles.body} numberOfLines={2} ellipsizeMode="tail">{`${body}`}</Text>
      <Button 
        title='Edit'
        onPress={onEditPress}
      />
      <Button
        title={'Remote'}
        onPress={onRemovePress}
      />
    </View>
  )
};

export default SnippetItem;