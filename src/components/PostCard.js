import React, { Component }  from 'react';
import { Container, Card, CardItem,
         Left, Thumbnail, Image, Icon,
         Body, Text } from 'native-base';

const PostCard = (props) => {
  return (
    <Container>
      <Card>
        <CardItem>
          <Left>
            <Thumbnail source={{ uri: props.post.avatar }} />
            <Body>
              <Text>{ this.props.post.title }</Text>
              <Text note>April 15, 2016</Text>
            </Body>
          </Left>
        </CardItem>
      </Card>
    </Container>  
  )
}

export default PostCard;


