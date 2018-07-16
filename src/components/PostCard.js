import React, { Component }  from 'react';
import { StyleSheet, Image } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button, Card, CardItem,
         Left, Right, Thumbnail, View,
         Icon, Body, Text, Badge } from 'native-base';

export const PostCard = (props) => {
  return (
      <Card style={styles.post}>
        <CardItem>
          <Left>
            <Thumbnail source={{ uri: props.content.avatar }} style={styles.avatar}/>
            <Body style={{ justifyContent: 'flex-start',flexDirection: 'row' }}>
              <Badge style={{ backgroundColor: 'white', alignSelf: 'flex-start'  }}>
                <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 12 }}>{ props.content.author }</Text>
              </Badge>
                <View style={ styles.badge }>
                  <Text style={styles.text}>{ props.content.author_reputation }</Text>
                </View>
                <View style={ styles.category }>
                  <Text style={styles.text}>{ props.content.category }</Text>
                </View>
              <Text style={{ alignSelf: 'center' }} note> { props.content.created } </Text>
            </Body>
          </Left>
        </CardItem>
        <Image source={{ uri: props.content.image }} style={styles.image}/>
        <CardItem>
          <Body>
            <Text style={styles.title}>
              { props.content.title }
            </Text>
          </Body>
        </CardItem>
        <CardItem>
          <Left>
            <Button transparent>
              <Icon active name="thumbs-up" />
              <Text>12 Likes</Text>
            </Button>
          </Left>
          <Body>
            <Button transparent>
              <Icon active name="ios-arrow-dropup-outline" />
              <Text>4 Comments</Text>
            </Button>
          </Body>
          <Right>
            <Text>11h ago</Text>
          </Right>
        </CardItem>
      </Card>
  )
}
const styles = StyleSheet.create({
  post: {
    shadowColor: 'white',
    padding: 0,
    marginRight: 0,
    marginLeft: 0,
    marginTop: 0,
    marginBottom: 0,
    borderWidth: 0,
    borderColor: 'white',
    borderRadius: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  title: {
    
  },
  image: {
    marginRight: 0,
    marginLeft: -2,
    marginTop: 0,
    marginBottom: 0,
    width: '101%',
    height: 200,
  },
  badge: {
    alignSelf: 'center',
    borderColor: 'lightgray',
    borderWidth: 1,
    borderRadius: 10,
    width: 20, 
    height: 20,
    padding: 3, 
    backgroundColor: 'lightgray',
    marginRight: 5
  },
  category: {
    alignSelf: 'center',
    borderRadius: 10,
    padding: 5, 
    backgroundColor: '#007EE5',
    marginRight: 5
  },
  text: {
    fontSize: 10, 
    alignSelf: 'center', 
    textAlignVertical: 'center',
    color: 'white'
  }
});