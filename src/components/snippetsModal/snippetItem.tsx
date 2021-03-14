import * as React from 'react';
import { Text, View } from 'react-native';
import styles from './snippetsModalStyles';

interface SnippetItemProps {
    title:string;
    body:string;
    index:number;
    onEditPress:()=>void;
}

const SnippetItem = ({title, body, index}: SnippetItemProps) => {
  return (
    <View style={[styles.itemWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
      <Text style={styles.title}>{`${title}`}</Text>
      <Text style={styles.body} numberOfLines={2} ellipsizeMode="tail">{`${body}`}</Text>
    </View>
  )
};

export default SnippetItem;